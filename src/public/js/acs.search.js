// ****************** //
// * Company Search * //
// ****************** //

acs.search = (function( $, utils, map, info ){

	var undef;
	var toArray = utils.toArray;
	var toInt = utils.toInt;
	var remove_empty = utils.remove_empty;
	var $searchResults = $( '#search-results' );
	var $noResultsMessage = $( '<p class="no-results">No results available</p>' );
	var resultsPerPage = 10;

	function filtersAsJson(form, sort_field, ascending) {

		var data = {};

		$.each( form.serializeArray(), function(i,o){
			var n = o.name;
			var v = o.value;
			if(v !== ""){
				data[n] = data[n] === undef ? v
					: $.isArray( data[n] ) ? data[n].concat( v )
					: [ data[n], v ];
			}
		});

		var filters = {
			'filters': {
				'company_name': data['company_name'],
				'postcode': data['postcode'],
				'region': toArray(data['region']),
				'nb_export_evidences': {
					'min': toInt(data['nb_export_evidences_min']),
					'max': toInt(data['nb_export_evidences_max'])
				},
				'last_export_evidence': {
					'min': data['last_export_evidence_min'],
					'max': data['last_export_evidence_max']
				},
				'export_codes': {
					'code_match': toArray(data['commodity_code']),
					'keyword_search': data['commodity_code_kw']
				},
				'sic_codes': {
					'code_match': toArray(data['sic_code']),
					'keyword_search': data['sic_code_kw']
				},
				'current_assets': {
					'min': toInt(data['current_assent_min']),
					'max': toInt(data['current_assent_max'])
				},
				'shareholder_funds': {
					'min': toInt(data['shareholder_funds_min']),
					'max': toInt(data['shareholder_funds_max'])
				},
				'turnover': {
					'min': toInt(data['turnover_min']),
					'max': toInt(data['turnover_max'])
				},
				'company_classification': toArray(data['company_classification']),
				'headquarter_type': toArray(data['headquarter_type']),
				'employee_range': data['employee_range'],
				'export_propensity': {
					'min': toInt(data['export_propensity_min']),
					'max': toInt(data['export_propensity_max'])
				},
				'service_usage': toArray(data['service_usage'])
			},
			'sort': {
				'field': sort_field,
				'ascending': ascending,
			}
		};

		remove_empty(filters);
		return JSON.stringify(filters);
	}

	function drawRow(rowData) {
		var row = $("<tr />");
		row.append($("<td>" + rowData.company_name + "</td>"));
		row.append($("<td>" + rowData.postcode + "</td>"));
		row.append($("<td>" + rowData.region + "</td>"));
		row.append($("<td>" + rowData.nb_export_evidences + "</td>"));
		row.append($("<td>" + rowData.last_export_evidence + "</td>"));
		row.append($("<td>" + rowData.commodity_codes + "</td>"));
		row.append($("<td>" + rowData.sic_codes + "</td>"));
		row.append($("<td>" + rowData.current_assets + "</td>"));
		row.append($("<td>" + rowData.shareholder_funds + "</td>"));
		row.append($("<td>" + rowData.turnover + "</td>"));
		row.append($("<td>" + rowData.headquarter_type + "</td>"));
		row.append($("<td>" + rowData.company_classification + "</td>"));
		row.append($("<td>" + rowData.employee_range + "</td>"));
		row.append($("<td>" + rowData.export_propensity + "</td>"));
		$('table.company_filter tbody').append(row);
	}

	function clearTables() {
		$('table.company_filter tbody tr').remove();
		$('table#company_description tbody').children().remove();
	}

	// Populate search query selectors
	function populate_selector(name, type) {

		var isArray = ( type === 'array') ;
		var isNot = ( type === 'not' );

		$.ajax({
			type: 'get',
			url: ( '/acs/api/data/' + name ),
			async: true,
			dataType: 'json',
			success: function(option_list){

				var options = option_list.result;
				var i = 0;
				var option;
				var selector = $( 'select[name=' + name + ']' );

				selector.empty();

				while( ( option = options[ i++ ] ) ){
					var value, text;
					if (isArray) {
						value = option[0];
						var description = (option[1] == null) ? '' : (option[1].length <= 70) ? option[1]: option[1].slice(0, 70) + '...';
						text = value.concat(' - ', description);
						selector.append(
							$("<option></option>").attr("value", value).text(text)
						);
					} else if ( isNot ){
						value = text = option;
						selector.append(
							$("<option></option>").attr("value", value).text(text)
						);
						selector.append(
							$("<option></option>").attr("value", 'not ' + value).text('not ' + text)
						);
					} else {
						value = text = option;
						selector.append(
							$("<option></option>").attr("value", value).text(text)
						);
					}
				}

				selector.selectpicker('refresh');
			},
			error: function(error) {
				console.log("Error:");
				console.log(error);
			}
		});
	}

	function search(offset, limit){

		var sort_order;
		var sort_field = $('select[name=sort_field]').val() || undef;
		
		if (sort_field) {
			sort_field = sort_field[0];
			sort_order = !$('input[name=sort_order]').prop("checked");
		}

		$searchResults.hide();
		$noResultsMessage.hide();

		$.ajax({
			type: "post",
			url: ( '/acs/api/search/?offset=' + offset + '&limit=' + limit ),
			data: filtersAsJson($('#search_filters'), sort_field, sort_order),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data){

				var rows = data.result;
				var i = 0;
				var row;

				clearTables();
				map.clearMarkers();
				info.clear();

				if( rows ){

					while( ( row = rows[ i++ ] ) ){
						drawRow(row);
						info.addRow(row);
						map.drawMarker(row);
					}

					$searchResults.show();
					info.refresh();

					try {
						$searchResults.find( 'table' )[ 0 ].scrollIntoView();
					} catch( e ){}

				} else {

					$noResultsMessage.show();
					try { 
						$noResultsMessage[ 0 ].scrollIntoView();
					} catch( e ){}
				}
			},
			error: function(){
				clearTables();
				map.clearMarkers();
				info.clear();
				console.log('failed');
			}
		});
	}

	return {

		init: function(){

			$searchResults.after( $noResultsMessage );
			$searchResults.hide();
			$noResultsMessage.hide();

			$('#datetimepicker1').datetimepicker();
			$('#datetimepicker2').datetimepicker();

			$("#search_button").click(function(){
				search(0, resultsPerPage);
			});

			$("#clear_button").click(function(){
				$('#search_filters .selectpicker').selectpicker('val', '');
				$('#search_filters input').val('');
			});

			$('select[name=nb_pages]').on('change',function() {
				resultsPerPage = $(this).val();
			});

			$('#pagination').bootpag({
				total: 10,
				page: 1,
				maxVisible: 0,
				leaps: false,
				href: "#result-page-{{number}}",
			}).on("page", function(event, num){
				search((num-1) * resultsPerPage, resultsPerPage);
			});

			populate_selector('service_usage', 'not');
			populate_selector('region');
			populate_selector('company_classification');
			populate_selector('headquarter_type');
			populate_selector('employee_range');
			populate_selector('sic_code', 'array');
			populate_selector('commodity_code', 'array');
		}
	};
}( jQuery, acs.utils, acs.map, acs.info ));
