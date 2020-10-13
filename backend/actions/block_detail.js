const Client = require('bitcoin-core');
const log4js = require("log4js");

const app = require('../app.js');
const environment = require('../environments/environment');
const config = require(environment.CONFIG);
const cl = new Client(config.tapyrusd);

function getBlock(blockHash, callback) {
  cl.getBlock(blockHash)
    .then((result) => callback(result))
    .catch((err) => {
      console.log(`Error retrieving information for block - ${blockHash}. Error Message - ${err.message}`);
      logger.error(`Error retrieving information for block  - ${blockHash}. Error Message - ${err.message}`);  
    });
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
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


app.get('/block/:blockHash', (req, res) => {
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);
  const urlBlockHash = req.params.blockHash;

  if (!regex.test(urlBlockHash)) {
    console.log(`Regex Test didn't pass for URL - /block/${urlBlockHash}`)
    logger.error(`Regex Test didn't pass for URL - /block/${urlBlockHash}`);

    res.status(400).send('Bad request');
    return;
  }
  try{
    getBlock(urlBlockHash, (blockInfo) => {
      const output = {
        blockHash: blockInfo.hash,
        ntx: blockInfo.nTx,
        height: blockInfo.height,
        timestamp: blockInfo.time,
        proof: blockInfo.proof,
        sizeBytes: blockInfo.size,
        version: blockInfo.features,
        merkleRoot: blockInfo.merkleroot,
        immutableMerkleRoot: blockInfo.immutablemerkleroot,
        previousBlock: blockInfo.previousblockhash,
        nextBlock: blockInfo.nextblockhash,
      };
      res.json(output);
    });
  } catch (err) {
    console.log(`Error retrieving information for block - ${urlBlockHash}. Error Message - ${err.message}`);
    logger.error(`Error retrieving information for block  - ${urlBlockHash}. Error Message - ${err.message}`);
  }

});



app.get('/block/:blockHash/rawData', (req, res) => {
  // bitcoin-cli getblock ${blockHash} 0
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);
  const urlBlockHash = req.params.blockHash;

  if (!regex.test(urlBlockHash)) {
    console.log(`Regex Test didn't pass for URL - /block/${urlBlockHash}/rawData`)
    logger.error(`Regex Test didn't pass for URL - /block/${urlBlockHash}/rawData`);

    res.status(400).send('Bad request');
    return;
  }

  cl.getBlock(urlBlockHash, 0)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(`Error retrieving raw data for block - ${urlBlockHash}. Error Message - ${err.message}`);
      logger.error(`Error retrieving raw data for block  - ${urlBlockHash}. Error Message - ${err.message}`);
    });
})



app.get('/block/:blockHash/txns', (req, res) => {
  // bitcoin-cli getblock ${blockHash} 2
  const regex = new RegExp(/^[0-9a-fA-F]{64}$/);
  const urlBlockHash = req.params.blockHash;

  if (!regex.test(urlBlockHash)) {
    console.log(`Regex Test didn't pass for URL - /block/${urlBlockHash}/txns`)
    logger.error(`Regex Test didn't pass for URL - /block/${urlBlockHash}/txns`);

    res.status(400).send('Bad request');
    return;
  }

  cl.getBlock(urlBlockHash, 2).then(async (result) => {
    var data = result;
    for(var tx of data.tx) {
      let res = [];
      for(var vin of tx.vin) {
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
            res.push(responses[0]);
          });
        } else {
          res.push({});
        }
      }
      tx.vinRaw = res;
    }
    res.json(data);
  })
  .catch((err) => {
    console.log(`Error retrieving txns for block - ${urlBlockHash}. Error Message - ${err.message}`);
    logger.error(`Error retrieving txns for block  - ${urlBlockHash}. Error Message - ${err.message}`);
  });
})

module.exports  = {cl}