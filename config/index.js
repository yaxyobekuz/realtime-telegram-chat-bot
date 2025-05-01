require("dotenv").config();

const {
  port,
  botToken,
  mongodbUrl,
  objectDBEndpoint,
  objectDBBucketName,
  objectDBAccessKeyId,
  objectDBSecretAccessKey,
  objectDBS3ForcePathStyle,
} = process.env;

const objectDBConfig = {
  region: "auto",
  bucketName: objectDBBucketName,
  credentials: {
    accessKeyId: objectDBAccessKeyId,
    secretAccessKey: objectDBSecretAccessKey,
  },
  endpoint: objectDBEndpoint,
  forcePathStyle: objectDBS3ForcePathStyle === "true",
};

module.exports = { botToken, mongodbUrl, objectDBConfig, port: port || 3000 };
