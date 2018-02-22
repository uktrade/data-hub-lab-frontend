const hawk = require( 'hawk' );
const request = require( 'request' );
const config = require( '../config' );
const logger = require( './logger' );

const credentials = {
	id: config.backend.user,
	key: config.backend.key,
	algorithm: 'sha256'
};

module.exports = function( path ){

	const uri = ( config.backend.url + path );
	let clientHeader;

	logger.debug( 'Sending request to: ' + uri );

	try {

		// Generate Authorization request header
		clientHeader = hawk.client.header( uri, 'GET', { credentials } );

	} catch( e ){

		throw e;
	}

	if( !clientHeader ){

		throw new Error( 'Unable to create header' );
	}

	const requestOptions = {
		uri,
		method: 'GET',
		headers: {
			Authorization: clientHeader.header
		},
		json: true
	};

	return new Promise( ( resolve, reject ) => {
		// Send authenticated request
		request( requestOptions, function( err, response, body ){

			if( err ){

				reject( err );

			} else {

				// Authenticate the server's response
				const isValid = hawk.client.authenticate( response, credentials, clientHeader.artifacts, { payload: body } );

				logger.debug( `Response code: ${response.statusCode}, isValid:` + !!isValid );

				if( !isValid ){

					reject( new Error( 'Invalid response' ) );

				} else {

					// Output results
					resolve( { response, body } );
				}
			}
		} );
	} );
};
