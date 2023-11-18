
/* 
The purpose of this project is to store and index Bitcoin OP_RETURN data for all transactions after a certain block.
This data will then be served on an HTTP endpoint as a JSON payload.
This subproject pulls all transactions and places it into the database.
*/
import 'dotenv/config';
import { BitcoinRPC } from './bitcoin-rpc.js';
import { sleep } from '../Common/sleep.js';
import { isErrnoException } from '../Common/ErrorHelper.js';
import { DbAgent } from "../Common/DbAgent.js";

class BitcoinIndexer {
    client/* : BitcoinRPC */;
    dbAgent/* : DbAgent */;

    /**
     *
     * @param rpcUsername RPC user name for accessing Bitcoin RPC
     * @param rpcPassword        Ditto password
     * @param rpcHost    Host name for Bitcoin RPC server
     * @param rpcPort         Port
     * @param dbHost    Host name for Postgres DB server
     * @param dbPort         Port for Postgres DB server
     * @param dbName      Database name to use
     * @param dbUsername  User name to access Postgres DB
     * @param dbPassword   Password to access Postgres DB
     */
    constructor(
        rpcHost/* : string */,
        rpcPassword/* : string */,
        rpcUsername/* : string */,
        rpcPort/* : string | number */,
        dbHost/* : string */,
        dbPort/* : string | number */,
        dbName/* : string */,
        dbUsername/* : string */,
        dbPassword/* : string */
    ) {
        this.client = new BitcoinRPC(rpcUsername, rpcPassword, rpcHost, rpcPort);
        this.dbAgent = new DbAgent(dbHost, dbPort, dbName, dbUsername, dbPassword);
    }

    /**
     * Checks if the database has the last block scanned.
     * @returns {Promise<{hasLatestBlock: boolean, lastBlockNumber: number}>}
     */
    async hasLastBlockScanned() {
        let dbAgent = this.dbAgent;
        try {   
            let lastBlock = await dbAgent.getLastBlock();
            let lHasLatestBlock = (typeof lastBlock !== "undefined");
            let lastBlockNumber = 0;
            if (lHasLatestBlock) {
                lastBlockNumber = lastBlock?.blockNumber;
            }
            return { hasLatestBlock: lHasLatestBlock, lastBlockNumber: lastBlockNumber };
        } catch (e) {
            if ((isErrnoException(e)) && (e.errno/* ! */ === -4078)) {
                throw new Error("Unable to connect to database server!");
            }
        }
    }

