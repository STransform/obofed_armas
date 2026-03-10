const axios = require('axios');

async function testApi() {
    try {
        // We need a valid token. Since we don't have one easily, we'll just check the DB directly using node-postgres
        const { Client } = require('pg');
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'core_db',
            password: 'root', // Assumed default, change if needed
            port: 5432,
        });

        await client.connect();
        console.log("Connected to DB");

        const res = await client.query("SELECT id, reportstatus, docname, supporting_docname FROM master_transaction WHERE reportstatus IN ('Under Review', 'Corrected') ORDER BY id DESC LIMIT 10");
        console.log("Under Review/Corrected Tasks:");
        console.table(res.rows);

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testApi();
