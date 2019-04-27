# s3-housekeeping-scripts

* enable-versioning.js: enables versioning on all s3 buckets in your account
* logging.js: enables s3 logging to a bucket named logBucketPrefix-region (specify --logBucketPrefix on command line)
* restore.js: restores items from glacier to s3, in bucket (--bucket bucketname) with optional key prefix (--prefix prefix), restore tier (--tier) defaults to "Bulk" and for days (--days) defaults to 3. 
