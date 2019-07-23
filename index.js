// Setup basic express server
var express = require('express');
var app     = express();
var path    = require('path');
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var port    = process.env.PORT || 3008;
var routes  = require('./routes/index')

require('./socket/socket')(io);

server.listen(port, () => {
    console.log('Server listening at port %d', port);

    // axios.get('http://localhost/playerduo/public/api/hot-players')
    // .then(response => {
    //     for (const key in response.data.data) {
    //             if (response.data.data.hasOwnProperty(key)) {
    //                 const element = response.data.data[key];
    //                 console.log(element.user.avatar);
    //         }
    //     }
    // })
    // .catch(error => {
    //     console.log(error);
    // });
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
