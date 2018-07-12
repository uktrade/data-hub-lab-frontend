/* eslint no-console:0 */
const os = require( 'os' );
const requiredEnvs = [];

function env( name, defaultValue ){

	var exists = ( typeof process.env[ name ] !== 'undefined' );

	return ( exists ? process.env[ name ] : defaultValue );
}

function requiredEnv( name, defaultValue ){

	requiredEnvs.push( name );

	return env( name, defaultValue );
}

function bool( name, defaultValue ){

	return ( env( name, defaultValue ) + '' ) === 'true';
}

function number( name, defaultValue ){

	return parseInt( env( name, defaultValue ), 10 );
}

function checkRequiredEnvs(){

	const missing = [];

	for( let name of requiredEnvs ){

		if( typeof process.env[ name ] === 'undefined' ){

			missing.push( name );
		}
	}

	if( missing.length ){

		console.log( 'Missing required env variables:', missing );
		throw new Error( 'Missing required env variables' );
	}
}

const cpus = ( os.cpus().length || 1 );
const isDev = ( ( process.env.NODE_ENV || 'development' ) === 'development' );

let config = {
	isDev,
	showErrors: isDev,
	version: env( 'npm_package_version', 'unknown' ),
	logLevel: env( 'LOG_LEVEL', 'warn' ),
	sentryDsn: env( 'SENTRY_DSN' ),
	analyticsId: env( 'ANALYTICS_ID' ),
	datahubDomain: env( 'DATA_HUB_DOMAIN', 'https://www.datahub.trade.gov.uk' ),
	views: {
		cache: bool( 'CACHE_VIEWS', true )
	},
	server: {
		host: env( 'SERVER_HOST', 'localhost' ),
		port: number( 'SERVER_PORT', number( 'PORT', 8080 ) ),
		cpus,
		workers: number( 'SERVER_WORKERS', number( 'WEB_CONCURRENCY', cpus ) )
	},
	redis: {
		host: env( 'REDIS_HOST' ),
		port: number( 'REDIS_PORT' ),
		password: env( 'REDIS_PASSWORD' ),
		url: env( 'REDIS_URL' ) || env( 'REDISTOGO_URL' ),
		tls: bool( 'REDIS_USE_TLS' )
	},
	session: {
		ttl: ( 1000 * 60 * 60 * 2 ),//milliseconds for cookie
		secret: requiredEnv( 'SESSION_SECRET' )
	},
	sso: {
		bypass: bool( 'SSO_BYPASS' ),
		protocol: env( 'SSO_PROTOCOL', 'https' ),
		domain: requiredEnv( 'SSO_DOMAIN' ),
		port: number( 'SSO_PORT', 443 ),
		client: requiredEnv( 'SSO_CLIENT' ),
		secret: requiredEnv( 'SSO_SECRET' ),
		mockCode: env( 'SSO_MOCK_CODE' ),
		path: {
			auth: requiredEnv( 'SSO_PATH_AUTH' ),
			token: requiredEnv( 'SSO_PATH_TOKEN' ),
			introspect: requiredEnv( 'SSO_PATH_INTROSPECT' ),
			user: env( 'SSO_PATH_USER' )
		},
		redirectUri: requiredEnv( 'SSO_REDIRECT_URI' ),
		paramLength: number( 'OAUTH_PARAM_LENGTH', 75 )
	},
	backend: {
		url: requiredEnv( 'BACKEND_URL' ),
		key: requiredEnv( 'BACKEND_KEY' ),
		user: requiredEnv( 'BACKEND_USER' )
	}
};

checkRequiredEnvs();

module.exports = config;
