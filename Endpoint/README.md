# Endpoint server
This is an HTTP endpoint server that serves up blockchain hashes 
when a request matches the corresponding OP_RETURN data in the 
Postgres database server.

### Configuration of authentication to servers
Configure the env.sample for authentication to the database server, then copy to .env

### Running
Once the authentication is configured, run the endpoint server with the command:
* node ./server.js 

### Using the Endpoint server

Make a call to http://hostname:3000/opreturn/${OP_RETURNDATA}
eg, http://chuacw.ath.cx:3000/opreturn/68747470733a2f2f74727573746c6573732e636f6d7075746572

### Tests
Run npm test

Chee-Wee, Chua  
5 Nov 2023.
