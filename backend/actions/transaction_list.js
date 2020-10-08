const app = require('../app.js');
const Client = require('bitcoin-core');
const log4js = require("log4js");
const flatCache = require('flat-cache')

const environment = require('../environments/environment');
const config = require(environment.CONFIG);

const cl = new Client(config);

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

async function getTxCount() {
  const result = await cl.getChainTxStats();
  return result.txcount;
}

async function getBlockWithTx(blockNum) {
  const blockHash = await cl.getBlockHash(blockNum);
  const result = await cl.getBlock(blockHash);
  return result;
}

async function getMemTx() {
  const result = await cl.getRawMempool();
  const list = result.map( (tx) => {
    const response = cl.command([
      {
        method: 'getrawtransaction', 
        parameters: {
          txid: tx,
          verbose : true
        }
      }
    ])
    return response;
  }); 

  const promiseArray = await Promise.all(list);
  const memTxArray = promiseArray.map((list) => list[0]);

  const memEntryArray = memTxArray.map( (trans) => {
    const response = cl.command([
      {
        method: 'getmempoolentry', 
        parameters: {
          txid: trans.txid,
        }
      }
    ])
    return response;
  })

  const entryPromiseArray = await Promise.all(memEntryArray)
  const finalArray = memTxArray.map( (trans, idx) => {
    trans.time = entryPromiseArray[idx][0].time;
    return trans;
  })

  return finalArray.sort((a,b) => b.time - a.time);
}


const createCache = function(){
  

  return new Promise( (resolve, reject) => {

  try{
     
      const cache = flatCache.load('cacheId');

      getBlockchainInfo().then( async (bestBlockHeight) => {

        let count = 0;
        let cacheBestBlockHeight = cache.getKey(`bestBlockHeight`);


        if(!cacheBestBlockHeight)
          cacheBestBlockHeight = 0;

        else if( cacheBestBlockHeight == bestBlockHeight){
            console.log("Transaction Cache is up-to-date");
            cacheBestBlockHeight++;
              return resolve();
          }
        else{
            cacheBestBlockHeight++;
            count = cache.getKey(`transactionCount`);
        }

        while((cacheBestBlockHeight <=  bestBlockHeight)){
          const block = await getBlockWithTx(cacheBestBlockHeight);
          
          for(let i =0; i<block.nTx; i++)
            await cache.setKey(`${count++}`, block.tx[i]);

          cacheBestBlockHeight++;
        }

        await cache.setKey('bestBlockHeight', bestBlockHeight);
        await cache.setKey('transactionCount', count);

        console.log("Updated cache till block height -> ", bestBlockHeight)
        console.log("New transaction count -> ", count)


        await cache.save(true /* noPrune */);
        return resolve();
        
        });
  } catch (err) {
    return reject(err);
  }
 });
}



const createCoinCache = function(){
  

  return new Promise( (resolve, reject) => {

  try{
     
      const cache = flatCache.load('coin');

      getBlockchainInfo().then( async (bestBlockHeight) => {

        let count = 0;
        let cacheBestBlockHeight = cache.getKey(`bestBlockHeight`);


        if(!cacheBestBlockHeight)
          cacheBestBlockHeight = 0;

        else if( cacheBestBlockHeight == bestBlockHeight){
            console.log("Transaction Cache is up-to-date");
            cacheBestBlockHeight++;
              return resolve();
          }
        else{
            cacheBestBlockHeight++;
            count = cache.getKey(`transactionCount`);
        }

        while((cacheBestBlockHeight <=  bestBlockHeight)){
          const block = await getBlockWithTx(cacheBestBlockHeight);
          
          for(let i =0; i<block.nTx; i++){
            const response = await cl.command([
              { 
                method: 'getrawtransaction', 
                parameters: {
                  txid: block.tx[i],
                  verbose: true
                }
              }
            ]);
            const trans = response[0];
            console.log(trans.vout[0].scriptPubKey.asm, trans.vout[0].scriptPubKey.asm.split(" ").indexOf("OP_DUP"))
            
            if(trans.vout[0].scriptPubKey.asm.split(" ").indexOf("OP_DUP") != -1)
              await cache.setKey(`${count++}`, block.tx[i]);
          }

          cacheBestBlockHeight++;
        }

        await cache.setKey('bestBlockHeight', bestBlockHeight);
        await cache.setKey('transactionCount', count);

        console.log("Updated cache till block height -> ", bestBlockHeight)
        console.log("New transaction count -> ", count)


        await cache.save(true /* noPrune */);
        return resolve();
        
        });
  } catch (err) {
    return reject(err);
  }
 });
}

