if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStatergy=require("passport-local");
const User=require("./models/user.js");


const  listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60, // 1 day 
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,  // A strong, unpredictable secret
    resave: false,           // Avoid resaving unchanged sessions
    saveUninitialized: false, // Save new sessions even if they're empty
    cookie: {
        httpOnly: true,     // Allow cookies to be visible to the client-side (disable if needed)
        secure: false,       // Set to true if you're using HTTPS
        maxAge: 1000 * 60 * 60 * 24, 
        expires:Date.now()+7*24*60*60*1000,// Set cookie expiration (24 hours in this case)
    }
};


// app.get("/",(req,res)=>{
//     res.send("Hello World");
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//use static authenticate method model in localstatergy
passport.use(new LocalStatergy(User.authenticate()));
//serialize user for session //deserialize user for session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         username:"demouser",
//         email:"demouser@gmail.com",
//     });
      
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })


app.listen(8080,()=>{
    console.log("server is running on port 8080");
});


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="smtg went wrong"}=err;
    res.status(statusCode).render("Error.ejs",{message});
});