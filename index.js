var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3310;

app.use(express.static(__dirname + '/filesToLoad'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let user_list = [];
let message_list = [];
let userCount = 0;

io.on('connection', function(socket){
    let current_user = registerUser(socket);

    //// Events from client ////

    // fired when clients are disconnected
    socket.on('disconnect', function(){
        console.log(current_user.username + " disconnected.");

        // remove current user from users list
		let index = user_list.map(function(e) { return e.username; }).indexOf(current_user.username);
        user_list.splice(index, 1);

        // broadcast the change
        socket.broadcast.emit('online users', user_list);
        socket.emit('online users', user_list);
	});

    // fired when chat message is received from a client
    socket.on('chat message', function(msg){
        // format fields to make them look pretty
        let formatted_timestamp = "<span style='color: #26DDF4;'>" + getTime() + "</span>";
        let formatted_username = "<span style='color: " + current_user.colour + ";'>" + current_user.username + ": " + "</span>";
        let formatted_message = "<span style='color: #FFD62C;'>" + msg + "</span>";

        // broadcast the message to all connected clients 
        let broadcast_message = "<p>" + formatted_timestamp + formatted_username + msg + "</p>";
        message_list.push(broadcast_message); 
        socket.broadcast.emit('chat message', broadcast_message);

        // send different colour message to client only 
        let client_message = "<p>" + formatted_timestamp + formatted_username + formatted_message + "</p>";
        socket.emit('chat message', client_message);
    });

    // fired when a command is received from the client
    socket.on('nick', function(nickname) {
        // check if the username already exists
        let nickExists = false;
        user_list.forEach(user => {
            if (user.username == nickname) {
                // send error message
                socket.emit('error message', "Nickname already exists. Please try again!");
                nickExists = true;
            }
        });

        // update the client's username if it is unique
        if (!nickExists) {
            let index = user_list.map(function(e) { return e.username; }).indexOf(current_user.username);
            user_list[index].username = nickname;

            socket.emit('success message', "Nickname successfully changed to " + nickname);
            socket.emit('username', nickname);
            socket.broadcast.emit('online users', user_list);
            socket.emit('online users', user_list);
        }
    });

    // fired when a command is received from the client
    socket.on('nickcolor', function(nickcolor) {
        // check if the colour is valid
        let colourValid = true;
        if (!(/^#[0-9A-F]{6}$/i.test(nickcolor))) {
            socket.emit('error message', "Invalid color code supplied. Please try again!");
            colourValid = false;
        }

        // update the client's nick colour if valid
        if (colourValid) {
            user_list.forEach(user => {
                if (user.username == current_user.username) {
                    user.colour = nickcolor;
                    socket.emit('success message', "Nick color successfully changed to " + nickcolor);
                }
            });
        }
    });

});

/**
 * Registers clients to the system
 */
function registerUser(socket) {
    let user = {
        username: "User " + userCount,
        colour: "#B8ACC5"
    };
    user_list.push(user);
    userCount++;
    socket.emit('username', user.username);
    console.log(user.username + " connected.");

    // add to online users list
    socket.broadcast.emit('online users', user_list);
    socket.emit('online users', user_list);
    socket.emit('new user', message_list);
    return user;
}

/**
 * Retrieve current time
 */
function getTime() {
    var today = new Date();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var time = ((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute);
    return "[" + time + "] ";
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});