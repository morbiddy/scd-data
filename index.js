require('dotenv').config();
const express = require('express');
const queries = require('./queries');
const sql = require('mssql');
const fs = require('fs');

const app = express();
const port = 3000;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

// Endpoint to get data
app.get('/api/data', async (req, res) => {
    try {
        const dateCondition = queries.generateDateCondition(0,11,2024);
        const query = queries.getForfaitsTechnieker('MT', dateCondition);
        //res.json(query);
        const pool = await sql.connect(config);
        const result = await pool.request().query(query);
        
        res.json(sortByDate(result.recordset));
        sql.close();
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

// Serve static files (for frontend)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const tbl_herstellingen = "herstellingen";
const tbl_webberichten = "web_berichten";
const tbl_herstellingenlijn = "herstellingenlijn";
const tbl_product = "produkt";
const tbl_klanten = "derden";

function sortByDate(recordset){
    //console.log(recordset);

    const groupedData = {};
    
    recordset.forEach(row => {
        const date = row.hersteld_op.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        if (!groupedData[date]) {
            groupedData[date] = 0; // Initialize total for the date
        }
        groupedData[date] += Math.round( row.aantal * row.eenheidsprijs) * 100  / 100; // Add the forfaits value
    });
    console.log(groupedData);
    // Convert grouped data into an array for the chart
    const chartData = Object.entries(groupedData).map(([date, totalForfaits]) => ({
        date: date,
        total: totalForfaits,
    }));

    console.log(chartData);

    return chartData;
}

async function writeDataToFile(){
    try{
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        const query = queries.getForfaitsAll('2024');
        const result = await pool.request().query(query);
        const records = result.recordset;
        const jsonData = JSON.stringify(records, null, 2);

        fs.writeFileSync('./sqlData', jsonData, 'utf8');
        //console.log(result);
        sql.close();
    }
    catch(err){
        console.error('Database connection failed:', err);
    }
}

writeDataToFile();

/*async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        // Example query
        const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';");
        console.log(result);

        sql.close();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}*/

//connectToDatabase();

/*async function getColumns(tableName) {
    try {
        const pool = await sql.connect(config);
        console.log(`Connected to the database to fetch columns for table: ${tableName}`);

        const query = `
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName;
        `;
        const result = await pool.request()
            .input('tableName', sql.NVarChar, tableName) // Parameterized query to avoid SQL injection
            .query(query);

        const columns = result.recordset.map(row => ({
            columnName: row.COLUMN_NAME,
            dataType: row.DATA_TYPE,
            maxLength: row.CHARACTER_MAXIMUM_LENGTH,
        }));

        console.log('Columns:', columns);

        sql.close();
        return columns;
    } catch (err) {
        console.error('Error retrieving table columns:', err);
        sql.close();
    }
}*/

//getColumns(tbl_herstellingen);

/*async function getForfaitsQuery(technieker, day, month, year) {
    try {

        console.log(`Connected to the database to fetch forfaits for technieker: ${technieker}`);

        let date = ``;
        if (day != 0) {
            date += " AND (Day([hersteld_op]) = " + day + ")";
        }
        if (month != 0) {
            date += " AND (Month([hersteld_op]) = " + month + ")";
        }
        if (year != 0) {
            date += " AND (Year([hersteld_op]) = " + year + ")";
        }

        const query = `
            SELECT herstellingen.garantie, herstellingen.merk, herstellingenlijn.produkt, herstellingenlijn.eenheidsprijs, 
            herstellingenlijn.aantal, herstellingen.hersteld_op, herstellingen.jaar, herstellingen.nummer
            FROM (herstellingen INNER JOIN herstellingenlijn ON 
                (herstellingen.nummer = herstellingenlijn.nummer) AND 
                (herstellingen.journaal = herstellingenlijn.journaal) AND 
                (herstellingen.jaar = herstellingenlijn.jaar)) 
            INNER JOIN produkt ON herstellingenlijn.produkt = produkt.prodkode
            WHERE (herstellingen.technieker = '${technieker}' ${date} AND (produkt.labour<>0 OR produkt.prodkode='DIV' OR produkt.prodkode='DOA'))
            ORDER BY herstellingen.hersteld_op
        `;
        return query;
        console.log(date);
        console.log(technieker);
        //console.log(query);
        const pool = sql.connect(config);
        //console.log('connected');
        const result = await pool.request()
            .input('technieker', sql.NVarChar, technieker) // Parameterized query to avoid SQL injection
            .input('date', sql.NVarChar, date) // Parameterized query to avoid SQL injection
            .query(query);

        /*const columns = result.recordset.map(row => ({
            garantie: row.garantie,
            datum: row.hersteld_op,
            merk: row.merk,
            product: row.produkt,
            herstelling: row.jaar +' '+ row.nummer,
            prijs: row.eenheidsprijs.toFixed(2) + " x " + row.aantal + " = " + (row.eenheidsprijs*row.aantal).toFixed(2),
            
        }));*/

        //console.log('Columns:', columns);
        //console.table(columns);
        //sql.close();
/*
        return result.recordset;
    } catch (err) {
        console.error('Error retrieving table columns:', err);
        sql.close();
    }
}*/



