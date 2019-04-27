const commandLineArgs = require('command-line-args');

// command line options
const optionDefinitions = [
  { name: 'profile', type: String },
  { name: 'logBucketPrefix', type: String } // note, will append -region to it
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


run = async () => {
  let data = await s3.listBuckets().promise();
  data.Buckets.map(async (item) => {
    try {
      let params = {
        Bucket: item.Name
      }
      let res = await s3.getBucketLocation(params).promise();
      let region = res.LocationConstraint === '' ? 'us-east-1' : res.LocationConstraint;
      params = {
        Bucket: item.Name,
        BucketLoggingStatus: {
          LoggingEnabled: {
            TargetBucket: options.logBucketPrefix+region,
            TargetPrefix: item.Name + '/'
          }
        }
      }
      let results = await s3.putBucketLogging(params).promise();
      console.log(results);
    } catch (error) {
      console.log(error);
    }
  });
}

run()

