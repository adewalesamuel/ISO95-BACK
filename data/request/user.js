module.exports = {
	registerRequestData : {
		"fullname": "string",
		"username": "strig",
		"password": "string",
		"email": "string",
	},

	loginRequestData: {
		"username": "string",
		"password": "string"
	},

	passwordRenewTokenRequestData: {
		"email": "string",
	},

	passwordRenewRequestData: {
		"id": "string",
		"newPassword": "string"
	},

	passwordRenewTokenValidationRequestData: {
		"passwordToken": "string"
	},

	userProfileUpdateRequestData: {
		"fullname": "string",
		"description": "string",
		"place": {
			"city": "string",
			"country": 'string'
		},
		"tel": "string",
		"email": "string",
		"website": "string"
	}
}

