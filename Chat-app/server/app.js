// * dotenv ko require krenge environment varibale ke liye
require('dotenv').config();


// * database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/sandesh-app');


// * app connection with express.js
const express = require('express');
const app = express();



// *this is the http server which connect client side to his server side.
const http = require('http').Server(app);


// *this is the user routes which is connect by our app.
const userRoutes = require('./routes/userRoutes')
app.use('/', userRoutes);


// * user model ko require kiya hai taki hnm db me status update kr ske onli ne or offine.
const User = require('./models/userModel')
const Chat = require('./models/chatModel')


// * socket.io configration
const io = require('socket.io')(http);

// ! this is the name space for describe the paths for connection or isko hnm apne frontend me use krte hai
var userNameSpace = io.of('/user-namespace');

// ! normally hnm ya pr wo varible likhte hai jisme hnme apna socket.io pass kiya ho 
// ! but abhi hnme usko namespace define kr rkha hai to hnm name space hi use krenge.
userNameSpace.on('connection', async function (socket) {
    console.log('user Connected');

    let userId = socket.handshake.auth.token;

    // * Update krne ke liye user ka status.
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: '1' } });


    // * broad casting in socket.io in this we update our user status dynamiclly to every use
    // * it can possible only by brodcast isse hnm isko pure porject me khi se bhi accesses kr skte hai
    // * or custom event ko fire krne ke liye hnm .emit() funciton ka use krte hai.
    socket.broadcast.emit('getOnlineUser', { user_id: userId });


    socket.on('disconnect', async function () {
        console.log('user disconnect');

        // * Update krne ke liye user ka status.
        await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: '0' } });

        // * broadcastion for offline status
        socket.broadcast.emit('getOfflineUser', { user_id: userId });
    })

    // chatting update in reciever
    socket.on('newChat', function (data) {
        socket.broadcast.emit('loadNewChat', data);
    });

    // load old chat
    socket.on('existsChat',async function(data){
       var chats = await Chat.find({ $or:[
            {
                sender_id: data.sender_id,
                receiver_id: data.receiver_id
            },
            {
                sender_id: data.receiver_id,
                receiver_id: data.sender_id
            }  
        ]})

        // ye bhejra hai backend se sari chats frontend pr
        socket.emit('loadAllChats', { chats: chats });
    })
})



// *this is sever side port where we operate our sever with client.
http.listen(5002, function(){
    console.log("server is running");
})