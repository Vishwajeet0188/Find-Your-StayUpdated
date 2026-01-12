// same for user.js : 
const User = require("../models/user");


//Render signup form : 

module.exports.RenderSignUpForm =(req, res) => {
  res.render("users/signup.ejs");
};


// signup
module.exports.SignUp = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password, role } = req.body;
    const  userRole = role || "user";

    if (!fullName || fullName.trim() === "") {
      throw new Error("Full Name is required");
    }

    const newUser = new User({
      fullName: fullName.trim(),
      username,
      email,
      phone,
      role: userRole
    });

    // if (adminCode === process.env.ADMIN_SECRET) {
    //   newUser.role = "admin";
    // }

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Find Your Stay!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};




// render login form : 

module.exports.RenderLogInForm = (req,res) => {
    res.render("users/loginChoice.ejs");
};

// login : 

module.exports.LogIn = async(req,res) => {
  console.log("loginType:", req.body.loginType);

  const loginType = req.body.loginType;
  const user = req.user;
  req.flash("success","Welcome back to Find Your Stay!");

  if(loginType == "lister"){

    if(user.role === "lister"){
      req.flash("success","Logged In As Lister Now You Can Add Your New Listing Or Modify Your Listings!");
      return res.redirect("/listings/manage");
    }
    if(user.role === "admin"){
      return res.redirect("/admin/dashboard");
    }
    if (loginType === "user") {
      return res.redirect("/listings");
    }


    req.flash("error","You are not authorized as Property Lister");
    return res.redirect("/login");
    
  }
  const redirectUrl = res.locals.redirectUrl || "/listings";
  delete req.session.redirectUrl;

  res.redirect(redirectUrl);
};


// logout : 

module.exports.LogOut = (req,res,next) => {
  req.logout((err) => {
    if(err){
      return next(err);
    }
    req.flash("success","you are looged out!");
    res.redirect("/listings");
  });
};



