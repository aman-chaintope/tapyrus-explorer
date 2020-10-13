const Client = require('bitcoin-core');
const app = require('../app.js');
const log4js = require("log4js");
const environment = require('../environments/environment');
const config = require(environment.CONFIG);
const cl = new Client(config.tapyrusd);

log4js.configure({
  appenders: {
    everything: { type: 'file', filename: 'logs.log' }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'error' }
  }
});

var logger = log4js.getLogger();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/transaction/:txid', (req, res) => {
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);
  const urlTxid = req.params.txid;

  if (!regex.test(urlTxid)) {
    console.log(`Regex Test didn't pass for URL - /transaction/${urlTxid}`)
    logger.error(`Regex Test didn't pass for URL - /transaction/${urlTxid}`);

    res.status(400).send('Bad request');
    return;
  }

  cl.command([
    { 
      method: 'getrawtransaction', 
      parameters: {
        txid: urlTxid,
        verbose: true
      }
    }
  ]).then(async (responses) => {
    let results = [];
    let response = responses[0]
    for(var vin of response.vin) {
      if(vin.txid) {
        await cl.command([
          { 
            method: 'getrawtransaction', 
            parameters: {
              txid: vin.txid,
              verbose: true
            }
          }
        ]).then((responses) => {
          results.push(responses[0]);
        });
      } else {
        results.push({});
      }
    }
    response.vinRaw = results;
    res.json(response);
  })
  .catch((err) => {
    console.log(`Error retrieving information for transaction - ${urlTxid}. Error Message - ${err.message}`);
    logger.error(`Error retrieving information for transaction - ${urlTxid}. Error Message - ${err.message}`);  
  });
});
  
app.get('/transaction/:txid/rawData', (req, res) => {
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);
  const urlTxid = req.params.txid;

  if (!regex.test(urlTxid)) {
    console.log(`Regex Test didn't pass for URL - /transaction/${urlTxid}/rawData`)
    logger.error(`Regex Test didn't pass for URL - /transaction/${urlTxid}/rawData`);

    res.status(400).send('Bad request');
    return;
  }

  cl.command([
    { 
      method: 'getrawtransaction', 
      parameters: {
        txid: urlTxid,
      }
    }
  ]).then((responses) => {
    if(responses[0].name === "RpcError"){
      console.log(`Error retrieving rawdata for transaction - ${urlTxid}. Error Message - ${responses[0].message}`);
      logger.error(`Error retrieving rawdata for transaction - ${urlTxid}. Error Message - ${responses[0].message}`);    
    }
    res.json(responses[0]);
  })
  .catch((err) => {
    console.log(`Error retrieving rawdata for transaction - ${urlTxid}. Error Message - ${err.message}`);
    logger.error(`Error retrieving rawdata for transaction - ${urlTxid}. Error Message - ${err.message}`);  
  });
});

app.get('/transaction/:txid/get', (req, res) => {

  const urlTxid = req.params.txid;
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);

  if (!regex.test(urlTxid)) {
    console.log(`Regex Test didn't pass for URL - /transaction/${urlTxid}/get`)
    logger.error(`Regex Test didn't pass for URL - /transaction/${urlTxid}/get`);

    res.status(400).send('Bad request');
    return;
  }
  cl.command([
    {
      method: 'gettransaction', 
      parameters: {
        txid: urlTxid,
        include_watchonly: true
      }
    }
  ]).then((responses) => {
    if(responses[0].name === "RpcError"){
      console.log(`Error calling the method gettransaction for transaction - ${urlTxid}. Error Message - ${responses[0].message}`);
      logger.error(`Error calling the method gettransaction for transaction - ${urlTxid}. Error Message - ${responses[0].message}`);    
    }
    res.json(responses[0]);
  })
  .catch((err) => {
    console.log(`Error calling the method gettransaction for transaction - ${urlTxid}. Error Message - ${err.message}`);
    logger.error(`Error calling the method gettransaction for transaction - ${urlTxid}. Error Message - ${err.message}`);  
  });
})