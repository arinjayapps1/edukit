const AWS = require('aws-sdk');
const fs=require('fs');
const path= require('path');
const mime = require("mime-types");
const { v4: uuid } = require("uuid");

const spacesEndpoint = new AWS.Endpoint(process.env.S3_BUCKET_ENDPOINT);
//console.log("key:"+process.env.S3_BUCKET_KEY)
const s3 = new AWS.S3({endpoint: spacesEndpoint,
                      accessKeyId: process.env.S3_BUCKET_KEY,
                     secretAccessKey: process.env.S3_BUCKET_SECRET
                    });

exports.uploadFileToS3 = ({ file, ACL = "public-read" }) =>
{
  //console.log(file.buffer);
  const contentType = mime.contentType(file.mimetype);
  //console.log("contentType:"+contentType);
  const ext = mime.extensions[contentType][0];
  //console.log("ext:"+ext);
  const fileName = uuid() + "_" + file.originalname;
  //                      
  return new Promise((resolve, reject) => 
        {
         //const buffer = fs.readFileSync(filePath);
         const buffer=file.buffer;
         s3.putObject({ Bucket: process.env.S3_BUCKET_NAME,
                        Key   : fileName, 
                        ACL   : ACL, 
                        Body  : buffer, 
                        ContentType: contentType 
                      }, (err, data) =>
                         {
                           if (err) {
                                     reject(err);
                                    } 
                           else {
                                 data.Url = `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_BUCKET_ENDPOINT}/${fileName}`;
                                 resolve(data);
                                }
                          });
        });
};     

exports.upload=async(file1)=>{
  let data=null;
  try{
    data=await Spaces.uploadFileToS3({
      file: file1
    });
    //data="file";
  }
  catch(err){
    console.log("Error uploading Product Image due to error:"+err);
    data=null;
  }
  return data;
  
};