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
  .option('-d, --debug','generate additional logging info')
  .option('-i, --info','show transaction info')
  .parse(process.argv);


function resMessage(res,options)
{
  if(res && res.success)
  {
    let encrypted = options.encrypted;

    if(!options.info) console.log(`sending ${encrypted?"(encryption forced) ":""}...`);
    else
    {
      console.log(JSON.stringify({
        success:res.success,
        transactionId:res.params.externalTransactionID,
        token:res.params.token,
        encrypted:encrypted
      },null,2));
    }
  }
}

const doSend = Promise.coroutine(function *()
{
  let psyHost = "localhost";
  let apiHost = program.api;
  let website = program.web;
  let encrypted = false;
  let options = { debug:false, info:false, encrypted:encrypted };

  if(program.encrypted != null) encrypted = true;
  if(program.debug != null) options.debug = true;
  if(program.info != null) options.info = true;

  const psyloc = require('psyloc')(psyHost,apiHost,website,options);

  if(program.args.length == 3)
  {
    try
    {
      let src = path.resolve(program.args[2]);

      if(program.channel != null)
      {
        let res = yield psyloc.sendViaChannel(program.args[0],program.channel,program.args[1],encrypted,src);

        resMessage(res,options);
      }
      else if(program.all)
      {
        let res = yield psyloc.sendToAllReceivers(program.args[0],program.args[1],encrypted,src);

        resMessage(res,options);

      }
      else if(program.recipient.length != 0)
      {
        let res = yield psyloc.sendToRlist(program.args[0],program.recipient,program.args[1],encrypted,src);

        resMessage(res,options);
      }
      else console.error("no recipients specified");
    }
    catch(e)
    {
      console.error("send failed:",e);
    }
  }
});

module.exports = { doSend:doSend };
