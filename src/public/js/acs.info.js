// **************** //
// * Company Info * //
// **************** //
acs.info = (function( $ ){

	var $selectedCompany;
	
	function clearAllInfoTables(){
		$('table#timeline tbody tr').remove();
		$('table#export_codes tbody tr').remove();
		$('table#sic_codes tbody tr').remove();
	}

	function populateTimeline(rows){

		var $tbody = $('table#timeline tbody');
		var i = 0;
		var row;
		var $row;
		// sort timeline chronological
		if( rows && rows.length ){

			rows.sort(function(a, b){
				var x = new Date(a.datetime);
				var y = new Date(b.datetime);
				return ((x > y) ? -1 : ((x < y) ? 1 : 0));
			});

			while( ( row = rows[ i++ ] ) ){
				$row = $("<tr />");
				$row.append($("<td>" + row.source + "</td>"));
				$row.append($("<td>" + row.datetime.slice(5,-13) + "</td>"));
				$row.append($("<td>" + row.description + "</td>"));
				$tbody.append($row);
			}
		}
	}

	function populateExportCodes(rows){

		var $tbody = $('table#export_codes tbody');
		var i = 0;
		var row;
		var $row;

		while( ( row = rows[ i++ ] ) ){
			$row = $("<tr />");
			$row.append($("<td>" + row[0] + "</td>"));
			$row.append($("<td>" + row[1] + "</td>"));
			$tbody.append($row);
		}
	}

	function populateSicCodes(rows){

		var $tbody = $('table#sic_codes tbody');
		var i = 0;
		var row;
		var $row;

		while( ( row = rows[ i++ ] ) ){
			$row = $("<tr />");
			$row.append($("<td>" + row[0] + "</td>"));
			$row.append($("<td>" + row[1] + "</td>"));
			$tbody.append($row);
		}
	}

	function populateCompanyInfo(url, callback){
		$.ajax({
			url: url,
			type: "get",
			success: callback,
			error: function(error) {
				console.log(error);
			}
		});
	}

	function populateInfo( company_id, sic_codes, export_codes ){

		// Populate Timeline
		populateCompanyInfo( '/acs/api/timeline/events/' + company_id, function (response) {
				populateTimeline(response.events);
			}
		);

		// Populate SIC Codes
		if (sic_codes !== ""){
			populateCompanyInfo('/acs/api/search/sic-code/' + sic_codes, function (response) {
					populateSicCodes(response.result);
				}
			);
		}

		// Populate Export Codes
		if (export_codes !== ""){
			populateCompanyInfo('/acs/api/search/export-code/' + export_codes, function (response) {
					populateExportCodes(response.result);
				}
			);
		}
	}

	return {

		init: function(){

			$selectedCompany = $("#selected_company");

			$("#company_info_button").click(function(){

				var company_attrs = $selectedCompany.val()[0].split(':');
				var company_id = company_attrs[0].replace('ltd.', '').replace('ltd', '').replace('limited', '').trim();
				var sic_codes = company_attrs[1];
				var export_codes = company_attrs[2];

				clearAllInfoTables();
				populateInfo( company_id, sic_codes, export_codes );
			});
		},

		clear: function(){

			$selectedCompany.find( 'option' ).remove();
			clearAllInfoTables();
		},

		addRow: function( rowData ){
			var value = rowData.company_id + ':' + rowData.sic_codes + ':' + rowData.commodity_codes;
			var text = rowData.company_name;
			$selectedCompany.append($("<option></option>").attr("value", value).text(text));
		},

		refresh: function(){
			$selectedCompany.selectpicker('refresh');
		}
	};
}( jQuery ));
