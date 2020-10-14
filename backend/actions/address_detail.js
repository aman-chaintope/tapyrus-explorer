const Client = require('bitcoin-core');
const jayson = require('jayson/promise');
const log4js = require("log4js");
var flatCache = require('flat-cache');

const app = require('../app.js');
const environment = require('../environments/environment');
const config = require(environment.CONFIG);

const cl = new Client(config);
const elect = jayson.client.tcp({
  port: 50001
});

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

async function getBlockchainInfo() {
  const result = await cl.getBlockchainInfo();
  return result.headers;
}

async function getBlockWithTx(blockNum) {
  const blockHash = await cl.getBlockHash(blockNum);
  const result = await cl.getBlock(blockHash);
  return result;
}

const createCache = function(){
  

  return new Promise( (resolve, reject) => {

  try{
     
      const cache = flatCache.load('transCache');

      getBlockchainInfo().then( async (bestBlockHeight) => {

        let count = 0;
        let cacheBestBlockHeight = cache.getKey(`bestBlockHeight`);
        //bestBlockHeight = bestBlockHeight - 40000;


        if(!cacheBestBlockHeight)
          cacheBestBlockHeight = 0;

        else if( cacheBestBlockHeight == bestBlockHeight){
            return resolve();
          }
        else{
            cacheBestBlockHeight++;
            count = cache.getKey(`transactionCount`);
        }
        while((cacheBestBlockHeight <=  bestBlockHeight)){
          const block = await getBlockWithTx(cacheBestBlockHeight);
          
          for(let i =0; i<block.nTx; i++){
            cache.setKey(`${count++}`, block.tx[i]);

            await cl.command([
              { 
                method: 'getrawtransaction', 
                parameters: {
                  txid: block.tx[i],
                  verbose: true
                }
              }
            ]).then(async (responses) => { 

              let inputAddress = [];
              let outputAddress = [];

              for(var vin of responses[0].vin) {
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
                    for(let vout of responses[0].vout){
                      for(let address of vout.scriptPubKey.addresses){

                        if(outputAddress.indexOf(address) === -1 ){
                          inputAddress.push(address);

                          let addressTxCount = cache.getKey(`${address}_count`);
                        
                          if((!addressTxCount) && (addressTxCount !== 0))
                            addressTxCount = -1;
                        
                          addressTxCount++;
                          cache.setKey(`${address}_${addressTxCount}`, block.tx[i]);
                          cache.setKey(`${address}_count`, addressTxCount);
                          cache.save(true /* noPrune */);
                        }
                      }
                    }
                  });
                }
              }

              for(let vout of responses[0]["vout"]){
                if(vout.scriptPubKey.addresses){
                  for(let address of vout.scriptPubKey.addresses){
                    if(inputAddress.indexOf(address) === -1){
                      outputAddress.push(address);
                    
                      let addressTxCount = cache.getKey(`${address}_count`);
                    
                      if((!addressTxCount) && (addressTxCount !== 0))
                        addressTxCount = -1;
                    
                      addressTxCount++;
                      cache.setKey(`${address}_${addressTxCount}`, block.tx[i]);
                      cache.setKey(`${address}_count`, addressTxCount);
                      cache.save(true /* noPrune */);
                    }  
                  }
                }
              }
            });
        }

          cacheBestBlockHeight++;
        }

        cache.setKey('bestBlockHeight', bestBlockHeight);
        cache.setKey('transactionCount', count);

        console.log("Updated cache till block height -> ", bestBlockHeight)
        console.log("New transaction count -> ", count)


        cache.save(true /* noPrune */);
        return resolve();
        
        });
  } catch (err) {
    return reject(err);
  }
 });
}

app.get('/address/:address', (req, res) => {
  var perPage = Number(req.query.perPage);
  var page = Number(req.query.page);
  
  //const regex = new RegExp(/^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/);
  const regex = new RegExp(/^[0-9a-zA-Z]{26,35}$/);
  const urlAddress = req.params.address;
  
  if (!regex.test(urlAddress)) {
    console.log(`Regex Test didn't pass for URL - /address/${urlAddress}`);
    logger.error(`Regex Test didn't pass for URL - /address/${urlAddress}`);

    res.status(400).send('Bad request');
    return;
  }

  getBlockchainInfo().then( async (bestBlockHeight) => {

    createCache().then( async () => {

      const cache = flatCache.load('transCache');
      // bitcoin-cli listreceivedbyaddress 0 true true  bcrt1q83ttww2z7d20gwsze4eq9py5s45j48y7smvtdc
      cl.command([
        {
          method: 'getreceivedbyaddress', 
          parameters: {
            address: urlAddress
          }
        },
        { 
          method: 'getAddressInfo', 
          parameters: {
            address: urlAddress
          }
        },
        { 
          method: 'listunspent', 
          parameters: {
            addresses: [urlAddress]
          }
        }
      ]).then(async (responses) => {
      
      if(cache.getKey(`bestBlockHeight`) === bestBlockHeight){

        let transactions = [];
        const addressTransCount = cache.getKey(`${urlAddress}_count`);

        var startFromTrans = addressTransCount - perPage*(page) + 1;
      
        if(startFromTrans < 0) {
          //if last page's remainder should use different value of startFromBlock and perPage
          startFromTrans = 0;
          perPage = (addressTransCount+1)%perPage;
        }
      
        for(let i=startFromTrans; i< startFromTrans + perPage; i++){
          const transId =  cache.getKey(`${urlAddress}_${i}`);
          cl.command([
            {
              method: 'getrawtransaction', 
              parameters: {
                txid: transId,
                verbose: true
              }
            }
          ]).then((transResponse) => {

            cl.command([
              {
                method: 'getBlock', 
                parameters: {
                  blockhash: transResponse[0].blockhash,
                }
              }
            ]).then((blockResponse) => {
              transResponse[0]["blockheight"] = blockResponse[0].height;
              transactions.push(transResponse[0]);
              if((transactions.length == perPage)){
              
                transactions = transactions.sort( (transaction1, transaction2) => transaction2.time - transaction1.time);
                responses[3] = addressTransCount;
                responses[1] = transactions;
                res.json(responses);
                }
              });
            });
          }
        }  
      })
      .catch((err) => {
        console.log(`Error retrieving information for addresss - ${urlAddress}. Error Message - ${err.message}`);
        logger.error(`Error retrieving information for addresss - ${urlAddress}. Error Message - ${err.message}`);
      });
    });
  });
})

module.exports = {cl, elect};