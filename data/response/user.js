module.exports = {
	registerResponseData: {
		"sessionToken": "string",
		"_id": "string",
		"username": "string",
		"fullname": "string",
		"profileUrl": "string",
		"relations": {
			"followers": "number",
			"following": "number",
		},
		"description": "string",
		"email": "string",
		"tel": "string",
		"website": "string",
		"place": {
			"city": "string",
			"country": "string"
		},
		"grades": ["...string"],
		"posts": "number",
		"favorites": "number",
		"isNew": "boolean"
	} 
}