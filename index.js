"use strict";

const Promise = require('bluebird');

let program = require('commander');

program
  .usage('[options] <groupName> <title> <path>')
  .option('-a, --all','send to all recipients')
  .option('-c, --channel <channel>', 'channel []')
  .option('-d, --dev','send via dev')
  .option('-e, --encrypted','send encrypted')
  .parse(process.argv);

const doSend = Promise.coroutine(function *()
{
  let psyHost = "localhost";
  let apiHost = "api.esecuresend.com";
  let website = "www.esecuresend.com";
  let encrypted = false;

  if(program.dev)
  { 
     apiHost = "api-dev.esecuresend.com";
     website = "dev.esecuresend.com";
  }

  if(program.encrypted) encrypted = true;

  const psyloc = require('psyloc')(psyHost,apiHost,website);

  if(program.args.length == 3)
  {
    let path = program.args[2];

    if(path.substr(0,1) != '/') path = __dirname + "/" + path;

    if(program.channel != null)
    {
      let res = yield psyloc.sendViaChannel(program.args[0],program.channel,program.args[1],encrypted,path);

      console.log("res",JSON.stringify(res,null,2));
    }
    else if(program.all)
    {
      let res = yield psyloc.sendToAllReceivers(program.args[0],program.args[1],encrypted,path);

      console.log("res",JSON.stringify(res,null,2));
    }
    else console.error("neither --channel nor --all specified");
  }
});

doSend();
