var numUsers = 0;
// var axios = require('axios');
var callApi = require('./../libraries/api');
const consant = require('./../libraries/constants');

module.exports = (io) => {
    io.use(async function(socket, next) {
        let token = socket.handshake.query.token;
        let userId = socket.handshake.query.uuid;
        response = await callApi(
            'post',
            consant.API_AUTHENTICATION,
            {
                user_id: userId
            },
            {
                'Authorization' : 'bearer ' + token
            }
        );

        if (response.data.status_code == 200 && response.data.data.status == 'Ok') {
            next();
        } else {
            console.log(123)
            next(new Error('Authentication error'));
        }
    })
    .on('connection', (socket) => {
        var addedUser = false;

        // when the client emits 'new message', this listens and executes
        socket.on('new message', async (data) => {
            response = await callApi(
                'post',
                consant.API_SEND_MESSAGE,
                data,
                {
                    'Authorization' : 'bearer ' + data.token
                }
            )
            socket.broadcast.emit('room_' + data.user_id_receive, response.data);
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', (username) => {
            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            console.log(numUsers);
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', (data) => {
            socket.broadcast.emit('room_' + data.user_to, {
                username: socket.username,
                type: consant.BROADCAST_TYPE_TYPING
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', (data) => {
            socket.broadcast.emit('room_' + data.user_to, {
                username: socket.username,
                type: consant.BROADCAST_TYPE_STOP_TYPING
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                console.log('a user disconnected');
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });
    })
}
