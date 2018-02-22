const express = require( 'express' );
const nunjucks = require( 'nunjucks' );
const path = require( 'path' );
const morganLogger = require( 'morgan' );
const compression = require( 'compression' );

const routes = require( './routes' );
const config = require( './config' );

const reporter = require( './lib/reporter' );
const staticGlobals = require( './lib/static-globals' );
const nunjucksFilters = require( './lib/nunjucks-filters' );

const ping = require( './middleware/ping' );
const forceHttps = require( './middleware/force-https' );
const headers = require( './middleware/headers' );
const errors = require( './middleware/errors' );
const sessionStore = require( './middleware/session-store' );
const auth = require( './middleware/auth' );
const ssoBypass = require( './middleware/sso-bypass' );

module.exports = {

	create: function(){

		const app = express();
		const isDev = config.isDev;
		const pathToPublic = path.resolve( __dirname, '../public' );
		const staticMaxAge = ( isDev ? 0 : '2y' );

		const nunjucksEnv = nunjucks.configure( [
				`${__dirname}/views`
			], {
			autoescape: true,
			watch: isDev,
			noCache: !config.views.cache,
			express: app
		} );

		app.set( 'view engine', 'njk' );
		app.set( 'view cache', config.views.cache );
		app.disable( 'x-powered-by' );

		staticGlobals( nunjucksEnv );
		nunjucksFilters( nunjucksEnv );
		reporter.setup( app );

		if( !isDev ){ app.use( compression() ); }
		app.use( forceHttps( isDev ) );
		app.use( '/public', express.static( pathToPublic, { maxAge: staticMaxAge } ) );
		app.use( morganLogger( ( isDev ? 'dev' : 'combined' ) ) );
		app.use( headers( isDev ) );
		app.use( ping );

		app.use( sessionStore.create() );
		if( isDev ){ app.use( ssoBypass ); }
		app.use( auth );
		routes( express, app );

		app.use( errors.handle404 );

		reporter.handleErrors( app );

		app.use( errors.catchAll );

		return app;
	}
};
