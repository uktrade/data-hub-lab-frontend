const backendService = require( '../lib/backend-service' );
const logger = require( '../lib/logger' );

const isNumeric = /^[0-9]+$/;
const isName = /^[a-zA-Z0-9 _-]+$/;

function nameError( message ){
	return { field: 'name', message };
}

function idError( message ){
	return { field: 'id', message };
}

module.exports = {

	index: function( req, res ){

		res.render( 'timeline/index' );
	},

	search: async function( req, res, next ){

		const name = req.query.name;
		const id = req.query.id;
		let responseData;
		let error;

		if( name || id ){

			try {

				if( name ){

					if( isName.test( name ) ){

						responseData = await backendService.getEventsByCompanyName( name );

						if( responseData.response.statusCode === 404 ){
							error = nameError( 'Unable to find company with that name' );
						}

					} else {

						error = nameError( 'Invalid name' );
					}

				} else {

					if( isNumeric.test( id ) ){

						responseData = await backendService.getEventsByCompanyId(  id );

						if( responseData.response.statusCode === 404 ){
							error = idError( 'Unable to find company with that id' );
						}

					} else {

						error = idError( 'Invalid id' );
					}
				}

				if( error ){

					res.render( 'timeline/index', { error } );

				} else {

					if( responseData.response.statusCode === 401 ){

						res.render( 'error/default', { message: 'Sorry, you don\'t have permission to view this company information' } );

					} else {

						res.render( 'timeline/results', { id, name, json: responseData.body } );
					}
				}

			} catch( e ){

				logger.error( e );
				next( e );
			}

		} else {

			res.redirect( '/timeline/' );
		}
	}
};