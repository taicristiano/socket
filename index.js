// Setup basic express server
var express = require('express');
var app     = express();
var path    = require('path');
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var port    = process.env.PORT || 3000;
var routes  = require('./routes/index')

require('./socket/socket')(io);
require('dotenv').config()

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

app.use(express.json())

app.use(async function(request, response, next){
    response.io = io;
    next();
});
// Routing
app.use(express.static(path.join(__dirname, 'src')));
app.use('/', routes)

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
})
