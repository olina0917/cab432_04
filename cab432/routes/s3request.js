const express = require('express');
const aws = require('aws-sdk');
const axios = require('axios');
const mime = require('mime-types');
const router = express.Router();
const fs = require('fs')
const sharp = require('sharp');
const checkRedis = require('./redis')

let awsConfig = {
  region: 'ap-southeast-2',
  accessKeyID:'ASIA5DYSEEJ43C6UQKDA',
  secreAccesssKey:'eiQGL1g5fpJy4a4AgKcAjil70sDHMvnWvIO2Yswc',
  sessionToken:'IQoJb3JpZ2luX2VjEHIaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAMnvHkiqB6mFRjebdZUfylaVBZEvfCLEvkT3skkSoY5CAiEAi5XcrOeIF3FU4ztadpi8HtUCKqb1LTnik3mg/73M5QwqrQMIaxACGgw5MDE0NDQyODA5NTMiDHq3nvu62quXMQdxTiqKAzc3ARepTGbd0gvHicFewkk480vwN3nl4TDJ5fFY8RIGdV4+i7GwN0Eer3wI30jvI2fI3NaA9xNqZWTmGUp8Xp6ohpidQOgyN3Y7ECZC0M4YvRPtqk7pJv+4OvkTmUVMXS6RwOg+EAkOLdGUClEdupbUXHvzTKrDIaL/oO6ocScOmQBc83Ma11KeCylbKISGMHyL5UsmloC1gbn3vZG8JZDqAO2dBalMU4LvB1xbnEOqrgfiDO8j610lpWyhgnR+VzE30j9PdNcE7nxMDdCxsTZr0M0XxFML8ox3RgP7yhF5ZAq6dMiTYNAxVUhcj0Kl5+uxFHjGQnM+5YPpVQAMcxyOmUZFBFXyzCTT1p6fTN+5skGpTNquDNOJt1qTO31Ya6H+WavfPM1kGMsVLBZyqlMUfBQAFSpRtsKKt1JFucL1Pyu/porpBOEMyXPRC1rUJoRtXSjfk+j6Ne14d1K08yt9Q78MgDVbc7qnjYY3GduQFvw4ofqO2KaEhT1vX5OOQkQ0cE8eGNiSs7cwrKWxmwY6pQET2TWWLZzqaC7OD874TGNrMhVNOYbJ3kbz/3kz9Lc3AnVMyvzcqLhZ/thJsVuU9Kl5mW2s4uFX8tQRXqBzV+kHyZlPPH3kuPFAe13Y1QZl8jNgWUCUorE4L9HScgnaPuGvzJdkoGDiwS1BYSpZgRfW7o5lCRQeyywjbMYZ7m3Ia5QYMdfE4IiZm9lVnFZp2BoBEhHg/MTvBuO25nv7k++Yebr1WsE='
}
aws.config.update(awsConfig);
// S3 setup
const bucketName = "olina123";
const s3 = new aws.S3({
  apiVersion: "2006-03-01",
  region: "ap-southeast-2"
});

