import { jest } from '@jest/globals';
import { BitcoinIndexer, checkConfiguration } from "../bitcoin-indexer.js";
import { BitcoinRPC } from "../bitcoin-rpc.js";
import { DbAgent } from "../../Common/DbAgent.js";

// Run with node --experimental-vm-modules node_modules/jest/bin/jest.js
const testTimeoutMS = 5 * 60000; // 5 minutes

describe('Indexer', () => {
    let indexer;

    beforeEach(() => {
        // Initialize BitcoinIndexer with mock values
        indexer = new BitcoinIndexer(
            'rpcHost',
            'rpcPassword',
            'rpcUsername',
            8332,
            'dbHost',
            5432,
            'dbName',
            'dbUsername',
            'dbPassword'
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    it('Constructor constructed correctly', () => {

        const rpcHost = 'rpcHost';
        const rpcPassword = 'rpcPassword';
        const rpcUsername = 'rpcUsername';
        const rpcPort = 8332;
        const dbHost = 'dbHost';
        const dbPort = 5432;
        const dbName = 'dbName';
        const dbUsername = 'dbUsername';
        const dbPassword = 'dbPassword';

        // Act
        const bitcoinIndexer = new BitcoinIndexer(
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

        expect(bitcoinIndexer.client).toBeDefined();
        expect(bitcoinIndexer.client instanceof BitcoinRPC).toBe(true);
        expect(bitcoinIndexer.client.config).toBeDefined();
        expect(bitcoinIndexer.client.config.auth).toBeDefined();
        expect(bitcoinIndexer.client.config.auth.username).toBe(rpcUsername);
        expect(bitcoinIndexer.client.config.auth.password).toBe(rpcPassword);
        expect(bitcoinIndexer.client.rpcConnection).toBe(`http://${rpcHost}:${rpcPort}/`);

        expect(bitcoinIndexer.dbAgent).toBeDefined();
        expect(bitcoinIndexer.dbAgent instanceof DbAgent).toBe(true);
        expect(bitcoinIndexer.dbAgent.pool).toBeDefined();
        expect(bitcoinIndexer.dbAgent.pool.options).toBeDefined();
        expect(bitcoinIndexer.dbAgent.pool.options.host).toBe(dbHost);
        expect(bitcoinIndexer.dbAgent.pool.options.port).toBe(dbPort);
        expect(bitcoinIndexer.dbAgent.pool.options.user).toBe(dbUsername);
        expect(bitcoinIndexer.dbAgent.pool.options.password).toBe(dbPassword);
    });

    test('checkConfiguration rpcHost undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = undefined; let rpcPassword = "rpcPassword"; let rpcUsername = "Username"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "name"; let dbUsername = "username"; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration rpcPassword undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = undefined; let rpcUsername = "Username"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "name"; let dbUsername = "username"; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration rpcUsername undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = undefined; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "name"; let dbUsername = "username"; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration dbHost undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = undefined;
        let dbPort = 3332; let dbName = "name"; let dbUsername = "username"; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration dbName undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = undefined; let dbUsername = "username"; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration dbPassword undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "dbName"; let dbUsername = "dbUsername"; let dbPassword = undefined;
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration dbUsername undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "dbName"; let dbUsername = undefined; let dbPassword = "dbpassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration dbPassword undefined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation((msg) => logMsg = msg);
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "dbName"; let dbUsername = "dbUsername"; let dbPassword = undefined;
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).toThrow(new Error(`Process exited with code 255`));
        expect(logMsg).toEqual('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(true);
    });

    test('checkConfiguration all defined', () => {
        let exitCaptured = false;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        const consoleSpy = jest.spyOn(console, 'error');
        let rpcHost = "rpcHost"; let rpcPassword = "rpcPassword"; let rpcUsername = "rpcUsername"; let rpcPort = 9999; let dbHost = "host";
        let dbPort = 3332; let dbName = "dbName"; let dbUsername = "dbUsername"; let dbPassword = "dbPassword";
        expect(() => {
            checkConfiguration(rpcHost, rpcPassword, rpcUsername, rpcPort, dbHost, dbPort, dbName, dbUsername, dbPassword)
        }).not.toThrow(new Error(`Process exited with code 255`));
        expect(consoleSpy).not.toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
        expect(exitCaptured).toBe(false);
    });

    test('startIndexing should fail if there are no args', async () => {
        process.argv = ['node', 'indexer.js'];
        indexer.hasLastBlockScanned = jest.fn(() => ({ hasLatestBlock: false }));
        let logMsg;
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation((msg) => logMsg = msg);
        let exitCaptured = false;
        let exitCode;
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                exitCode = code;
                throw new Error(`Process exited with code ${code}`);
            }
        );
        try {
            await indexer.startIndexing();
        } catch (e) {
        };
        expect(exitCaptured).toBe(true);
        expect(logMsg).toEqual('Requires block number to start scanning!');
        expect(exitSpy).toHaveBeenCalledWith(0);
    });

    test('startIndexing should start indexing and wait for new blocks', async () => {
        console.log = jest.fn();
        process.argv = ['node', 'indexer.js', 8];
        indexer.client.getBlockchainInfo = jest.fn()
            .mockReturnValueOnce({ blocks: 8, pruneheight: 7 })
            .mockReturnValueOnce({ blocks: 9, pruneheight: 7 });
        indexer.forever = jest.fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false);
        indexer.client.getBlockHash = jest.fn()
            .mockReturnValueOnce("fakehash-11111111")
            .mockReturnValueOnce("fakehash-22222222");
        indexer.client.getBlock = jest.fn()
            .mockReturnValueOnce({
                tx: [{
                    txid: "txid1", hash: "txhash1",
                    vout: [
                        { scriptPubKey: { asm: "OP_RETURN 111111" } }
                    ]
                }]
            })
            .mockReturnValueOnce({
                tx: [{
                    txid: "txid2", hash: "txhash2",
                    vout: [
                        { scriptPubKey: { asm: "OP_RETURN 22222222" } }
                    ]
                }]
            });

        indexer.dbAgent.insertTransaction = jest.fn();
        let newBlock;
        indexer.dbAgent.getLastBlock = jest.fn().mockReturnValue(undefined);
        indexer.waitForNewBlock = jest.fn((lastBlockScanned) =>
            lastBlockScanned + 1
        );
        indexer.dbAgent.updateLastBlock = jest.fn();
        indexer.hasLastBlockScanned = jest.fn().mockReturnValue({ hasLatestBlock: false });

        await indexer.startIndexing();

        expect(indexer.dbAgent.insertTransaction).toBeCalledTimes(2);
        expect(indexer.dbAgent.insertTransaction).toHaveBeenNthCalledWith(1, '111111', 'txid1', 'txhash1', 'fakehash-11111111');
        expect(indexer.dbAgent.insertTransaction).toHaveBeenNthCalledWith(2, '22222222', 'txid2', 'txhash2', 'fakehash-22222222');

        expect(indexer.dbAgent.updateLastBlock).toBeCalledTimes(2);
        expect(indexer.dbAgent.updateLastBlock).toHaveBeenNthCalledWith(1, 8, 0, 0);
        expect(indexer.dbAgent.updateLastBlock).toHaveBeenNthCalledWith(2, 9, 0, 0 );

        expect(indexer.waitForNewBlock).toBeCalledTimes(2);
        expect(indexer.waitForNewBlock).toHaveBeenNthCalledWith(1, 8);
        expect(indexer.waitForNewBlock).toHaveBeenNthCalledWith(2, 9);

        expect(indexer.forever).toBeCalledTimes(2);

    }, testTimeoutMS);

});
