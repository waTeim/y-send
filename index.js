"use strict";

const Promise = require('bluebird');
const path = require('path');
const moment = require('moment');
const decode = require('unescape');

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

const doSend = Promise.coroutine(function *(program)
{
  let psyHost = "localhost";
  let apiHost = program.api;
  let website = program.web;
  let encrypted = false;

  if(program.encrypted != null) encrypted = true;

  let options = { debug:false, info:false, encrypted:encrypted };

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

const doGetStatus = Promise.coroutine(function *(program)
{
  let psyHost = "localhost";
  let apiHost = program.api;
  let website = program.web;
  let options = { debug:false, info:false };

  if(program.debug != null) options.debug = true;
  if(program.info != null) options.info = true;

  const psyloc = require('psyloc')(psyHost,apiHost,website,options);

  if(program.args.length == 1)
  {
    try
    {
      let res = yield psyloc.getTransactionStatus(program.args[0]);

      console.log(JSON.stringify(res,null,2));
    }
    catch(e)
    {
      console.error(e);
    }
  }
});

const doGetHistory = Promise.coroutine(function *(program)
{
  let psyHost = "localhost";
  let apiHost = program.api;
  let website = program.web;
  let options = { debug:false, info:false };
  let elapsed = moment.duration(1,'day');

  if(program.elapsed.length != 0)
  {
     let value = parseInt(program.elapsed[0]);
     let unit = program.elapsed[1];

     elapsed = moment.duration(value,unit);
  }
  if(program.debug != null) options.debug = true;
  if(program.info != null) options.info = true;

  const psyloc = require('psyloc')(psyHost,apiHost,website,options);

  try
  {
    let fromDate = moment().subtract(elapsed).toDate();
    let res = yield psyloc.getTransactionHistory(fromDate);

    if(res != null && res.data != null)
    {
      for(let i = 0;i < res.data.length;i++)
        res.data[i].exportPath = decode(res.data[i].exportPath,'all');
    }   
    if(program.columns)
    {
      console.log(`Status\t\tCompl%\tLast Updated\t\tPath`);
      if(res != null && res.data != null)
      {
        for(let i = 0;i < res.data.length;i++)
        {
          let rec = res.data[i];

          console.log(`${rec.taskStatus}\t${rec.pctComplete}\t${rec.lastModDate}\t${rec.exportPath}`);
        }
      }   
    }
    else console.log(JSON.stringify(res,null,2));
  }
  catch(e)
  {
    console.error(e);
  }
});

module.exports =
{ 
  doGetHistory:doGetHistory,
  doGetStatus:doGetStatus,
  doSend:doSend
};