(async () => {
  try {
    console.log("Creating bucket...");
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Create bucket: ${bucketName}`);
  } catch (err) {
    if (err.statusCode !== 409) {
      console.log(`Error creating bucket: ${bucketName}`, err.stack);
    } else {
      console.log(`Bucket ${bucketName} already exists!`);
    }
  }
})();

router.get("/", async (req, res, next) => {
  const image = req.query.name;

  console.log(image);
});

router.post('/store', async (req, res, next) => {
  //const image = req.query.name;
  const uploadedimage = req.files["file0"];
  const s3Key = uploadedimage.md5;
  console.log(s3Key);

  let redischeck = await checkRedis(s3Key);
  console.log("redischeck: ",redischeck);

  //console.log("path1", uploadedimage);

  // let path1 = req.files["file0"];

  console.log("------------"); 
  if(!redischeck){ 
  //image resizing
  const image = sharp(uploadedimage.data); 
  image
    .resize({
      width: 200, 
      height: 200,
      fit: "contain",
      position: "left",
    }).toBuffer().then((data) => {
      console.log("Resized image: ", data);
      asyncCall(data);
      //return res.send(s3Result.Body.toString("base64"));
    });
  }else{
    const params = { Bucket: bucketName, Key: s3Key };
    const s3Result = await s3.getObject(params).promise();
    //console.log("s3Result: ", s3Result.Body.toString("base64"));
    console.log("contenttype: ", s3Result.ContentType);
    return res.send(s3Result.Body.toString("base64"));
  }
  //console.log("uploadedimage: ", uploadedimage);
  //console.log("Resized image: ", image);

  console.log("---------------");

  // const image1 = fs.readFileSync(path1, function (err, data) {
  //   fs.writeFileSync('image1', data);
  // });

  const mimeType = uploadedimage.mimetype;
  //console.log("mimeType: ", mimeType);


  //console.log("url", urlParams);

  // (async () => {
  //   try {
  //     console.log("image desuyo", image);
  //     await s3.putObject(urlParams).promise();
  //     console.log(`Successfully uploaded data to ${bucketName}/${s3Key}`);
  //   } catch (err) {
  //     console.log(err, err.stack);
  //   }
  // })();

  async function asyncCall(data) {
    try {
      const urlParams = {
        Bucket: bucketName,
        Key:s3Key,
        Expires: 600,
        ContentType: mimeType,
        Body: data
      };
      console.log("image desuyo", data);
      await s3.putObject(urlParams).promise();
      console.log(`Successfully uploaded data to ${bucketName}/${s3Key}`);
    } catch (err) {
      console.log(err, err.stack);
    }
  };

  //   try {
  //     console.log("-------------");
  //     // const s3Result = await s3.getObject(urlParams).promise();
  //     // Serve from S3
  //     //const s3JSON = JSON.parse(s3Result.Body);
  //     //res.json(s3JSON);
  // } catch (err) {
  //   console.log("AAAAAAAAA");
  //     if (err.statusCode === 404) {
  //         // Serve from Wikipedia API and store in S3
  //         response = await axios.get(urlParams);
  //         const responseJSON = response.data;
  //         const body = JSON.stringify({
  //             source: "S3 Bucket",
  //             ...responseJSON,
  //         });
  //         const objectParams = { Bucket: bucketName, Key: hash, Body: body };
  //         await s3.putObject(objectParams).promise();
  //         console.log(`Successfully uploaded data to ${bucketName}/${req.files["file0"].md5}`);
  //         res.json({ source: "Resized imgae successfully uploaded", ...responseJSON });
  //     } else {
  //         // Something else went wrong when accessing S3
  //         res.json(err);
  //     }
  // }


  // try {
  //   console.log(`Generation pre-signed URL for image ${image}...`);
  //   const presignedUrl = s3.getSignedUrl('putObject', urlParams);
  //   console.log(`Presigned URL for ${image} generated!`);
  //   res.json({ s3Url: presignedUrl });
  // } catch (err) {
  //   if (err.statusCode === 404) {
  //     // Serve from Wikipedia API and store in S3
  //     //response = await axios.get(searchUrl);
  //     //const responseJSON = response.data;
  //     const body = JSON.stringify({
  //       source: "S3 Bucket",
  //       ...responseJSON,
  //     });

  //     const objectParams = {
  //       Bucket: bucketName,
  //       Key: hash,
  //       Expires: 600,
  //       ContentType: mimeType,
  //       Body: image1
  //     };

  //     //const objectParams = { Bucket: bucketName, Key: s3Key, Body: body };
  //     await s3.putObject(objectParams).promise();
  //     console.log(`Successfully uploaded data to ${bucketName}/${hash}`);
  //     res.json({ source: "img", ...responseJSON });
  //   } else {
  //     // Something else went wrong when accessing S3
  //     res.json(err);
  //   }
  // }
});

module.exports = router;