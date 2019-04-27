const commandLineArgs = require('command-line-args');

// command line options
const optionDefinitions = [
  { name: 'profile', type: String }
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

run = async() => {
  let data = await s3.listBuckets().promise();
  data.Buckets.map(async (item) => {
    try {
      let params = { 
        Bucket: item.Name,
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      };
      let results = await s3.putBucketVersioning(params).promise();
      console.log(results);
      params = {
        Bucket: item.Name,
        LifecycleConfiguration:
        {
          Rules: [
            { 
              "Expiration": { "ExpiredObjectDeleteMarker": true },
              "ID": "NoncurrentVersionExpiration", 
              "Filter": { "Prefix": "" }, 
              "Status": "Enabled", 
              "Transitions": [], 
              "NoncurrentVersionTransitions": [], 
              "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }, 
              "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 } 
            }
          ]
        }
      };
      results = await s3.putBucketLifecycleConfiguration(params).promise();
      console.log(JSON.stringify(results));
    } catch (error) {
      console.log(error);
    }
  });
}

run()

