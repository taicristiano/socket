var notification = (request, response, next) => {
    console.log(123);
    console.log(request.body);
    data = {
        data: {
            "from": 1,
            "message_text": "sdfsdf",
            "messages": [
                {
                    'action': 1,
                    'conversation_id': 725,
                    'created_at': "22-07-2019 15:42:36",
                    'from': 1,
                    'message': "TEST NOTI",
                    'message_id': 11499,
                    'to': "1",
                }
            ],
            "notification": [],
            "to": "1",
            "type": 1,
        },
        "status_code": 200
    }
    data = request.body;
    response.io.emit('room_1', data);
    response.json({"status": "Oke"})
}
module.exports = {
    notification
}