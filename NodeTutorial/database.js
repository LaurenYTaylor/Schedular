const pg = require('pg');
const connectionString = 'postgres://localhost:5432';

pg.connect(connectionString, onConnect);

function onConnect(err, client, done) {
    if(err) {
        console.error(err);
        process.exit(1);
    }
    client.end()
}