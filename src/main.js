$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    var toId = 0;
    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page

    // Prompt for setting a username
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    // var socket = io();
    var a = $usernameInput.val().trim();
    ar = a.split("_");
    username = ar[0];
    var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BsYXllcmR1b1wvcHVibGljXC9cL2FwaVwvbG9naW4iLCJpYXQiOjE1NjM3OTM2MDYsImV4cCI6MTU2Mzg4MDAwNiwibmJmIjoxNTYzNzkzNjA2LCJqdGkiOiJHbjU3ZlBWMEVMTEJ2c0N4Iiwic3ViIjoxLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0._Y3dWv42uImD537AhfhoTmc_p3SOuWCTJqxKAcTGKDE';
    var socket = io.connect('http://localhost:3000', {
        query: {
            token: token,
            uuid: 1
        }
    });
    const addParticipantsMessage = (data) => {
        var message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    // Sets the client's username
    const setUsername = () => {
        var a = cleanInput($usernameInput.val().trim());
        ar = a.split("_");
        username = ar[0];
        toId = ar[1];
        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your username
            socket.emit('add user', username);

            id = $usernameInput.val();
            console.log('room_' + username);
            socket.on('room_' + username, (data) => {
                if (data.type == 5) {
                    addChatTyping(data);
                } else if (data.type == 6) {
                    removeChatTyping(data);
                } else if (data.type == 2) {
                    console.log(data);
                    console.log(data.data);
                    data = {
                        message: data.messages[0].message,
                        username: toId,
                        user_to: toId
                    }
                    addChatMessage(data);
                } else {
                    console.log(data);
                    console.log(data.data);
                    data = {
                        message: data.data.messages[0].message,
                        username: toId,
                        user_to: toId
                    }
                    addChatMessage(data);
                }
            });
        }
    }

    // Sends a chat message
    const sendMessage = () => {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message,
                user_to: 1
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', {
                username: username,
                message: message,
                user_id_receive: toId,
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BsYXllcmR1b1wvcHVibGljXC9cL2FwaVwvbG9naW4iLCJpYXQiOjE1NjM3OTM2MDYsImV4cCI6MTU2Mzg4MDAwNiwibmJmIjoxNTYzNzkzNjA2LCJqdGkiOiJHbjU3ZlBWMEVMTEJ2c0N4Iiwic3ViIjoxLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0._Y3dWv42uImD537AhfhoTmc_p3SOuWCTJqxKAcTGKDE'
            });
        }
    }

    // Log a message
    const log = (message, options) => {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    const addChatMessage = (data, options) => {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    const addChatTyping = (data) => {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    const removeChatTyping = (data) => {
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    const addMessageElement = (el, options) => {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    // Updates the typing event
    const updateTyping = () => {
        if (connected) {
            var a = cleanInput($usernameInput.val().trim());
            arr = a.split("_");
            if (!typing) {
                typing = true;
                socket.emit('typing', {username: arr[0], user_to: arr[1]});
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(() => {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing', {username: arr[0], user_to: arr[1]});
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    const getTypingMessages = (data) => {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    const getUsernameColor = (username) => {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Keyboard events

    $window.keydown(event => {
        var a = cleanInput($usernameInput.val().trim());
        arr = a.split("_");
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing', {username: arr[0], user_to: arr[1]});
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('input', () => {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
        $inputMessage.focus();
    });

    // Socket events
    socket.emit(1, {
        username: 'test',
        message: 'test'
    });
    // Whenever the server emits 'login', log the login message
    socket.on('login', (data) => {
        connected = true;
        // Display the welcome message
        var message = "Welcome to Socket.IO Chat – ";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    // // Whenever the server emits 'new message', update the chat body
    // socket.on('new message', (data) => {
    //     addChatMessage(data);
    // });

    // Whenever the server emits 'new message', update the chat body

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', (data) => {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    // socket.on('typing', (data) => {
    //     addChatTyping(data);
    // });

    // // Whenever the server emits 'stop typing', kill the typing message
    // socket.on('stop typing', (data) => {
    //     removeChatTyping(data);
    // });

    socket.on('disconnect', () => {
        log('you have been disconnected');
    });

    socket.on('reconnect', () => {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', () => {
        log('attempt to reconnect has failed');
    });

});