
acs.utils = (function( $ ){

	var undef;

	function remove_empty(obj) {
		Object.keys(obj).forEach(function(key) {
			var value = obj[key];
			var type = typeof value;
			if (type === "object") {
				remove_empty(value);
				if (!Object.keys(value).length) {
					delete obj[key];
				}
			} else if (type === "undefined") {
				delete obj[key];
			}
		});
	}

	return {

		remove_empty: remove_empty,

		toInt: function(value) {
			return value === undef ? value : parseInt(value);
		},

		toArray: function(value) {
			return value !== undef && !$.isArray( value ) ? [value] : value;
		}
	};
}( jQuery ));
