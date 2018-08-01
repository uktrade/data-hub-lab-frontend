const request = require('request');
const config = require('../config');
const logger = require('../lib/logger');

const powerBIConfig = config.dashboard.powerbi;

function getAccessToken(username, password, clientId) {

	return new Promise( (resolve, reject) => {

		const url = 'https://login.microsoftonline.com/common/oauth2/token';

		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		};

		const form = {
			grant_type: 'password',
			client_id: clientId,
			resource: 'https://analysis.windows.net/powerbi/api',
			scope: 'openid',
			username: username,
			password: password
		};

		request.post({ url, form, headers }, (err, result, body) => {
			if (err) return reject({message: 'Failed to retrieve access token'});
			try {
				const bodyObj = JSON.parse(body);
				resolve(bodyObj.access_token);
			} catch( e ){
				reject( e );
			}
		});
	});
}

function getEmbedToken(accessToken, groupId, reportId) {

	return new Promise( (resolve, reject) => {

		const url = `https://api.powerbi.com/v1.0/myorg/groups/${ groupId }/reports/${ reportId }/GenerateToken`;

		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Bearer ' + accessToken
		};

		const form = {
			"accessLevel": "View"
		};

		request.post({ url, form, headers }, (err, result, body) => {
			if (err) return reject({message: 'Failed to retrieve embed token'});
			try{
				const bodyObj = JSON.parse(body);
				resolve(bodyObj.token);
			} catch( e ){
				reject( e );
			}
		});
	});
}

async function generateReportToken(username, password, clientId, groupId, reportId) {

	try {

		const accessToken = await getAccessToken(username, password, clientId);
		const token = await getEmbedToken(accessToken, groupId, reportId);
		return token;

	} catch (error) {

		logger.error(error);
		throw error;
	}
}

module.exports = {

	index: async function (req, res) {

		const reportId = powerBIConfig.reportId;
		const groupId = powerBIConfig.groupId;
		const embedUrl = powerBIConfig.embedUrl;

		try {
			const token = await generateReportToken(
				powerBIConfig.username,
				powerBIConfig.password,
				powerBIConfig.clientId,
				groupId,
				reportId
			);
			res.render('powerbi-dashboard/index', {token, groupId, reportId, embedUrl});
		} catch (error) {
			res.render('powerbi-dashboard/index', {error});
		}
	},

	getEmbedToken: async function (req, res) {

		try {
			const token = await generateReportToken(
				powerBIConfig.username,
				powerBIConfig.password,
				powerBIConfig.clientId,
				powerBIConfig.groupId,
				powerBIConfig.reportId
			);
			res.json({token: token});
		} catch (error) {
			res.status(503);
			res.json({error: error.message});
		}
	}
};
