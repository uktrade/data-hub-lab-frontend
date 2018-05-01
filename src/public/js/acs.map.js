// ********************* //
// * Map Visualisation * //
// ********************* //

acs.map = (function( $, doc ){

	var map;
	var markersArray = [];

	function percToColor(perc) {
		var r, g, b = 0;
		if(perc < 50) {
			r = 255;
			g = Math.round(5.1 * perc);
		} else {
			g = 255;
			r = Math.round(510 - 5.10 * perc);
		}
		var h = r * 0x10000 + g * 0x100 + b * 0x1;
		return '#' + ('000000' + h.toString(16)).slice(-6);
	}

	return {
		init: function(){

			var myLatLng = {lat: 55, lng: -4};

			// Create a map object and specify the DOM element for display.
			map = new google.maps.Map(doc.getElementById('map'), {
				center: myLatLng,
				zoom: 5.7,
				fullscreenControl: false,
				mapTypeControl: false,
				streetViewControl: false,
				styles: [
					{
						featureType: 'road',
						stylers: [ { visibility: 'off' } ]
					},
					{
						featureType: 'poi',
						stylers: [ { visibility: 'off' } ]
					}
				]
			});
		},

		clearMarkers: function(){
	
			for (var i = 0, l = markersArray.length; i < l; i++ ) {
				markersArray[i].setMap(null);
			}
			markersArray = [];
		},

		drawMarker: function(rowData) {

			if (rowData.latitude == '' || rowData.longitude == ''){
				return;
			}
			var myLatLng = {lat: parseFloat(rowData.latitude), lng: parseFloat(rowData.longitude)};

			var marker = new google.maps.Marker({
				position: myLatLng,
				sName: "Marker Name",
				map: map,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 4,
					fillColor: percToColor(Number(rowData.export_propensity)),
					fillOpacity: 0.4,
					strokeWeight: 0.4
				}
			});
			markersArray.push(marker);

			marker.addListener('click', function() {

				var $tbody = $('table#company_description tbody');

				$tbody.children().remove();

				var company_desc = {
					"Company Name": rowData.company_name,
					"Post Code": rowData.postcode,
					"Region": rowData.region,
					"Nb Export Evidences": rowData.nb_export_evidences,
					"Last Export Evidence": rowData.last_export_evidence,
					"Current Assets": rowData.current_assets,
					"Shareholder Funds": rowData.shareholder_funds,
					"Turnover": rowData.turnover,
					"HQ Type": rowData.headquarter_type,
					"Company Classification": rowData.company_classification,
					"Employee Range": rowData.employee_range,
					"Export Propensity": rowData.export_propensity
				};

				var header = $("<th colspan='2' class='text-center'> Company Description<th/>");
				$tbody.append( header );
				Object.keys(company_desc).forEach(function(key) {
					var row = $("<tr />");
					row.append($("<td>" + key + "</td>"));
					row.append($("<td>" + company_desc[key] + "</td>"));
					$tbody.append(row);
				});
			});
		}
	};
}( jQuery, document ));
