import { jest } from '@jest/globals';
import request from 'supertest';
import app, { checkConfiguration, getDbAgent, initDbAgent } from '../endpoint.js';

const testTimeoutMS = 60000;

describe('Endpoint', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle valid GET request to /opreturn/:opReturnData', async () => {
        const opReturnData = "XXXXXX";
        const getOpReturnsResponse = [{
            pk: "30997",
            opreturn: opReturnData,
            txid: "8c09adce309396f783dc36b4f5dee2d8d2ce3fc158a0953e85503f99d9f1f328",
            txhash: "5d7bcee0425f1a9e0399a26136b373587ecdbe16ed415687899dd1e17823a27f",
            blockhash: "00000000000000000001abe9fd653aac11532bb6a815c7c0ab8e33fe16771f6f",
        }];
        let expectedResponse = getOpReturnsResponse;
        if ((typeof expectedResponse !== "undefined") && (Array.isArray(expectedResponse)) && (expectedResponse.length >= 1)) {
           delete expectedResponse[0].pk; 
        }
        initDbAgent('localhost', 5432, 'dbName', 'dbUsername', 'dbPassword');
        const mockClient = {
            query: jest.fn().mockImplementation(() => {
                return {rows: getOpReturnsResponse};
            }),
            release: jest.fn(),
            commit: jest.fn()
        };
    
        let agent = getDbAgent();
        // Mock the pool connect method
        agent.pool.connect = jest.fn().mockResolvedValue(mockClient);
   
        const response = await request(app).get(`/opreturn/${opReturnData}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual(expectedResponse);
    }, testTimeoutMS);

    it('should handle invalid GET request to /opreturn/:opReturnData', async () => {
        const opReturnData = "invalidYYYYYY";
        const getOpReturnsResponse = [{
        }];
        let expectedResponse = getOpReturnsResponse;
        delete expectedResponse.pk;
        initDbAgent('localhost', 5432, 'dbName', 'dbUsername', 'dbPassword');
        let dbAgent = getDbAgent();
        dbAgent.getOpReturns = jest.fn(() => {
            return undefined
        });
        
        const response = await request(app).get(`/opreturn/${opReturnData}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual([]);
    }, testTimeoutMS);

    it('should handle incomplete configuration - all', async () => {
        // Mock incomplete configuration
        const dbHost = undefined;
        const dbName = undefined;
        const dbUsername = undefined;
        const dbPassword = undefined;

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(true);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

    it('should handle incomplete configuration - dbHost', async () => {
        // Mock incomplete configuration
        const dbHost = undefined;
        const dbName = "dbName";
        const dbUsername = "dbUsername";
        const dbPassword = "dbPassword";

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(true);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

    it('should handle incomplete configuration - dbName', async () => {
        // Mock incomplete configuration
        const dbHost = "dbHost";
        const dbName = undefined;
        const dbUsername = "dbUsername";
        const dbPassword = "dbPassword";

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(true);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

    it('should handle incomplete configuration - dbUsername', async () => {
        // Mock incomplete configuration
        const dbHost = "dbHost";
        const dbName = "dbName";
        const dbUsername = undefined;
        const dbPassword = "dbPassword";

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(true);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

    it('should handle incomplete configuration - dbPassword', async () => {
        // Mock incomplete configuration
        const dbHost = "dbHost";
        const dbName = "dbName";
        const dbUsername = "dbUsername";
        const dbPassword = undefined;

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(true);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

    it('should handle complete configuration', async () => {
        // Mock incomplete configuration
        const dbHost = "somehost";
        const dbName = "somedatabase";
        const dbUsername = "someuser";
        const dbPassword = "somepassword";

        let exitCaptured = false;
        // Spy on console.error to check if the error message is logged
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(
            (code) => {
                exitCaptured = true;
                throw new Error(`Process exited with code ${code}`);
            }
        );

        expect(() => checkConfiguration(dbHost, dbName, dbUsername, dbPassword)).not.toThrow(new Error(`Process exited with code 255`));
        expect(exitCaptured).toBe(false);
        expect(consoleErrorSpy).not.toHaveBeenCalledWith('Configuration incomplete. Please check configuration file: .env');
    });

});
