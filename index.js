"use strict";

const Promise = require('bluebird');
const path = require('path');

let program = require('commander');

function collect(val,addr)
{
  addr.push(val);
  return addr;
}

program
  .usage('[options] <groupName> <title> <path>')
  .option('-l, --all','send to all recipients in a group')
  .option('-r, --recipient [recipient]','send to a recipient',collect,[])
  .option('-c, --channel <channel>', 'channel []')
  .option('-a, --api <api-host>','the api host',"api.esecuresend.com")
  .option('-w, --web <website>','website',"www.esecuresend.com")
  .option('-e, --encrypted','send encrypted')
  .parse(process.argv);

const doSend = Promise.coroutine(function *()
{
  let psyHost = "localhost";
  let apiHost = program.api;
  let website = program.web;
  let encrypted = false;

  if(program.encrypted) encrypted = true;

  const psyloc = require('psyloc')(psyHost,apiHost,website);

  if(program.args.length == 3)
  {
    try
    {
      let src = path.resolve(program.args[2]);
  
      if(program.channel != null)
      {
        let res = yield psyloc.sendViaChannel(program.args[0],program.channel,program.args[1],encrypted,src);
  
        if(res && res.success) console.log("sending...");
      }
      else if(program.all)
      {
        let res = yield psyloc.sendToAllReceivers(program.args[0],program.args[1],encrypted,src);
  
        if(res && res.success) console.log("sending...");
      }
      else if(program.recipient.length != 0)
      {
        let res = yield psyloc.sendToRlist(program.args[0],program.recipient,program.args[1],encrypted,src);
  
        if(res && res.success) console.log("sending...");
      }
      else console.error("no recipients specified");
    }
    catch(e)
    {
      console.error("send failed:",e);
    }
  }
});

doSend();
