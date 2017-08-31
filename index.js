"use strict";

const Promise = require('bluebird');

let program = require('commander');

program
  .usage('[options] <groupName> <channelName> <path>')
  .option('-d, --dev','send via dev')
  .parse(process.argv);

const doSend = Promise.coroutine(function *()
{
  let psyHost = "localhost";
  let apiHost = "api.esecuresend.com";
  let website = "www.esecuresend.com";

  if(program.dev)
  { 
     apiHost = "api-dev.esecuresend.com";
     website = "dev.esecuresend.com";
  }

  const psyloc = require('psyloc')(psyHost,apiHost,website);

  if(program.args.length >= 3) {
    let path = program.args[2];

    if(path.substr(0,1) != '/') path = __dirname + "/" + path;

    let res = yield psyloc.sendViaChannel(program.args[0],program.args[1],path);

    console.log("res",JSON.stringify(res,null,2));
  }
});

doSend();
