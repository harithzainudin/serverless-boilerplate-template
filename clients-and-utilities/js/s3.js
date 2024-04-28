const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({ region: process.env.AWS_REGION });

async function getSignedUrl() {
  const command = new GetObjectCommand({ Bucket: "", Key: "" });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
}
