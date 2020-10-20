# Setup

### Local
##### Tapyrusd
Run tapyrusd
```sh
$ sudo ./src/tapyrusd -datadir=/var/lib/tapyrus-testnet -conf=/etc/tapyrus/tapyrus.conf 
```
##### Electrs Tapyrus
Current implementation uses electrs-tapyrus.
Example of build and run in command line
```bash
$ cargo build --release
```
```bash
$ cargo run --release -- -vvvv --index-batch-size=10 --jsonrpc-import --db-dir ./db --electrum-rpc-addr="127.0.0.1:50001" --daemon-dir /var/lib/tapyrus-testnet/prod-1939510133/ --network-id 1939510133  --txid-limit=0
```

##### Tapyrus explorer
consists of backend (calling Tapyrusd & Electrs-Tapyrus to get data) and frontend

To setup dev and prod environment
create files
/backend/configurations/dev.json
/backend/configurations/prod.json
these files will only appear in your local. Eg.
```json
{
  "network": "testnet",
  "username": "user",
  "password": "pass",
  "port": 2377
}
```

To setup backend, from `/backend`, run:
```bash
npm install
npm run setup
```

To start backend, from `/backend`, run:
```bash
npm start
```

To test backend, from `/backend`, run:
```bash
npm run test
```

backend environment can be changed before you run `npm start` or `npm deploy` by changing the ENV to `'dev'` or `'prod'` in the package.json file as below
```json
  "scripts": {
    "prestart": "cross-env ENV='dev' node ./script.js", 
    "predeploy": "cross-env ENV='prod' node ./script.js"
  },
```

To start frontend, Run:
```bash
$ cd frontend; ionic serve;
```