import app, { checkConfiguration, initDbAgent } from './endpoint.js'

import 'dotenv/config';
const port = process.env.LISTEN_PORT || 3000;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

checkConfiguration(dbHost, dbName, dbUsername, dbPassword);
try {
    initDbAgent(dbHost/* ! */, dbPort, dbName/* ! */, dbUsername/* ! */, dbPassword/* ! */);

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
} catch (e) {
    console.error(e);
}