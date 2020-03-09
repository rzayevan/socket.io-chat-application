$(document).ready(function(){
    var socket = io();

    // Called when "Send" button is pressed
    $("#chat-dialog").submit(function(e){
        e.preventDefault(); // stop reload
        let msg =  $("#chat-input").val();

        // Check if the message is a command or not
        if (msg.toLowerCase().startsWith("/")) {
            parseCommand(msg.split("/")[1].split(" "));
        } else if (msg !== "") {
            socket.emit('chat message', msg); 
        }

        $("#chat-input").val(""); // reset message field
    });

    /**
     * Parses commands sent by client for validity
     * @param command 
     */
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

    /**
     * Displays an error message to the user
     * @param error 
     */
    function displayErrorMessage(error) {
        $("#msg-list").append($('<li>')
            .css("color", "#FD8E70")
            .html(error));
        $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
    }

    /**
     * Displays a success message to the user
     * @param message 
     */
    function displaySuccessMessage(message) {
        $("#msg-list").append($('<li>')
            .css("color", "#4ED964")
            .html(message));
        $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
    }

    //// Listen to events from server ////

    // fired for chat messages being sent from the server
    socket.on('chat message', function(msg) {
        $("#msg-list").append($('<li>').html(msg));
        $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
    });

    // fired when username is updated
    socket.on('username', function(username) {
        $("#text1").html("");
        $("#text1").append("Welcome, " + username + "!");
    });

    // fired when a new user is added to the system
    socket.on('new user', function(message_list) {
        message_list.forEach(message => {
            $("#msg-list").append($('<li>').html(message));
            $(".child")[0].scrollTop = $(".child")[0].scrollHeight;
        });
    });

    // fired when the list of online users needs updating
    socket.on('online users', function(user_list) {
        $("#online-user-list").html("");
        user_list.forEach(user => {
            $("#online-user-list").append($('<li>').html(user.username));
        });
    });

    // fired when error message needs to be displayed
    socket.on('error message', function(error) {
        displayErrorMessage(error);
    });

    // fired when success message needs to be displayed
    socket.on('success message', function(success) {
        displaySuccessMessage(success);
    });
});