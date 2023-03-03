module.exports = async (req, res, next) => {
    console.log(req.user);
    if(!req.user){
     next();
    }else{
        if (req.user.role=='BUYER'){
            res.redirect("/403");
        }
        if(req.user.role=='SELLER'){
            if (req.user.STAGE=='5'){
                req.flash("message","For any changes in GST,Bank or Store details,Please raise an incident.");
                req.session.save(err=>{
                    res.redirect("/403");
                });
                
            }
            else{
                next();
            }
            
        }
    }
}