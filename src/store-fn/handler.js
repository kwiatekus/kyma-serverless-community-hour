"use strict";

const AWS = require("aws-sdk");

module.exports = {
  main: async function (event, context) {

    throw("Jebło")

    let s3 = new AWS.S3({
      endpoint: readEnv("S3_ENDPOINT"),
      accessKeyId: readEnv("S3_ACCESSKEY_ID"),
      secretAccessKey: readEnv("S3_SECRET"),
    });

    let body = event.data;

    console.log("Headers from eventing",event.extensions.request.headers)

    console.log("Body",body);
    if(typeof body == "object"){
      body = JSON.stringify(body)
    }

    let params = {
      Bucket: readEnv("S3_BUCKET"),
      Key: Date.now().toString(),
      Body: body,
    };

    try {
      console.log(`Storing ... `,params )
      //return "Git"
      return await s3.upload(params).promise();
    } catch (e) {
      console.log(e);
      return e;
    }
  },
};

function readEnv(env = "") {
  return process.env[env] || undefined;
}
