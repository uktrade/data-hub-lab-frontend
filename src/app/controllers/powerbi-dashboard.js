const config = require('../config');
const logger = require('../lib/logger');
const request = require('request');


function getAccessToken(username, password, clientId) {

	return new Promise(function (resolve, reject) {

		var url = 'https://login.microsoftonline.com/common/oauth2/token';

		var headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		};

		var formData = {
			grant_type: 'password',
			client_id: clientId,
			resource: 'https://analysis.windows.net/powerbi/api',
			scope: 'openid',
			username: username,
			password: password
		};

		request.post({
			url: url,
			form: formData,
			headers: headers

		}, function (err, result, body) {
			if (err) return reject({message: 'Failed to retrieve access token'});
			var bodyObj = JSON.parse(body);
			resolve(bodyObj.access_token);
		})
	});
}

function getEmbedToken(accessToken, groupId, reportId) {

	return new Promise(function (resolve, reject) {

		var url = 'https://api.powerbi.com/v1.0/myorg/groups/' + groupId + '/reports/' + reportId + '/GenerateToken';

		var headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Bearer ' + accessToken
		};

		var formData = {
			"accessLevel": "View"
		};

		request.post({
			url: url,
			form: formData,
			headers: headers

		}, function (err, result, body) {
			if (err) return reject({message: 'Failed to retrieve embed token'});
			var bodyObj = JSON.parse(body);
			resolve(bodyObj.token);
		})
	});
}

async function generateReportToken(username, password, clientId, groupId, reportId) {

	try {

		var accessToken = await getAccessToken(username, password, clientId);
		var token = await getEmbedToken(accessToken, groupId, reportId);
		return token;
	} catch (error) {

		logger.error(error);
		throw error;
	}
}

module.exports = {

	index: async function (req, res) {

		var powerBIConfig = config.dashboard.powerbi;
		var reportId = config.dashboard.powerbi.reportId;
		var groupId = config.dashboard.powerbi.groupId;
		var embedUrl = config.dashboard.powerbi.embedUrl;
		try {
			var token = await generateReportToken(
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

	getToken: async function (req, res) {
		var powerBIConfig = config.dashboard.powerbi;
		try {
			var token = await generateReportToken(
				powerBIConfig.username,
				powerBIConfig.password,
				powerBIConfig.clientId,
				powerBIConfig.groupId,
				powerBIConfig.reportId
			);
			res.json({token: token})
		} catch (error) {
			res.status(503)
			res.json({error: error.message});
		}

	}

};
