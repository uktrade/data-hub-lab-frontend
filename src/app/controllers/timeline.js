const backendRequest = require( '../lib/backend-request' );
const logger = require( '../lib/logger' );

module.exports = {

	index: function( req, res ){

		res.render( 'timeline/index' );
	},

	search: async function( req, res, next ){

		const name = req.query.name;
		const id = req.query.id;
		let responseData;

		if( name || id ){

			try {

				if( name ){

					responseData = await backendRequest( '/api/v1/company_timeline/events/?company_name=' + encodeURIComponent( name ) );

				} else {

					responseData = await backendRequest( '/api/v1/company_timeline/events/?companies_house_id=' + encodeURIComponent( id ) );
				}

				res.render( 'timeline/results', { id, name, json: responseData.body } );

			} catch( e ){

				logger.error( e );
				next( e );
			}

		} else {

			res.redirect( '/timeline/' );
		}
	}
};