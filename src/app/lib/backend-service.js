const backendRequest = require( './backend-request' );

const sources = {
	'citrix.webinars.attendees':'Citrix (DIT Webinars)',
	'citrix.webinars.webinars': 'Citrix (DIT Webinars)',
	'citrix.webinars.registrants': 'Citrix (DIT Webinars)',
	'dit.datahub.interactions': 'DIT (DataHub)',
	'dit.datahub.companies': 'DIT (DataHub)',
	'dit.datahub.contacts': 'DIT (DataHub)',
	'dit.datahub.dit_events': 'DIT (DataHub)',
	'dit.datahub.fdi': 'DIT (DataHub)',
	'dit.datahub.advisors': 'DIT (DataHub)',
	'dit.eig-contact-form': 'DIT (EIG Contact Form)',
	'dit.eig-email-guide': 'DIT (EIG Email Guide)',
	'dit.eig-export-ops-published': 'DIT (Export Opportunities)',
	'dit.eig-export-opp-responses': 'DIT (Export Opportunities)',
	'dit.export-wins': 'DIT (Export Wins)',
	'dit.find-a-buyer.suppliers': 'DIT (FAB)',
	'dit.find-a-buyer.buyers': 'DIT (FAB)',
	'dit.gov-uk-contact-form': 'DIT (GOV.UK Contact Form)',
	'companies_house.companies':'Companies House (Companies)',
	'companies_house.accounts':'Companies House (Accounts)',
	'companies_house.psc': 'Companies House (PSC)',
	'experian.email.clicked': 'Experian (Email Campaign)',
	'experian.email.opened': 'Experian (Email Campaign)',
	'experian.email.sent': 'Experian (Email Campaign)',
	'hmrc.exporters': 'HMRC (Exporters)',
	'hmrc.importers.f0_0': 'HMRC (Importers)',
	'hmrc.importers.f1_0': 'HMRC (Importers)',
	'horizon.events.events': 'Horizon (Events)',
	'horizon.events.delegates': 'Horizon (Events)',
	'ipo.journals': 'IPO (Journals)',
	'zendesk.organizations': 'Zendesk (Organizations)',
	'zendesk.users': 'Zendesk (Users)',
	'zendesk.tickets': 'Zendesk (Tickets)',
	'zendesk.tickets.contact_dit_form': 'Zendesk (Tickets)',
	'zendesk.tickets.iigb': 'Zendesk (Tickets)',
	'zendesk.tickets.soo': 'Zendesk (Tickets)'
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