app.get('/transactions', (req, res) => {
  //Return a List of transactions

  //try {

    var perPage = Number(req.query.perPage);
    var page = Number(req.query.page);
    
    getTxCount().then( (txCount) => {

      getBlockchainInfo().then( async (bestBlockHeight) => {

        //let cacheBestBlockHeight = cache.getKey(`bestBlockHeight`);
        createCoinCache();

        createCache().then( async () => {

          const cache = flatCache.load('cacheId');
          
          let count = 0, transList= [];
          const memTxList = await getMemTx();
          if(( memTxList.length) > (perPage*(page-1))){
  
            let j = (perPage*(page-1));
            while(j < memTxList.length){ 
              let amount = 0;
              memTxList[j].vout.forEach( (vout) => {amount += vout.value})
              memTxList[j].amount = amount;
              memTxList[j].confirmations = 0;
              transList.push(memTxList[j]);
              j++;
              count++;
              if(count == perPage){
                break;
              }
            }
          }
                    
          if(cache.getKey(`bestBlockHeight`) === bestBlockHeight){
            const transactionCount = await getTxCount();
            var startingTrans =  transactionCount - perPage*page;
                        
            if(startingTrans <= 0) {
              //if last page's remainder should use different value of startingTrans and perPage
              startingTrans = 0;
              perPage = transactionCount%perPage;
            }
      
            for(let i=startingTrans; i< startingTrans + perPage; i++){
              let amount = 0;
              const response = await cl.command([
                { 
                  method: 'getrawtransaction', 
                  parameters: {
                    txid: cache.getKey(i),
                    verbose: true
                  }
                }
              ]);
              //overheadTxCount = (perPage*(page-1));
              const trans = response[0];
              trans.vout.forEach( (vout) => {amount += vout.value})
              trans.amount = amount;
              transList.push(trans);
              count++;
              if(count == perPage){
                break;
              }
            }
            
            res.json({
              results: transList.reverse(),
              txCount
            });
            //console.log("list", transList[22].vin, transList[22].vout[0].scriptPubKey.asm.split(" ").indexOf("OP_DUP"))
            return;
          } 
          else {
            throw "Cache's best Block Height is not updated"
          }
        });

        /*
        while((bestBlockHeight >= 0) && (count < perPage)){ 
          const block = await getBlockWithTx(bestBlockHeight);
        
          if((overheadTxCount + block.nTx) <= (perPage*(page-1))){
              overheadTxCount += block.nTx;
            }
          else {
            let i;
            if(overheadTxCount == (perPage*(page-1))){
              i=0;
            }
            else
              i = (overheadTxCount + block.nTx) - (perPage*(page-1));
            while(i < block.nTx){
              let amount = 0;
              const response = await cl.command([
                { 
                  method: 'getrawtransaction', 
                  parameters: {
                    txid: block.tx[i],
                    verbose: true
                  }
                }
              ]);
              overheadTxCount = (perPage*(page-1));
              const trans = response[0];
              trans.vout.forEach( (vout) => {amount += vout.value})
              trans.amount = amount;
              transList.push(trans);
              count++;
              if(count == perPage){
                break;
              }
              i++;
            }
          }
          bestBlockHeight--;
        }
        res.json({
          results: transList,
          txCount
        });*/
      });
    })
    .catch( err => {
      console.log(`Error retrieving ${perPage} transactions for page#${page}. Error Message - ${err.message}`);
      logger.error(`Error retrieving ${perPage} transactions for page#${page}. Error Message - ${err.message}`);  
      res.status(500).send(`Error Retrieving Blocks`);  
    })
  /*} catch (err) {
    console.log(`Error retrieving ${perPage} transactions for page#${page}. Error Message - ${err.message}`);
    logger.error(`Error retrieving ${perPage} transactions for page#${page}. Error Message - ${err.message}`);  
    res.status(500).send(`Error Retrieving Blocks`);
  } */
});

module.exports = cl;