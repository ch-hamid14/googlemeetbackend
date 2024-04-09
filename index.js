const express = require('express')
const { Server } = require('socket.io')
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());
const io = new Server(
    { cors: true }
);
const port = 8080
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', (socket) => {
    console.log('New Connection')
    socket.on('join-room', (data) => {
        const { roomId, emailId } = data;
        console.log(`User joined with room id:${roomId}`)
        emailToSocketMapping.set(emailId, socket.id)
        socketToEmailMapping.set(socket.id, roomId)
        socket.join(roomId);
        socket.emit('joined-room', {roomId})
        socket.broadcast.to(roomId).emit('new-user-joined', { emailId })
    })
    socket.on('call-user', (data) => {
        const { emailId, offer } = data
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId);
        // console.log(socketId);
        socket.to(socketId).emit('incoming-call', { from: fromEmail, offer })
    })
    socket.on('call-accepted', (data) => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accepted', { ans })

    })
})
app.get('/', (req, res) => {
    res.send("Server Running successfully")
})

app.listen(port, () => {
    console.log(`Server Started at port: ${port}`);
})
io.listen(8081)