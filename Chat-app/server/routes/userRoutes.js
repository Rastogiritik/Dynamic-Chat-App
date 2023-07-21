const express = require('express');
const user_route = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
// * middlewares for authentication
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');
const chatController = require('../controllers/chatController');

// * create session with express session
const session  = require('express-session');
const { SESSION_SECRET } = process.env;
user_route.use(session({ 
    secret:SESSION_SECRET,
    resave:false,
    saveUninitialized: true
 }))

//! this is use for match the header of request and get the data from the request querry
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded( {extended:true} ));

// * view engine ke path route me set krne ka method.
user_route.set('view engine', 'ejs');
user_route.set('views', 'views');


// * static data ke liye folder  define krne user route me.
user_route.use(express.static('public'));


// *multer ke liye storage define krna.
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename:function(req, file, cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null, name);
    }
});


// * multer ko storage type btana
const upload = multer( { storage:storage });


// !set routes here for get the register page and post for save the user data from form data.
user_route.get('/register', auth.isLogout, userController.registerLoad);
user_route.post('/register', upload.single('image') ,userController.register);


// * get the login page and than post the login data and match.
user_route.get('/', auth.isLogout ,userController.loadLogin);
user_route.post('/', userController.login);

// * get logout method
user_route.get('/logout', auth.isLogin, userController.logout);

// * after login go to dashboard
user_route.get('/dashboard', auth.isLogin, userController.loadDashboard);

// *chat save
user_route.post('/save-chat', chatController.saveChat);


// *if user send unvalid req than redirect to login page
user_route.get('*', function(req, res){
    res.redirect('/');
})


module.exports= user_route;