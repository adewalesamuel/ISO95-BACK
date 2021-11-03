const { mongoUri } = require('./environement')
const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser');
const helmet = require('helmet')
const compression = require('compression')
const mongoose = require('mongoose')
const conn = mongoose.connect( mongoUri, {useNewUrlParser: true} )

const PORT = process.env.PORT || 8080

const userRoutes = require('./routes/user')
const relationRoutes = require('./routes/relation')
const postRoutes = require('./routes/post')
const postLikeRoutes = require('./routes/postLike')
const commentRoutes = require('./routes/comment')
const notificationRoutes = require('./routes/notification')
const messageRoutes = require('./routes/message')

app.use(helmet())
app.use(compression())
app.use('/uploads', express.static(path.join(__dirname,'/uploads')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({limit: '100mb',extended: true}));
app.use( (req,res,next) => {
	res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, User-agent, Host")
	next()
})

app.use('/api/user', userRoutes)
app.use('/api/relation', relationRoutes)
app.use('/api/post', postRoutes)
app.use('/api/post-like', postLikeRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/message', messageRoutes)

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '/uploads/public/index.html')))

app.listen(PORT)
