const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local",
            {
                // successRedirect:"/listings",
                failureRedirect:"/login",
                failureFlash:true,
        }),
        userController.login,
    );


// router.get("/logout",(req,res,next)=>{
//     req.logout((err)=>{
//         if(err){
//         return next(err);
//     };
//     req.flash("success","you have logged out");
//     res.redirect("/listings");
// });
// });

router.get("/logout",userController.logout)
module.exports=router;