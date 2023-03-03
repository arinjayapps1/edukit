const cloudinary = require('cloudinary').v2;
cloudinary.config({
  secure: true
});

exports.uploadImage = async (imagePath,options) => {
  let result=null;
  // Use the uploaded file's name as the asset's public ID and 
  // allow overwriting the asset with new versions
  //const options = {
    //use_filename: true,
    //unique_filename: false,
    //overwrite: true,
  //};
 try {
    // Upload the image
     result = await cloudinary.uploader.upload(imagePath, {eager:[
      {height: 260, width:150,crop: "limit"},
      {background: "#FFFFFF", height: 410, width: 520, crop: "pad"}
      ]});
    
  } catch (error) {
    console.error(error);
    result=null;
  }

  return result;
};