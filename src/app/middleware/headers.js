const cspValues = [

	`default-src 'none'`,
	`base-uri 'self'`,
	`script-src 'self' 'unsafe-inline' www.google-analytics.com maps.googleapis.com`,
	`style-src 'self' 'unsafe-inline' fonts.googleapis.com`,
	`font-src 'self' fonts.gstatic.com`,
	`img-src 'self' www.google-analytics.com maps.gstatic.com maps.googleapis.com`,
	`form-action 'self'`,
	`connect-src 'self'`,
	`frame-src datastudio.google.com app.powerbi.com`,
	`frame-ancestors datastudio.google.com app.powerbi.com`

].join( ';' );

module.exports = function( isDev ){

	return function( req, res, next ){

		res.setHeader( 'X-Download-Options', 'noopen' );
		res.setHeader( 'X-XSS-Protection', '1; mode=block' );
		res.setHeader( 'X-Content-Type-Options', 'nosniff' );
		res.setHeader( 'X-Frame-Options', 'deny' );
		res.setHeader( 'Content-Security-Policy', cspValues );
		res.setHeader( 'Cache-Control', 'no-cache, no-store' );

		if( !isDev ){

			res.setHeader( 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains' );
		}

		next();
	};
};
