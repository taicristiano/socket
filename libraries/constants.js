require('dotenv').config()

module.exports = Object.freeze({
    BROADCAST_TYPE_TYPING: 5,
    BROADCAST_TYPE_STOP_TYPING: 6,
    API_AUTHENTICATION: process.env.HOST_DB + '/api/socket/authentication/check',
    API_SEND_MESSAGE: process.env.HOST_DB + '/api/send-message',
});