    /**
     * Looks for OP_RETURN in scriptPubKey asm field and when it appears, indexes the transaction * @param aStartingBlockNumber
     * @param aStartingBlockNumber The starting block number to scan/index.
     * @returns {Promise<void>} The last block number scanned / indexed.
     */
    async indexTransactions(aStartingBlockNumber/* : string */) {
        let blockNumber;
        try {

            let dbAgent = this.dbAgent;
            let client = this.client;

            let lstartingBlockNumber = Number(aStartingBlockNumber);
            let blockchainInfo = await client.getBlockchainInfo();
            let earliestBlock = blockchainInfo.pruneheight;
            if (lstartingBlockNumber < earliestBlock) {
                console.log(`earliest starting block number is: ${earliestBlock}`);
                return;
            }
            let latestBlockNumber = blockchainInfo.blocks;
            blockNumber = lstartingBlockNumber;

            // start from the latest block if available
            let lastBlock = await dbAgent.getLastBlock();
            if ((typeof lastBlock !== "undefined") && (lastBlock.blockNumber > blockNumber)) {
                blockNumber = lastBlock.blockNumber;
                console.log(`Starting indexing from block ${blockNumber} as its the latest data in the table`);
            }
            let blockHash;
            while (blockNumber <= latestBlockNumber) {
                try {
                    console.log(`getting block hash for block: ${blockNumber}`);
                    blockHash = await client.getBlockHash(blockNumber);
                } catch (e) {
                    continue;
                }
                let blockTxs;
                try {
                    console.log(`getting transactions for block ${blockNumber} with hash: ${blockHash}`);
                    blockTxs = await client.getBlock(blockHash, 2);

                    let transactions = blockTxs.tx;
                    let txStartIndex = 0;

                    // Restart from the last block saved, if available
                    if ((typeof lastBlock !== "undefined") &&
                        (lastBlock.blockNumber === blockNumber) &&
                        (lastBlock.transactionIndex > txStartIndex)) {
                        txStartIndex = lastBlock.transactionIndex + 1;
                    }

                    for (let transactionIndex = txStartIndex; transactionIndex < transactions.length; transactionIndex++) {
                        console.log(`Scanning block: ${blockNumber} transaction index: ${transactionIndex}`);
                        let transaction = transactions[transactionIndex];
                        let txId = transaction.txid;
                        let txHash = transaction.hash;
                        let voStartIndex = 0;

                        // Restart from the last block saved, if available
                        if ((typeof lastBlock !== "undefined") &&
                            (transactionIndex === lastBlock.transactionIndex && lastBlock.voIndex > voStartIndex)) {
                            voStartIndex = lastBlock.voIndex + 1;
                            lastBlock = undefined;
                        }

                        // Scan all scriptPubKeys for OP_RETURN and when found, insert into the
                        // blocktransactions table, as well as update the last block.
                        if (transaction.vout.length > 0) {
                            console.log(`Scanning from block: ${blockNumber} transaction index: ${transactionIndex} vout index: ${voStartIndex}`);
                        }
                        let lastBlockUpdated = false;
                        for (let voIndex = voStartIndex; voIndex < transaction.vout.length; voIndex++) {
                            let vout = transaction.vout[voIndex];
                            let scriptPubKeyAsm = vout.scriptPubKey.asm;
                            if (scriptPubKeyAsm.startsWith('OP_RETURN')) {
                                let OP_RETURN = scriptPubKeyAsm.substring('OP_RETURN '.length);
                                console.log(`Found OP_RETURN in block: ${blockNumber}, tx Index: ${transactionIndex} txid: ${txId}, index: ${voIndex}, txhash: ${txHash}`);
                                await dbAgent.insertTransaction(OP_RETURN, txId, txHash, blockHash);
                            }
                            await dbAgent.updateLastBlock(blockNumber, voIndex, transactionIndex);
                            lastBlockUpdated = true;
                        }
                        // in the rare event where there's no vout, update the last block
                        if (!lastBlockUpdated) {
                            await dbAgent.updateLastBlock(
                                blockNumber,
                                -1,
                                transactionIndex
                            );
                        }

                    }
                    console.log("=".repeat(90));
                    lastBlock = undefined;

                    blockNumber++;
                } catch (error) {
                    console.error(error);
                }
            }
            console.log("Finished scanning.");
        } catch (error) {
            console.error('Error fetching transactions.');
        }
        return blockNumber - 1;
    }

    /**
     * Waits for new blocks from the RPC server.
     * @param lastBlockScanned The last block number that was scanned/indexed.
     * @returns {Promise<*>} The new block number
     */
    async waitForNewBlock(lastBlockScanned/* : number | undefined */) {
        console.log('Waiting for new blocks...');
        let latestBlockNumber;
        do {
            let blockchainInfo;
            try {
                blockchainInfo = await this.client.getBlockchainInfo();
            } catch (e) {
                // most likely cause, Bitcoin RPC server died/network disconnection
                console.error("Connection error, waiting to reconnect and getBlockchainInfo");
                await sleep(1000);
                continue;
            }
            latestBlockNumber = blockchainInfo.blocks;
            if (latestBlockNumber === lastBlockScanned) {
                await sleep(1000);
            }
        }
        while (lastBlockScanned === latestBlockNumber);
        return latestBlockNumber;
    }

    forever() {
        return true;
    }

