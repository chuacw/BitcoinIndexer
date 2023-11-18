import { jest } from '@jest/globals';
import { DbAgent } from "../../Common/DbAgent.js";

describe('DbAgent', () => {
    // Mock configuration values
    const dbHost = 'localhost';
    const dbPort = 5432;
    const dbName = 'testDB';
    const dbUsername = 'testUser';
    const dbPassword = 'testPassword';

    // Create an instance of dbAgent with mock configurations
    const agent = new DbAgent(dbHost, dbPort, dbName, dbUsername, dbPassword);

    afterEach( () => {
        jest.clearAllMocks();
    });
    
    // Mocking the client methods
    const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
        commit: jest.fn()
    };

    // Mocking the Pool connect method
    agent.pool.connect = jest.fn().mockResolvedValue(mockClient);

    // Test case for updateLastBlock method
    it('should update last block correctly', async () => {
        // Mocking selectTransaction response
        mockClient.query
            .mockResolvedValueOnce({
                rowCount: 0, // Response to 'SELECT * FROM public.lastblock LIMIT 1';
            })
            .mockResolvedValueOnce({
                rowCount: 1, // Response to 'INSERT INTO public.lastblock(blocknumber, voindex, txindex) VALUES ($1, $2, $3)' 
                rows: [{ pk: 1 }]
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ pk: 2 }]
            });

        await agent.updateLastBlock({
            blockNumber: 1,
            voIndex: 2,
            transactionIndex: 3,
        });

        expect(mockClient.query).toHaveBeenCalledTimes(4); // Once for selectTransaction, once for the update or insert, once for commit
        expect(mockClient.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM public.lastblock LIMIT 1');
/*         expect(mockClient.query).toHaveBeenNthCalledWith(2,
            'INSERT INTO public.lastblock(blocknumber, voindex, txindex) VALUES ($1, $2, $3)',
            [1, 2, 3]
        );
 */        expect(mockClient.query).toHaveBeenNthCalledWith(3, 'SELECT * FROM public.lastblock LIMIT 1');
        expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
    });

    // Test case for getOpReturns method
    it('should get OpReturns correctly', async () => {
        // Mocking query response
        const mockOpReturnsData = [{ opreturn: 'mockOpReturnsData' }];
        mockClient.query.mockResolvedValueOnce({
            rows: mockOpReturnsData,
        });

        const opReturns = await agent.getOpReturns('mockOpReturn');

        expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM blocktransactions WHERE opreturn = $1', ['mockOpReturn']);
        expect(opReturns).toEqual(mockOpReturnsData);
    });

    // Test case for getLastBlock method
    it('should get last block correctly', async () => {
        // Mocking query response
        const mockLastBlock = { pk: 1, blocknumber: 2, voindex: 3, txindex: 4 };
        mockClient.query.mockResolvedValueOnce({
            rows: [mockLastBlock],
        });

        const lastBlock = await agent.getLastBlock();

        expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM public.lastblock LIMIT 1');
        expect(lastBlock).toEqual({
            blockNumber: 2,
            voIndex: 3,
            transactionIndex: 4,
        });
    });

    // Test case for insertTransaction method
/*     it('should insert transaction correctly', async () => {
        await agent.insertTransaction({
            OP_RETURN: 'mockOpReturn',
            txId: 'mockTxId',
            txHash: 'mockTxHash',
            blockHash: 'mockBlockHash',
        });

        expect(mockClient.query).toHaveBeenNthCalledWith(1,
            'INSERT INTO public.blocktransactions(opreturn, txid, txhash, blockhash) VALUES ($1, $2, $3, $4)',
            ['mockOpReturn', 'mockTxId', 'mockTxHash', 'mockBlockHash']
        );
        expect(mockClient.query).toHaveBeenNthCalledWith(2, 'COMMIT');
    });
 */    
});
