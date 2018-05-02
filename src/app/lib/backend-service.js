const backendRequest = require( './backend-request' );

const sources = {
	'citrix.webinar' : 'Citrix (DIT Webinars)',
	'cdms.companies': 'DIT (CDMS Companies)',
	'cdms.contacts': 'DIT (CDMS Contacts)',
	'ch.companies': 'Companies House (Companies)',
	'dit.eig-contact-form': 'DIT (EIG Contact Form)',
	'dit.export-wins': 'DIT (Export Wins)',
	'dit.find-a-buyer': 'DIT (FAB)',
	'dit.gov-uk-contact-form': 'DIT (GOV.UK Contact Form)',
	'eig-export-ops': 'DIT (Export Opportunities)',
	'experian.email': 'Experian (Email Campaign)',
	'hmrc.exporters': 'HMRC (Exporters)',
	'hmrc.importers': 'HMRC (Importers)',
	'zendesk.tickets.contact_dit_form': 'Zendesk (DIT Contact Form)',
	'zendesk.tickets.iigb': 'Zendesk (IIGB)',
	'datahub.interactions': 'DIT (Datahub ITA Interactions)',
	'dit.eig-email-guide': 'DIT (EIG Email Guide)',
	'zendesk.organizations': 'Zendesk (Organizations)',
	'companies_house.companies': 'Companies House'
};

function transformEvents( responseData ){

	if( responseData.response.statusCode === 200 && responseData.body && responseData.body.events ){

		responseData.body.events = responseData.body.events.map( ( event ) => {

			event.source = sources[ event.data_source ] || event.data_source;
			return event;
		} );
	}

	return responseData;
}

module.exports = {

	getEventsByCompanyName: async function( name ){

		const responseData = await backendRequest( '/api/v1/company/events/?company_name=' + encodeURIComponent( name ).replace( /%20/g, '+' ).toLowerCase() );

		return transformEvents( responseData );
	},

	getEventsByCompanyId: async function( id ){

		const responseData = await backendRequest( '/api/v1/company/events/?companies_house_id=' + parseInt( id, 10 ) );

		return transformEvents( responseData );
	},

	getEventsByInternalCompanyId: async function( id ){

		const responseData = await backendRequest( '/api/v1/company/events/?company_id=' + parseInt( id, 10 ) );
		
		return transformEvents( responseData );
	},

	searchBySicCode: async function( code ){
		
		const responseData = await backendRequest( '/api/v1/company/search/sic_code/?codes=' + encodeURIComponent( code ) );

		return responseData;
	},

	searchByExportCode: async function( code ){

		const responseData = await backendRequest( '/api/v1/company/search/commodity_code/?codes=' + encodeURIComponent( code ) );

		return responseData;
	},

	getDataByType: async function( type ){

		const responseData = await backendRequest( '/api/v1/company/search/' + encodeURIComponent( type ) + '/', { cache: true } );

		return responseData;
	},

	searchForCompanies: async function( offset, limit, data ){

		const responseData = await backendRequest( `/api/v1/company/search/?offset=${ offset }&limit=${ limit }`, {
			method: 'POST',
			data
		});

		return responseData;
	}
};
