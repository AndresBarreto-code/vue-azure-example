const cproc = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { BUCKET_NAME, DISTRIBUTION_ID } = process.env;

const bucket = BUCKET_NAME; //get bucket name from environment json
const distribution_id = DISTRIBUTION_ID; //get distribution id from environment json

const local_folder = './dist'; //set local forlder when the project will be built

const build_project = `yarn build`; //create command to build the project
const gzip_project = `gzip -9 -r ${local_folder}/js/*.js ${local_folder+'/css/*.css'}`; //gzip js and css files

const aws_assets = `aws s3 cp ${local_folder} s3://${bucket}/ --exclude 'index.html' --exclude '*.js' --exclude '*.css' --recursive --acl public-read`; //update assets excluding settings
const aws_js_css = `aws s3 cp ${local_folder} s3://${bucket}/ --exclude '*' --include '*.js' --include '*.css' --recursive --acl public-read --cache-control='public, max-age=31536000' --content-encoding='gzip'`; //update build folder
const aws_no_store = `aws s3 cp ${local_folder} s3://${bucket}/ --exclude '*' --include 'index.html' --recursive --acl public-read --cache-control='no-store'`; //update index.html and settings.js
const aws_cloudfront_create_invalidation = `aws cloudfront create-invalidation --distribution-id ${distribution_id} --paths "/*"`; //create invalidation

cproc.execSync(`${build_project}`, {stdio: 'inherit'}); //execute  commands
cproc.execSync(`${gzip_project}`, {stdio: 'inherit'}); //execute  commands

const build_path_js = path.resolve(__dirname, `.${local_folder}/js/`);
const files_js = fs.readdirSync(build_path_js);

for (const file of files_js) {
  if (file.endsWith('.gz')) {
    console.log("file", file);
    fs.renameSync(
      build_path_js + '/' + file,
      build_path_js + '/' + file.replace('.gz', '')
    )
  }
}

const build_path_css = path.resolve(__dirname, `.${local_folder}/css/`);
const files_css = fs.readdirSync(build_path_css);

for (const file of files_css) {
  if (file.endsWith('.gz')) {
    console.log("file", file);
    fs.renameSync(
      build_path_css + '/' + file,
      build_path_css + '/' + file.replace('.gz', '')
    )
  }
}

cproc.execSync(`${aws_assets} &&
                ${aws_js_css} &&
                ${aws_no_store} &&
                ${aws_cloudfront_create_invalidation}`,
                {stdio: 'inherit'}); //execute  commands


