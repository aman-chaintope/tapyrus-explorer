const supertest = require("supertest");
const assert = require('assert');
const app = require("../server");
const {cl} = require("../actions/block_detail");
const block_list = require("../actions/block_list");
const sinon = require('sinon');


describe("GET /address return type check", function() {
  it("/address", function(done) {
    supertest(app)
      .get("/address/1EH5UTrkqwzy56tG8kSctVeTDHLkhjg7g")
      .query({ perPage: '25', page: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        console.log(res.text)
        done();
      });
  });
});


describe("GET /blocks return type check", function() {
  it("/blocks", function(done) {
    supertest(app)
      .get("/blocks")
      .query({ perPage: '25', page: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const blocks = (JSON.parse(res.text)).results;
        assert.equal( blocks.length,  25);

        assert.ok( blocks[0].hash);
        assert.ok( blocks[0].confirmations);
        assert.ok( blocks[0].height);
        assert.ok( blocks[0].size);
        assert.ok( blocks[0].merkleroot);
        assert.ok( blocks[0].immutablemerkleroot);
        assert.ok( blocks[0].previousblockhash);
        assert.ok( blocks[0].weight);
        assert.ok( blocks[0].features);
        assert.ok( blocks[0].featuresHex);
        assert.ok( blocks[0].time);
        assert.ok( blocks[0].mediantime);
        assert.ok( !blocks[0].xfieldType);
        assert.ok( blocks[0].proof);

        done();
      });
  });
});


