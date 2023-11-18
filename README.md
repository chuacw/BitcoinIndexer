# Chee-Wee's Bitcoin project

This is separated into 2 modules and a set of scripts:
* Database scripts
* Bitcoin Indexer
* Endpoint

## Database scripts
The database scripts are used to built the database and the table to store the transaction
data matching the specifications given in [README.md](README.md).

For further details, see the [README in the database_scripts directory](./database_scripts/README.md).

## Bitcoin Indexer
The Bitcoin Indexer's job is to connect to the Bitcoin RPC server, index data matching the
specifications given in [README.md](README.md) into the Postgres database server.

For further details, see the [README in the Indexer's directory](./Indexer/README.md).

## Endpoint
The Endpoint's job is to connect to the Postgres database server, and return data matching
specifications given in [README.md](./README.md).

For further details, see the [README in the Endpoint's directory](./Endpoint/README.md).

## Bitcoin Configuration File
There's a bitcoin.conf in the root directory. This is the configuration that is backing the
bitcoind server that I'm running.

## Test environment
Bitcoind from Bitcoin Core version v25.0.0   
Node 18.17.1   
Postgres 16.1-1   

Chee-Wee, Chua  
18 Nov 2023.
