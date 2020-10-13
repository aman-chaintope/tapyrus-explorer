#!/bin/bash -eu

if [ ! -e ${CONF_DIR}/dev.json ]; then
  cat << EOS > ${CONF_DIR}/dev.json
{
  "tapyrusd": {
    "network": "testnet",
    "username": "rpcuser",
    "password": "rpcpassword",
    "host": "tapyrusd",
    "port": 2377
  },
  "electrs": {
    "port": 50001,
    "host": "electrs"
  }
}
EOS
fi

chmod 600 ${CONF_DIR}/dev.json

npm run prestart

exec sh -c "$*"
