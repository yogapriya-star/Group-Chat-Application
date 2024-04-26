//Library
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const PORT = process.env.PORT || 8000;

const { addUsers, removeUser, getUser, getUserInRoom } = require("./entity");

//Instances
const app = express();
const server = http.createServer(app);
const io = socketio(server, {cors: {origin: '*'}});

//End point
app.get('/',(req,res) => {
    res.json("Api is working");
})

//Socket
io.on('connect', (socket)=>{
    socket.on('join',({name, room},callBack) => {
        const {user, error} = addUsers({id:socket.id,name:name,room:room})
        if(error){
            callBack(error)
            return;
        }
        socket.join(user.room);
        socket.emit('message', {user:'admin', text:`Welcome ${user.name}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin', text:`${user.name} has joined`})
        io.to(user.room).emit('activeUsers', getUserInRoom(user.room))
    })

    socket.on('sendMsg',(message, callBack)=>{
        const user = getUser(socket.id);
        console.log("user123",user);
        if(user){
            io.to(user.room).emit('message',{user:user.name, text:message})
        }
        callBack();        
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'dmin', text:`${user.name} has been left`})
            io.to(user.room).emit('activeUsers', getUserInRoom(user.room))
        }
    })

})

//Run Server
server.listen(PORT, () => console.log(`Server started on the port ${PORT}`));