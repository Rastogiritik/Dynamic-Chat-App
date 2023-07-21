const Chat = require('../models/chatModel');
// const User = require('../models/userModel');

const saveChat =async (req, res) => {

    try {

        let chat =new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message
        });

        let newChat = await chat.save();
        res.status(200).send({ success:true, msg:'chat inserted!', data:newChat  });
        
    } catch (error) {
        res.status(400).send({ success:false, msg:error.message })
    }
}



module.exports = {
    saveChat
}