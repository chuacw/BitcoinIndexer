import pkg from 'pg';
const { Pool } = pkg;

class DbAgent {
    pool/* : pkg.Pool */;
    lastBlockCheck/* : boolean */;
    pk/* : number | undefined */;
    constructor(dbHost/* : string */, dbPort/* : string | number */, dbName/*: string */, dbUsername/* : string */, dbPassword/* : string */) {
        this.pool = new Pool({
            user: dbUsername,
            host: dbHost,
            database: dbName,
            password: dbPassword,
            port: Number(dbPort),
        });
        this.lastBlockCheck = true;
    }

    /**
     * Updates the last block scanned into the database
     * @param blockNumber the block number that was last scanned
     * @param voIndex the index for vout that was last scanned
     * @param transactionIndex the index for the transaction that was last scanned
     * @returns {Promise<void>} doesn't return anything
     */
    async updateLastBlock(blockNumber/* : any */, voIndex/* : number */, transactionIndex/* : number */){
        const client = await this.pool.connect();
        let statement = '';
        let statementValues = [];
        if (this.lastBlockCheck) {
            const selectTransaction = 'SELECT * FROM public.lastblock LIMIT 1';
            let res = await client.query(selectTransaction);
            let count = res.rowCount;
            switch(count) {
                case 0: {
                    statement = 'INSERT INTO public.lastblock(blocknumber, voindex, txindex) VALUES ($1, $2, $3)'
                    statementValues = [blockNumber, voIndex, transactionIndex];
                    await client.query(statement, statementValues);
                    let res = await client.query(selectTransaction);
                    this.pk = Number(res.rows[0].pk);
                    break;
                }
                case 1: {
                    if (typeof this.pk === "undefined") {
                        this.pk = Number(res.rows[0].pk);
                    }
                    statement = 
                        'UPDATE public.lastblock SET blocknumber = $1,\n' +
                        '    voindex = $2,\n' +
                        '    txindex = $3\n' +
                        'WHERE pk = $4;'
                    statementValues = [blockNumber, voIndex, transactionIndex, this.pk];
                    await client.query(statement, statementValues);
                    this.lastBlockCheck = false;
                    break;
                }
            }
        } else {
            statement = 
                'UPDATE public.lastblock SET blocknumber = $1,\n' +
                '    voindex = $2,\n' +
                '    txindex = $3\n' +
                'WHERE pk = $4;'
            statementValues = [blockNumber, voIndex, transactionIndex, this.pk];
            await client.query(statement, statementValues);
        }
        await client.query('COMMIT');
        await client.release();
    }

    /**
     * Gets an array of transaction hashes for a given opreturn data
     * @param aOpReturn The data to search for
     * @returns {Promise<number|[]|string|HTMLCollectionOf<HTMLTableRowElement>|number|SQLResultSetRowList|*>} The matching array of hashes for the given OpReturn
     */
    async getOpReturns(aOpReturn/* : string */){
        const client = await this.pool.connect();
        const statement = 'SELECT * FROM blocktransactions WHERE opreturn = $1';
        const statementValues = [aOpReturn];
        let result = await client.query(statement, statementValues);
        await client.release();
        return result.rows;
    }

    /**
     * Gets the last block that was scanned
     * @returns {Promise<{blockNumber: number, voIndex: number, transactionIndex: number}|undefined>} The last block that was scanned, including the vout index and the transaction index
     */
    async getLastBlock()/* : Promise<{ blockNumber: any; voIndex: any; transactionIndex: any; } | undefined> */ {
        const client = await this.pool.connect();
        const selectTransaction = 'SELECT * FROM public.lastblock LIMIT 1';
        let res = await client.query(selectTransaction);
        let row = res.rows[0];
        if (typeof row === "undefined") {
            return undefined;
        }
        let pk = row.pk;
        let voIndex = Number(row.voindex);
        let transactionIndex = Number(row.txindex);
        let blockNumber = Number(row.blocknumber);
        await client.release();
        return { blockNumber, voIndex, transactionIndex };
    }

    /**
     * Inserts the provided transaction hash into the database
     * @param aOpReturn the opreturn data
     * @param aTxId the transaction id
     * @param aTxHash the transaction hash
     * @param aBlockHash the block hash
     * @returns {Promise<void>}
     */
    async insertTransaction(aOpReturn/* : any */, aTxId/* : any */, aTxHash/* : any */, aBlockHash/* : any */) {
        const client = await this.pool.connect();
        const insertTransaction = 'INSERT INTO public.blocktransactions(opreturn, txid, txhash, blockhash) VALUES ($1, $2, $3, $4)'
        const insertTransactionValues = [aOpReturn, aTxId, aTxHash, aBlockHash];
        await client.query(insertTransaction, insertTransactionValues);
        await client.query('COMMIT');
        await client.release();
    }
    
}

export {
    DbAgent
}