const commandLineArgs = require('command-line-args');

// command line options
const optionDefinitions = [
  { name: 'profile', type: String },
  { name: 'bucket', type: String },
  { name: 'prefix', type: String },
  { name: 'tier', type: String },
  { name: 'days', type: Number }
]
// get command line args:
const options = commandLineArgs(optionDefinitions);

if (options.profile) {
  process.env.AWS_PROFILE = options.profile; // pick up default region for that profile from config file this way
}

const AWS = require('aws-sdk');

if (options.profile) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: options.profile });
}

const s3 = new AWS.S3();

let bucketParams = {
  Bucket: options.bucket,
}

async function run() {
  let continuing = true;
  while (continuing) {
    try {
      let data = await s3.listObjectsV2(bucketParams).promise();
      continuing = data.IsTruncated;
      bucketParams.ContinuationToken = data.NextContinuationToken;
      data.Contents.forEach(async (item) => {
        if (!options.prefix || item.Key.startsWith(options.prefix)) {
          let objectParams = {
            Bucket: options.bucket,
            Key: item.Key,
            RestoreRequest: {
              Days: options.days || 3,
              GlacierJobParameters: {
                Tier: options.tier || "Bulk"
              }
            }
          };
          s3.headObject({Bucket: options.bucket, Key: item.Key}, function(err, head) {
            if (err) {
              console.log(err);
            } else if (head.Restore.includes('false')) {
              s3.restoreObject(objectParams, function (restoreErr, resultData) {
                if (restoreErr) console.log(restoreErr); // an error occurred
                else console.log('restoring: ' + item.Key);           // successful response
              }); 
            } else {
              console.log('in-progress: ' + item.Key);
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

run()