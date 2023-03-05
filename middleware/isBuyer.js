module.exports = async (req, res, next) => {
    console.log(req.user);
    if(!req.user){
     next();
    }else{
        if (req.user.role=='BUYER'){
            res.redirect("/403");
        }
        if(req.user.role=='SELLER'){
            
                next();
            }
            
        }
    }
   