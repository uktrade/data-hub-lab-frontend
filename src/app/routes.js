const homeController = require( './controllers/home' );
const ssoController = require( './controllers/sso' );
const timelineController = require( './controllers/timeline' );

module.exports = function( express, app ){

	app.get( '/', homeController );
	app.get( '/login/', ssoController.authRedirect );
	app.get( '/login/callback/', ssoController.callback );
	app.get( '/timeline/', timelineController.index );
	app.get( '/timeline/search/', timelineController.search );
};