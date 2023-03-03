module.exports=(req,res,next)=>{
  console.log("session:"+req.session.isLoggedIn);
  console.log("session:"+req.isAuthenticated());
  //console.log(req);

if (!req.session.isLoggedIn){
    return res.redirect("/signin");
  }
  
  next();
};