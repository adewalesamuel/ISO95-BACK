module.exports = {
	appName: 'ISO95',
	mongoUri: 'mongodb://localhost/db',
	secretKey: '88498aec5e97a287b962212ef90c5c95be5bded1a77637347ec04add941b61b9',
	clientHost: 'localhost:3000',
	baseDir: process.cwd(),
	smtp: {
		host: 'smtp.gmail.com', //'smtp.mail.yahoo.com',
		port: 465,
		auth: {
			user: '',
			pass: '',
		}
	}
}