    /**
     * starts indexing blocks from the Bitcoin RPC server. Waits for new blocks when indexing is completed.
     * @returns {Promise<void>}
     */
    async startIndexing() {

        let startingBlockNumber;
        const args = process.argv.slice(2);
        if (args.length < 1) {
            let latestBlockInfo = await this.hasLastBlockScanned();

            if (!latestBlockInfo/* ! */.hasLatestBlock) {
                console.log("Requires block number to start scanning!");
                process.exit(0);
            }
            startingBlockNumber = latestBlockInfo/* ! */.lastBlockNumber;
        } else {
            startingBlockNumber = args[0];
        }
        console.log(`Starting indexing from block ${startingBlockNumber}`);

        do {
            try {
                let lastBlockScanned = await this.indexTransactions(startingBlockNumber);
                // finished scanning, caught up to latest

                // wait for new block to arrive, then start indexing from new block
                startingBlockNumber = await this.waitForNewBlock(lastBlockScanned);
            } catch (e) {
                console.error("Connection error, waiting to reconnect");
                await sleep(1000);
            }
        } while (this.forever());

    }
}

function showBanner() {
    console.log("Bitcoin transaction indexer v0.1 by chuacw (C) 2023-2023")
}

/* interface configurationChecked {
    rpcHost: string, rpcPassword: string, 
    rpcUsername: string, rpcPort: string | number, dbHost: string, 
    dbPort: string | number, dbName: string, dbUsername: string, dbPassword: string    
} */

/**
 * Checks that all required configuration parameters are defined
 * @param rpcHost
 * @param rpcPassword
 * @param rpcUsername
 * @param rpcPort
 * @param dbHost
 * @param dbPort
 * @param dbName
 * @param dbUsername
 * @param dbPassword
 */
function checkConfiguration(rpcHost/* : string | undefined */, rpcPassword/* : string | undefined */, 
    rpcUsername/* : string | undefined */, rpcPort/* : string | number */, dbHost/* : string | undefined */,
    dbPort/* : string | number */, dbName/* : string | undefined */, dbUsername/* : string | undefined */, dbPassword/* : string | undefined */)/* :  */
// type guard
/*     {
        rpcHost: string, rpcPassword: string, 
        rpcUsername: string, rpcPort: string | number, dbHost: string, 
        dbPort: string | number, dbName: string, dbUsername: string, dbPassword: string    
    } */
    {
    if ((typeof rpcHost === "undefined") ||
        (typeof rpcPassword === "undefined") ||
        (typeof rpcUsername === "undefined") ||
        (typeof rpcPort === "undefined") ||
        (typeof dbHost === "undefined") ||
        (typeof dbPort === "undefined") ||
        (typeof dbName === "undefined") ||
        (typeof dbUsername === "undefined") ||
        (typeof dbPassword === "undefined")
    ) {
        console.error('Configuration incomplete. Please check configuration file: .env');
        process.exit(255);
    }
    return {rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword};
}

/**
 * Checks the configuration, creates an instance of the new Bitcoin Indexer and starts indexing 
 * @returns {Promise<void>}
 */
async function runIndexer() {
    const rpcUsername = process.env.RPC_USERNAME;
    const rpcPassword = process.env.RPC_PASSWORD;
    const rpcHost = process.env.RPC_HOST;
    const rpcPort = process.env.RPC_PORT || 8332;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || 5432;
    const dbName = process.env.DB_NAME;
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;

    showBanner();

    checkConfiguration(
        rpcHost,
        rpcPassword,
        rpcUsername,
        rpcPort,
        dbHost,
        dbPort,
        dbName,
        dbUsername,
        dbPassword
    );
    try {
        let indexer = new BitcoinIndexer(
            rpcHost/* ! */,
            rpcPassword/* ! */,
            rpcUsername/* ! */,
            rpcPort,
            dbHost/* ! */,
            dbPort,
            dbName/* ! */,
            dbUsername/* ! */,
            dbPassword/* ! */
        );
        await indexer.startIndexing();
    } catch (e) {
        console.error(e);
    }
}

export {
    runIndexer,
    checkConfiguration,
    BitcoinIndexer
}