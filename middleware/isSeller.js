module.exports = async (req, res, next) => {
    console.log(req.user);
    if(!req.user){
     next();
    }else{
        if (req.user.role=='BUYER'){
            next();
        }
        if(req.user.role=='SELLER'){
            if(req.user.STAGE=='1'){
              res.redirect("/selleraddress");
            }
            if(req.user.STAGE=='2'){
                res.redirect("/sellergst");
            }
            if(req.user.STAGE=='3'){
                res.redirect("/sellerbank");
            }
            if(req.user.STAGE=='4'){
                res.redirect("/reviewseller");
            }
            if(req.user.STAGE=='5'){
                next();
            }
        }
    }
}