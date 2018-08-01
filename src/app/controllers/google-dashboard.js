const config = require('../config');

module.exports = {

	index: function( req, res ){

		const embedUrl = config.dashboard.googleds.embedURL;
		res.render( 'google-dashboard/index', { embedUrl } );
	}

};
