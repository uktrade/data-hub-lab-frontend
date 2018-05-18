const hawk = require( 'hawk' );
const request = require( 'request' );
const crypto = require( 'crypto' );
const reporter =require( '../lib/reporter' );
const redisClient = require( '../lib/redis-client' );
const config = require( '../config' );
const logger = require( './logger' );
const getCacheTime = require( '../lib/get-cache-time' );

const credentials = {
	id: config.backend.user,
	key: config.backend.key,
	algorithm: 'sha256'
};

const redis = redisClient.get();

function createRedisKey( method, path, data ){

	const hash = crypto.createHash( 'sha256' );
	hash.update( method + path );

	if( data ){

		hash.update( data );
	}

	return hash.digest();
}

function createRequestOptions( uri, method, opts ){

	let clientHeader;
	let payload = '';

	if( opts.data ){

		try {

			payload = JSON.stringify( opts.data );

		} catch( e ){

			logger.debug( 'Unable to stringify JSON' );
			reporter.captureException( e );
		}
	}

	try {

		// Generate Authorization request header
		clientHeader = hawk.client.header( uri, method, {
			credentials,
			payload,
			contentType: ( payload ? 'application/json' : '' )
		} );

	} catch( e ){

		throw e;
	}

	if( !clientHeader ){

		throw new Error( 'Unable to create header' );
	}

	const requestOptions = {
		uri,
		method,
		headers: {
			Authorization: clientHeader.header
		}
	};

	if( opts.data ){
		//manually add header, see below
		requestOptions.headers[ 'content-type' ] = 'application/json';
		requestOptions.body = payload;
	}

	return { requestOptions, clientHeader };
}

function makeRequest( resolve, reject, uri, method, opts, key ){

	logger.debug( `Sending ${ method } request to: ${ uri }` );

	const { requestOptions, clientHeader } = createRequestOptions( uri, method, opts );
	// Send authenticated request
	request( requestOptions, function( err, response, body ){

		if( err ){

			reject( err );

		} else {

			// Authenticate the server's response
			// must use raw response body here
			const isValid = hawk.client.authenticate( response, credentials, clientHeader.artifacts, { payload: body } );

			logger.debug( `Response code: ${ response.statusCode } for ${ uri }, isValid:` + !!isValid );

			if( !isValid ){

				reject( new Error( 'Invalid response' ) );

			} else {

				// because we need the raw response body for the hawk client above
				// try and convert to JSON before passing back
				if( response.headers[ 'content-type' ] === 'application/json' ){

					try {

						body = JSON.parse( body );

					} catch ( e ){

						logger.error( 'Unable to convert response to JSON' );
						reporter.captureException( e );
					}
				}

				const responseData = { response, body };
				// Output results
				resolve( responseData );

				if( opts.cache && key ){

					redis.set( key, JSON.stringify( responseData ), 'EX', getCacheTime().seconds, ( err ) => {

						if( err ){
							reporter.captureException( err );
						}
					} );
				}
			}
		}
	} );
}

module.exports = function( path, opts = {} ){

	const method = opts.method || 'GET';
	const uri = ( config.backend.url + path );

	return new Promise( ( resolve, reject ) => {

		if( opts.cache ){

			const key = createRedisKey( method, path, opts.data );

			redis.get( key, function( err, value ){

				if( !err && value ){

					logger.debug( 'Cache HIT for %s', uri );
					resolve( JSON.parse( value ) );

				} else {

					logger.debug( 'Cache MISS for %s', uri );
					makeRequest( resolve, reject, uri, method, opts, key );
				}
			} );

		} else {

			makeRequest( resolve, reject, uri, method, opts );
		}
	} );
};
