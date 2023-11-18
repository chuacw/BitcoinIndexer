# Bitcoin Indexer

This is an indexer that indexes Bitcoin transactions that has OP_RETURN in its vout scriptPubKey field.

### Building the database
See the instructions in the database scripts directory.
Once the database is built, you can run the Bitcoin indexer.

### Configuring authentication credentials

You'll need to configure authentication credentials in order to login to the Bitcoin RPC server and the 
Postgres database server as well.

See env.sample. Configure accordingly, then copy to .env.

### Running
node ./indexer.js <_blockNumber_>

eg, node ./indexer.js 815100

### Tests
Run npm test

Chee-Wee, Chua  
5 Nov 2023.
