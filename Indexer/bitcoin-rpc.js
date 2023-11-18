import axios from 'axios';

/**
 * A Bitcoin RPC client based on https://developer.bitcoin.org/reference/rpc/
 */

class BitcoinRPC {
    // rpcID: number;
    // rpcConnection: string;
    // config: {
    //     auth: {
    //         username:
    //         /**
    //          * A Bitcoin RPC client based on https://developer.bitcoin.org/reference/rpc/
    //          */
    //         string; password: string;
    //     };
    // };

    constructor(rpcUsername, rpcPassword, rpcHost, rpcPort, protocol) {
        this.rpcID = 1;
        let lProtocol = (typeof protocol == "undefined") ? "http" : protocol;
        this.rpcConnection = `${lProtocol}://${rpcHost}:${rpcPort}/`;
        this.config = {
            auth: {
                username: rpcUsername,
                password: rpcPassword
            }
        };
    }

    /**
     * Makes a RPC call and increases the RPC ID for the next use.
     * @param method The RPC method name to call
     * @param params The parameters sent to the RPC method
     * @returns {Promise<axios.AxiosResponse<any>>} Result of the RPC call
     */
    async rpcCall(method, params) {
        let result = await axios.post(this.rpcConnection, {
            jsonrpc: '1.0',
            id: this.rpcID++,
            method,
            params,
        }, this.config);
        return result;
    }

    /**
     * Returns Bitcoin's blockchain info
     * @returns {Promise<*>} blockchain info
     */
    async getBlockchainInfo() {
        let result = await this.rpcCall('getblockchaininfo', []);
        return result.data.result;
    }

    /**
     * Gets the transactions for a given block hash
     * @param blockHash
     * @param verbosity
     * @returns {Promise<*>}
     */
    async getBlock(blockHash, verbosity) {
        let result = await this.rpcCall('getblock', [blockHash, verbosity]);
        return result.data.result;
    }

    /**
     * Gets the block hash for a given block number
     * @param blockNumber
     * @returns {Promise<*>}
     */
    async getBlockHash(blockNumber) {
        let result = await this.rpcCall('getblockhash', [blockNumber]);
        return result.data.result;
    }

    /**
     * Gets the raw transaction data given a transaction hash
     * @param aTxHash The transaction hash to retrieve data for
     * @param aVerbosity The verbosity of the received data
     * @returns {Promise<SVGAnimatedString|T|string|ArrayBuffer>}
     */
    async getRawTransaction(aTxHash, aVerbosity) {
        // let lVerbosity = (typeof aVerbosity === "undefined") ? true : aVerbosity;
        let result = await this.rpcCall('getrawtransaction', [aTxHash]);
        return result.data.result;
    }

}

export { BitcoinRPC };