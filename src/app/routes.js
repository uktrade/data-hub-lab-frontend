const homeController = require( './controllers/home' );
const ssoController = require( './controllers/sso' );
const timelineController = require( './controllers/timeline' );
const acsController = require( './controllers/acs' );
const googleDashboardController = require( './controllers/google-dashboard' );
const powerBIDashboardController = require( './controllers/powerbi-dashboard' );

module.exports = function( express, app ){

	app.get( '/', homeController );
	app.get( '/login/', ssoController.authRedirect );
	app.get( '/login/callback/', ssoController.callback );

	app.get( '/timeline/', timelineController.index );
	app.get( '/timeline/search/', timelineController.search );

	app.get( '/acs/', acsController.index );
	app.get( '/acs/api/timeline/events/:id', acsController.internalCompanyIdEvents );
	app.get( '/acs/api/search/sic-code/:code', acsController.searchBySicCode );
	app.get( '/acs/api/search/export-code/:code', acsController.searchByExportCode );
	app.get( '/acs/api/data/:type', acsController.dataByType );
	app.post( '/acs/api/search/', express.json(), acsController.search );

	app.get( '/google-dashboard/', googleDashboardController.index );
	app.get( '/powerbi-dashboard/', powerBIDashboardController.index );
	app.get( '/powerbi-dashboard/api/embed-token/', powerBIDashboardController.getEmbedToken );
};
