$(document).ready(function(){
    var socket = io();

    $("#chat-dialog").submit(function(e){
        e.preventDefault(); // stop reload

        let msg =  $("#chat-input").val();

        if (msg.toLowerCase().startsWith("/")) {
            parseCommand(msg.split("/")[1].split(" "));
        } else if (msg !== "") {
            socket.emit('chat message', msg); 
        }

        $("#chat-input").val("");
    });

    function parseCommand(command) {
        if (command.length !== 2) {
            // show error
            displayErrorMessage("Invalid command supplied. Please try again!");
        } else {
            switch(command[0].toLowerCase()) {
                case "nick":
                    // send nickname over
                    socket.emit('nick', command[1]); 
                    break;
                case "nickcolor":
                    // send nick color over
                    socket.emit('nickcolor', "#" + command[1]);
                    break;
                default:
                    // show error
                    displayErrorMessage("Invalid command supplied. Please try again!");
            }
        }
    }

    function displayErrorMessage(error) {
        $("#msg-list").append($('<li>')
            .css("color", "#FD8E70")
            .html(error));
    }

    function displaySuccessMessage(message) {
        $("#msg-list").append($('<li>')
            .css("color", "#4ED964")
            .html(message));
    }

    //// listen to events from server ////
    socket.on('chat message', function(msg) {
        $("#msg-list").append($('<li>').html(msg));
        $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
    });

    socket.on('username', function(username) {
        $("#text1").append(" " + username + "!");
    });

    socket.on('new user', function(message_list) {
        message_list.forEach(message => {
            $("#msg-list").append($('<li>').html(message));
            $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
        });
    });

    socket.on('online users', function(user_list) {
        $("#online-user-list").html("");
        user_list.forEach(user => {
            $("#online-user-list").append($('<li>').html(user.username));
        });
    });

    socket.on('error message', function(error) {
        displayErrorMessage(error);
    });

    socket.on('success message', function(success) {
        displaySuccessMessage(success);
    });
});