const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");  
const useRouter = require("./routes/userRoutes");
const socketIo = require("./socket");
const { group } = require("console");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
dotenv.config();


const app = express();
const server = http.createServer(app);

const io = socketio(server , {
    cors : {
        origin : ["http://localhost:5173"],
        methods : ["GET" , "POST"],
        credentials : true
    }
});

// Middlewares
app.use(cors());
app.use(express.json());
// Connect To Db
    mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected To DB")).catch((err) => console.log("Mongo Db Connected Failed" , err))
// Initialize 
socketIo(io);

// Our Routes
app.use("/api/users" , useRouter);
app.use("/api/groups" , groupRouter);
app.use("/api/message" , messageRouter)

// Start The Server
const PORT = process.env.PORT || 5000;
server.listen(PORT , console.log('Server Is Up And Running On Port' , PORT));