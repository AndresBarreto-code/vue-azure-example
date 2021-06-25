const cproc = require('child_process');
const environment = process.env.env || 'develop'; //use to get environment value, ex.: env=qa ...
process.stdout.write(`using environment '${environment}'\n`); //print environment

const environment_json = require(`./awsenvironments.json`)[environment]; //get json file from environment folder

const bucket = environment_json.aws_s3; //get bucket name from environment json
const distribution_id = environment_json.distribution_id; //get distribution id from environment json

process.stdout.write(`backup bucket ${bucket}`); //print bucket

const aws_backup = `aws s3 cp s3://${bucket}/backup/ s3://${bucket}/ --recursive --acl public-read`;
const aws_cloudfront_create_invalidation = `aws cloudfront create-invalidation --distribution-id ${distribution_id} --paths "/*"`;

let subprocessaws = cproc.exec(`${aws_backup} &&
                                ${aws_cloudfront_create_invalidation}`); //execute  commands

subprocessaws.stdout.on('data', (data) => console.log('data', data)); //logs on succes
subprocessaws.stderr.on('error', (error) => console.error('error', error)); //logs on error
