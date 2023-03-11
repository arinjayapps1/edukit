const School = require('../models/school');

module.exports = async (req, res, next) => {
    let schooldId = req.params.schoolId;
    //console.log(req);
    //console.log("inside ischeckout.js");
    try {
        let schools = await School.findAll({
            where: {
                id: schooldId
            }
        });
        console.log("schools");
        console.log(schools);
        if (schools.length < 1) {
            let message = req.flash("message", "Please add school before creating School Book Set.");
            req.session.save(err => {
                res.redirect("/school");
            });
        }
        if (schools[0].userId !== req.session.user.id) {
            //console.log("inside unauthenticated");
            let message = req.flash("message", "Not Authorized.");
            req.session.save(err => {
                res.redirect("/school");
            });
        }
        
        next();
    } catch (err) {
        console.log("Error in checkschool due to error:" + err);
    }
}