describe("GET /blocks and then call individual block using /block/:blockHash", function() {
  beforeEach(() => {
    
    block_list.elect.request = sinon.stub()
      .resolves({
        result: "0100000075adc0f804073eee1c74988e1e1bd83c85f987e34a95fd714813e379a724e85f97d679310470c26fdfaed7167075c7a8a1fa34d9c67be9c45c246281c15ffb231d0ef017e1b2147099d84709bcc0fbe89ef4d579fa8a95192ce89671765ec90459d4455f0040e7f72ce96424573b0d18f707333d02a2bc546491ba197c3af7b52d559eb55765d00a1e99d6ef4175ec4aae134c6b496a87c78d3a41ed77c7c2fd4ba684cd4abd",
      }); 
  });

  it("/blocks", function(done) {
    supertest(app)
      .get("/blocks")
      .query({ perPage: '25', page: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        else {
          assert.equal((JSON.parse(res.text)).results.length,  25);

          //console.log("hey",(JSON.parse(res.text)).results)

          supertest(app)
          .get(`/block/${(JSON.parse(res.text)).results[0].hash}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) done(err);
            
            const body = res.body;
            assert.strictEqual(body.blockHash, "b9deaab16abe5f28967aebd0c6e94ce18c8309dec39816ea883885265b681f7c")
            assert.strictEqual(body.ntx, 1);
            assert.strictEqual(body.height, 27018);
            assert.strictEqual(body.timestamp, 1598411865);
            assert.strictEqual(body.proof, "e7f72ce96424573b0d18f707333d02a2bc546491ba197c3af7b52d559eb55765d00a1e99d6ef4175ec4aae134c6b496a87c78d3a41ed77c7c2fd4ba684cd4abd");
            assert.strictEqual(body.sizeBytes, 261);
            assert.strictEqual(body.version, 1);
            assert.strictEqual(body.merkleRoot, "23fb5fc18162245cc4e97bc6d934faa1a8c7757016d7aedf6fc270043179d697");
            assert.strictEqual(body.immutableMerkleRoot, "04c95e767196e82c19958afa79d5f49ee8fbc0bc0947d8997014b2e117f00e1d");
            assert.strictEqual(body.previousBlock, "5fe824a779e3134871fd954ae387f9853cd81b1e8e98741cee3e0704f8c0ad75");
            assert.strictEqual(body.nextBlock, "6521d05740a995a351c474db228b5c399bd89aaed23c115ee597bfd0b749b89d");
            done();
          });  
        }
      });
  });
});


describe("GET /block/:blockHash return type check", function() {
  it("/blocks", function(done) {
    supertest(app)
      .get("/block/b9deaab16abe5f28967aebd0c6e94ce18c8309dec39816ea883885265b681f7c")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const block = JSON.parse(res.text);
        
        assert.ok( block.blockHash);
        assert.ok( block.ntx);
        assert.ok( block.height);
        assert.ok( block.sizeBytes);
        assert.ok( block.merkleRoot);
        assert.ok( block.immutableMerkleRoot);
        assert.ok( block.previousBlock);
        assert.ok( block.nextBlock);
        assert.ok( block.version);
        assert.ok( block.timestamp);
        assert.ok( block.proof);

        done();
      });
  });
});

describe("GET /block/:blockHash with sinon.stub", function() {
  beforeEach(() => {
    sinon.stub(cl, "getBlock")
      .withArgs("5c6fd3ae9a05a6db255525bd6b1e5e4cb9cfbda876ee39cc809129a9ade420e6")
      .resolves({
        hash: "5c6fd3ae9a05a6db255525bd6b1e5e4cb9cfbda876ee39cc809129a9ade420e6",
        confirmations: 1,
        strippedsize: 261,
        size: 261,
        weight: 1044,
        height: 1236,
        features: 1,
        featuresHex: "00000001",
        merkleroot: "39b95731fbae308d85743e2682988038980d7463ea2fc1b21f91860b243892e9",
        immutablemerkleroot: "d837966bc672b6459385989fdbfc049773f03fd355bb62c9765cdfa51e7a19a4",
        tx: ["d837966bc672b6459385989fdbfc049773f03fd355bb62c9765cdfa51e7a19a4"],
        time: 1598253741,
        mediantime: 1598111705,
        xfieldType: 0,
        proof: "9fd45dcb188a5547a34fe2d181c24fd8f0f68b88d6c8951ec4db921a133dd846fb77d030bdacb1e421c49e23483937ce2c5eb3693baae040ddda8316ea3b6127",
        nTx: 1,
        previousblockhash: "471b4c1fcb6105c9812edde93c6dd760330daa8b3897a9484a24c3ce23683805",
        nextblockhash: "e17286ef05705b03f2396f28f06b9afafa4502157285ad1d1ebc08537d27de57"
      });
  });

  it("/block/:blockHash", function(done) {
    supertest(app)
      .get("/block/5c6fd3ae9a05a6db255525bd6b1e5e4cb9cfbda876ee39cc809129a9ade420e6")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);

        const body = res.body;
        assert.strictEqual(body.blockHash, "5c6fd3ae9a05a6db255525bd6b1e5e4cb9cfbda876ee39cc809129a9ade420e6")
        assert.strictEqual(body.ntx, 1);
        assert.strictEqual(body.height, 1236);
        assert.strictEqual(body.timestamp, 1598253741);
        assert.strictEqual(body.proof, "9fd45dcb188a5547a34fe2d181c24fd8f0f68b88d6c8951ec4db921a133dd846fb77d030bdacb1e421c49e23483937ce2c5eb3693baae040ddda8316ea3b6127");
        assert.strictEqual(body.sizeBytes, 261);
        assert.strictEqual(body.version, 1);
        assert.strictEqual(body.merkleRoot, "39b95731fbae308d85743e2682988038980d7463ea2fc1b21f91860b243892e9");
        assert.strictEqual(body.immutableMerkleRoot, "d837966bc672b6459385989fdbfc049773f03fd355bb62c9765cdfa51e7a19a4");
        assert.strictEqual(body.previousBlock, "471b4c1fcb6105c9812edde93c6dd760330daa8b3897a9484a24c3ce23683805");
        assert.strictEqual(body.nextBlock, "e17286ef05705b03f2396f28f06b9afafa4502157285ad1d1ebc08537d27de57");
      
        done();
      });
  });

  afterEach(function () {
    sinon.restore();
});
});




describe("GET /block/:blockHash/rawData return type check", function() {
  it("type check raw", function(done) {
    supertest(app)
      .get("/block/b9deaab16abe5f28967aebd0c6e94ce18c8309dec39816ea883885265b681f7c/rawData")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const rawBlock = JSON.parse(res.text);

        assert.ok(rawBlock);
        assert.notEqual(rawBlock.length, 0);
        assert.equal(typeof(rawBlock), "string");
        done();
      });
  });
});


describe("GET /block/:blockHash/txns return type check", function() {
  it("/block/:blockHash/txns", function(done) {
    supertest(app)
      .get("/block/b9deaab16abe5f28967aebd0c6e94ce18c8309dec39816ea883885265b681f7c/txns")
      //.query({ perPage: '25', page: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const block = JSON.parse(res.text);
        
        assert.ok( block.hash);
        assert.ok( block.confirmations);
        assert.ok( block.height);
        assert.ok( block.size);
        assert.ok( block.strippedsize);
        assert.ok( block.merkleroot);
        assert.ok( block.immutablemerkleroot);
        assert.ok( block.previousblockhash);
        assert.ok( block.nextblockhash);
        assert.ok( block.weight);
        assert.ok( block.features);
        assert.ok( block.featuresHex);
        assert.ok( block.time);
        assert.ok( block.mediantime);
        assert.ok( !block.xfieldType);
        assert.ok( block.proof);
        assert.ok( block.tx);
        assert.ok( block.nTx);

        const transaction = block.tx;  

        assert.equal(transaction.length, block.nTx);

        assert.ok( transaction[0].txid);
        assert.ok( transaction[0].hash);
        assert.ok( transaction[0].features);
        assert.ok( transaction[0].size);
        assert.ok( transaction[0].vsize);
        assert.ok( transaction[0].weight);
        assert.ok( !transaction[0].locktime);
        assert.ok( transaction[0].vin);
        assert.ok( transaction[0].vout);
        assert.ok( transaction[0].hex);

        done();
      });
  });
});


describe("GET /transaction/:txid return type check", function() {
  it("type check", function(done) {
    supertest(app)
      .get("/transaction/3a46acee8ac1434ca5f17f7b3626142de71a003f5e1e39a7abced3e2a7b94f2b")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const transaction = JSON.parse(res.text);

        assert.ok( transaction.txid);
        assert.ok( transaction.hash);
        assert.ok( transaction.features);
        assert.ok( transaction.size);
        assert.ok( transaction.vsize);
        assert.ok( transaction.weight);
        assert.ok( !transaction.locktime);
        assert.ok( transaction.vin);
        assert.ok( transaction.vout);
        assert.ok( transaction.hex);
        assert.ok( transaction.blockhash);
        assert.ok( transaction.confirmations);
        assert.ok( transaction.time);
        assert.ok( transaction.blocktime);
        done();
      });
  });
});


describe("GET /transaction/:txid/rawData return type check", function() {
  it("type check", function(done) {
    supertest(app)
      .get("/transaction/3a46acee8ac1434ca5f17f7b3626142de71a003f5e1e39a7abced3e2a7b94f2b/rawData")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const rawTransaction = JSON.parse(res.text);
        assert.ok(rawTransaction);
        assert.notEqual(rawTransaction.length, 0);
        assert.equal(typeof(rawTransaction), "string");
        done();
      });
  });
});


describe("GET /transaction/:txid/get return type check", function() {
  it("type check", function(done) {
    supertest(app)
      .get("/transaction/3a46acee8ac1434ca5f17f7b3626142de71a003f5e1e39a7abced3e2a7b94f2b/get")
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const getTransaction = JSON.parse(res.text);

        assert.ok( getTransaction.amount);
        assert.ok( getTransaction.generated);
        assert.ok( !getTransaction.blockindex);
        assert.ok( getTransaction.timereceived);
        assert.ok( getTransaction.txid);
        assert.ok( getTransaction.details);
        assert.ok( getTransaction.hex);
        assert.ok( getTransaction.blockhash);
        assert.ok( getTransaction.confirmations);
        assert.ok( getTransaction.time);
        assert.ok( getTransaction.blocktime);
        assert.ok( getTransaction.walletconflicts);

        done();
      });
  });
});


describe("GET /transactions return type check", function() {
  it("/transactions", function(done) {
    supertest(app)
      .get("/transactions")
      .query({ perPage: '25', page: 1 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) done(err);
        const transactions = (JSON.parse(res.text)).results;
        assert.equal( transactions.length,  25);

        assert.ok( transactions[0].txid);
        assert.ok( transactions[0].hash);
        assert.ok( transactions[0].features);
        assert.ok( transactions[0].size);
        assert.ok( transactions[0].vsize);
        assert.ok( transactions[0].weight);
        assert.ok( !transactions[0].locktime);
        assert.ok( transactions[0].vin);
        assert.ok( transactions[0].vout);
        assert.ok( transactions[0].hex);
        assert.ok( transactions[0].blockhash);
        assert.ok( transactions[0].confirmations);
        assert.ok( transactions[0].time);
        assert.ok( transactions[0].blocktime);

        done();
      });
  });
});