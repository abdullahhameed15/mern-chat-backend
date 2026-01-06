const socketIo = (io) => {
    // Store Connected users with their room information using socket.id as their key
    const connectedUsers = new Map();
    // Handle New Socket Connections
    io.on("connection", (socket) => {
        // Get User from authentication
        const user = socket.handshake.auth.user;
        console.log("User Connected" , user?.username);
        //!START: Join Room Handler
        socket.on("join room" , (groupId) => {
            // Add Socket To The Specified Room
            socket.join(groupId);
            // Store user and room info in connectedUsers map 
            connectedUsers.set(socket.id  , {user , room : groupId});
            // Get list of all users currently in the room
            const usersInRoom = Array.from(connectedUsers.values()).filter((u) => u.room === groupId).map((u) => u.user);
            // Emit Updating Users Lists to all clients in the room
            io.in(groupId).emit("Users In Room" , usersInRoom);
            // BroadCast join notification to all other users in the room 
            socket.to(groupId).emit("notification" , {
                type: "USER_JOINED",
                message: `${user?.username} Has Joined`,
                user: user,
            })
        })
        //!END: Join Room Handler

        //!START: Leave Room Handler
        // Trigger when user manually leaves a room
        socket.on("leave room" , (groupId) => {
            console.log(`${user?.username} leaving room : ` , groupId);
            // Remove Socket from the room
            socket.leave(groupId);
            if(connectedUsers.has(socket.id)){
                // Remove User From Connected Users And Notify Others
                connectedUsers.delete(socket.id);
                socket.to(groupId).emit("user left" , user?._id);
            }
        })
        //!END: Leave Room Handler

        //!START: New Message Handler
        socket.on("new message" , (messageData) => {
            // Broadcast message to all users in the room
            socket.to(messageData.groupId).emit("message received" , messageData);
        });
        //!END:  New Message Handler
        
        //!START: Disconnect Handler
        socket.on("disconnect" , () => {
            console.log(`${user?.username} disconnected`);
            if(connectedUsers.has(socket.id)){
                // Get User's Room Info Before Removing
                const userData = connectedUsers.get(socket.id);
                // Notify Other User's in the room about user's departure
                socket.to(userData.room).emit("user left" , user?._id);
                // Remove User From Connected Users 
                connectedUsers.delete(socket.id);
            }
        })
        //!END:  Disconnect Handler
        
        //!START: Typing Indicator
        // Trigger When User Start Typing 
        socket.on("typing" , ({groupId , username}) => {
            // BroadCast Typing Status To Other Users In The Room
            socket.to(groupId).emit("user typing" , {username});
        });

        // Trigger When User Stops Typing
        socket.on("stop typing" , ({groupId}) => {
            // BroadCast stop Typing Status To Other Users In The Room
            socket.to(groupId).emit("user stop typing" , {username : user?.username});
        });
        
        //!END:  Typing Indicator
    });
};

module.exports = socketIo;