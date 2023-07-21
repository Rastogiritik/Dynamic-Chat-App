const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const registerLoad = async (req, res) => {
  try {
    // * rendring register page from register.ejs
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

// * Is is use for register a user with POST method on register form
const register = async (req, res) => {
  // ! try and cath isliye use krna taki error aram se identify ho ske.
  try {
    // * ye ek promise return krega isliye async await use krenge.
    // ! or aise hnm apne password ko bcrypt ki help se hash me bdlte hai
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // * ye method hai image file ko save krne ki or new user create krne ki in db.
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      // * hub hnm image ko lenge to hme uska exact storage path and fileame methos use krna pdta hai.
      image: "images/" + req.file.filename,
      password: passwordHash,
    });

    // * .save method user ko db me save krne ke kaam aata hai.
    await user.save();
    res.render("register", { message: "Your Registration is Successful" });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    // * rendring login page login.ejs
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    // * ye dono variables form data ki values get krne ke liye
    const email = req.body.email;
    const password = req.body.password;


    // * ye hai form ki value ko db ki value se match krne ke liye
    let userData = await User.findOne({ email: email });


    // * ye ki agr match hoti hai to kya krna hai
    if (userData) {

      // * agar email match hoti hai to password bhi check krke match krne ke liye
      const passwordMatch = await bcrypt.compare(password, userData.password);

      //  * dono chize match ho jaye to session bane ka kaam or unko login krne ka kaam
      if (passwordMatch) {
        // * hnm pehle apna session store krenge
        req.session.user = userData; 
        return res.redirect("/dashboard");
      }
      else{
        res.render("login", { message: "Email and Password is Incorrect" });

      }
    } 
    else {
       res.render("login", { message: "Email and Password is Incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {

    // * when we logout someone than we also destroy his session from the session data.
    req.session.destroy();
    res.redirect('/');

  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {


    //* aise hnme sare users check kiye fir showing user in chat app
    let users = await User.find({ _id: { $nin:[req.session.user._id] }})

    // * jub hnm user ko dashboard me redirect krnge to uske sath user ka data bhi bhejenge isliye hnm wo data session me se lenge.
    //  !jo users hnme pehle define kiya hai ab hnm usko apne dashboard me pass kr denge.
   res.render('dashboard', 
              {
                user: req.session.user, 
                users:users
              });

  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  register,
  registerLoad,
  loadLogin,
  login,
  logout,
  loadDashboard,
};
