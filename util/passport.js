const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User         = require("../models/user");
const {
  validationResult
} = require("express-validator");

var bCrypt = require('bcrypt');
//
passport.serializeUser((user, cb) => {
  //console.log("user:"+user);
  //console.log("serialize user"+user);
    cb(null, user.id);
  });
  
  
  passport.deserializeUser((id, cb) => {
    User.findByPk(id).then(user =>{
      cb(null, user);
    }
      ).catch(err=>{console.log(err);});
    
  });
  

   
//google strategy
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
   console.log(profile);

    User.findOne({ where: {USER_EMAIL:profile.emails[0].value}}).then(
        user => {
            if(!user){
                //console.log('user not found');
                const newUser = User.create({
                    firstName:profile.name.givenName,
                    lastName:(profile.name.familyName===undefined)?profile.name.givenName:profile.name.familyName,
                    googleId:profile.id,
                    email:profile.emails[0].value,
                    role:"BUYER"

                }).then( createdUser =>{
                   cb(null,createdUser);
                }).catch(err=>{
                  console.log(err);
                });
                
            }
            else{
                //console.log(user.googleId);
                if(user.GOOGLE_ID===null){
                  user.GOOGLE_ID=profile.id;
                  return user.save().then( data =>{
                    //console.log("user found");
                     cb(null,user);
                  }
                    
                  );
                }
                //console.log("user found");
                cb(null,user);
            }
        }
    ).catch( err =>{
        console.log("error while fetching user"+ err);
    }
    );
  }
));


passport.use('local-signup', new LocalStrategy(
        
  {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback

  },async function (req, email, password, done) {
    
      var generateHash = async function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);

    }
      try{
        

      let user=await User.findOne({where: {USER_EMAIL: email}});
      if (user) {
        req.flash("loginError",'Email already exists.');
        req.session.userdata= {
          email: email,
          emailStatus:'is-invalid',
          PASSWORD: password,
          passwordStatus:'is-valid',
          firstName: req.body.first_name,
          firstNameStatus:'is-valid',
          lastName: req.body.last_name,
          lastNameStatus:'is-valid',
          MOBILE:req.body.mobile,
          mobileStatus:'is-valid',
          confirmpassword:req.body.confirmpassword,
          confirmpasswordStatus:'is-valid',
      };
        req.session.save(err=>{
          return done(null, false);
        });
        
      }
      else{
        var userPassword = await generateHash(password);
        var data = {
            email: email,
            PASSWORD: userPassword,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            MOBILE:req.body.mobile,
            role:"BUYER"
        };
        let newUser =await User.create(data);
        if (!newUser) {
          req.flash("loginError",'User not created.');
          req.session.userdata= {
            email: email,
            PASSWORD: password,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            MOBILE:req.body.mobile
        };
        req.session.save(err=>{
          return done(null, false);
        });
        }
        if (newUser) {
            return done(null, newUser);
        }
      }  
      }
      catch(err){
        return done(null, false,{message:'Error while Creating Customer due to error:'+err});
      }
}
));

//LOCAL SIGNIN
passport.use('local-signin', new LocalStrategy(   
  {// by default, local strategy uses username and password, we will override with email
   usernameField: 'email',
   passwordField: 'password',
   passReqToCallback: true // allows us to pass back the entire request to the callback
 },
async function (req, email, password, done) {
var isValidPassword = async function (userpass, password) {
           console.log(userpass);
           console.log(password);
           
          return bCrypt.compareSync(password,userpass);

      }
 try{
  let user = await User.findOne({ where: {email: email}});
  if (!user) {
    req.flash("loginError",'No user found.');
    req.session.save(err=>{
      return done(null, false);  
    });
    //return done(null, false,{message:'No user found.'});
 
  }
  else{
    console.log(user.PASSWORD);
    if(user.PASSWORD){
      if (!isValidPassword(user.PASSWORD, password)) {
        //console.log("first if");
        req.flash("loginError",'Incorrect Password.');
        req.session.save(err=>{
         return done(null, false);  
       });
        //return done(null, false,{message:'Incorrect Password.'});

     }
     else{
      var userinfo = user.get();
      return done(null, userinfo);

     }
    }
    else{
      req.flash("loginError",'Incorrect Password.');
             req.session.save(err=>{
              return done(null, false);  
            });
    }
  }
}
catch(err){
  console.log("Error While signin due to unexpected error:"+err);
}
}

));