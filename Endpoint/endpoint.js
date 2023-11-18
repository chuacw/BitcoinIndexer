import express from 'express';
import { DbAgent } from '../Common/dbAgent';
const app = express();
app.disable('x-powered-by');

// Check configuration
function checkConfiguration(dbHost, dbName, 
    dbUsername, dbPassword) {
    if (
        (typeof dbHost === "undefined") ||
        (typeof dbName === "undefined") ||
        (typeof dbUsername === "undefined") ||
        (typeof dbPassword === "undefined")
    ) {
        console.error('Configuration incomplete. Please check configuration file: .env');
        process.exit(255);
    }
    return {dbHost, dbName, dbUsername, dbPassword};
}

var dbAgent;

function initDbAgent(dbHost, dbPort, dbName, dbUsername, dbPassword) {
    dbAgent = new DbAgent(dbHost, dbPort, dbName, dbUsername, dbPassword);
}

function getDbAgent() {
    return dbAgent;
}

// log incoming requests
app.use((req, res, next) => {
    const now = new Date();
    console.log(`${now.toISOString()} Received request: ${req.method} ${req.url}`);
    next();
});

// "/opreturn" handler 
app.use('/opreturn/:opReturnData', async (
    req, 
    res, 
    next
   ) => {
    const raw_opReturnData = req.params.opReturnData;
    const opReturnData = decodeURI(raw_opReturnData); // 80 77 7244801 0 0 808464433
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Handling request for /opreturn/${opReturnData} from: ${ip}`);
    console.log(`Loading op_return for: ${opReturnData}`);
    const opReturnArray = await dbAgent.getOpReturns(opReturnData);
    if ((typeof opReturnArray !== "undefined") && (Array.isArray(opReturnArray))) {
        const opReturnResult = opReturnArray.map((element) => {
            delete element.pk;
            return element;
        });
        console.log(opReturnResult);
        res.status(200).json(opReturnResult);
    } else {
        res.status(200).json([]);
    }
    const now = new Date();
    console.log(`${now.toISOString()} Finished handling request`);
    next();
});

export default app;
export { dbAgent, initDbAgent, checkConfiguration, getDbAgent };