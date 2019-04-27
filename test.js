const commandLineArgs = require('command-line-args');

// command line options
const optionDefinitions = [
  { name: 'profile', type: String },
  { name: 'region', type: String },
  { name: 'logBucket', type: String }
]
// get command line args:
const options = commandLineArgs(optionDefinitions);

console.log(options);
