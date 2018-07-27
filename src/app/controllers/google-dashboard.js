const config = require('../config');

module.exports = {

	index: function( req, res ){

		var embedUrl = config.dashboard.googleds.embedURL
		res.render( 'google-dashboard/index', { embedUrl } );
	}

};
