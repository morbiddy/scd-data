

module.exports = {
    getForfaitsAll: (year) => {        
        return query = `
        SELECT 
            h.garantie, 
            h.merk,
            h.type, 
            hl.produkt, 
            hl.eenheidsprijs, 
            hl.aantal, 
            h.hersteld_op, 
            h.jaar, 
            h.nummer,
            h.technieker
        FROM 
            herstellingen h
        INNER JOIN 
            herstellingenlijn hl 
            ON h.nummer = hl.nummer 
            AND h.journaal = hl.journaal 
            AND h.jaar = hl.jaar
        INNER JOIN 
            produkt p 
            ON hl.produkt = p.prodkode
        WHERE 
            Year([hersteld_op]) = ${year}
            AND (p.labour <> 0 OR p.prodkode IN ('DIV', 'DOA'))
        ORDER BY 
            hersteld_op;
    `;},
    getForfaitsMerken: (year) => `
        SELECT 
            h.garantie, 
            h.merk, 
            hl.produkt, 
            hl.eenheidsprijs, 
            hl.aantal, 
            h.hersteld_op, 
            h.jaar, 
            h.nummer,
            h.technieker
        FROM 
            herstellingen h
        INNER JOIN 
            herstellingenlijn hl 
            ON h.nummer = hl.nummer 
            AND h.journaal = hl.journaal 
            AND h.jaar = hl.jaar
        INNER JOIN 
            produkt p 
            ON hl.produkt = p.prodkode
        WHERE 
            (Year([hersteld_op]) = ${year}
            AND (p.labour <> 0 OR p.prodkode IN ('DIV', 'DOA'))
        ORDER BY 
            h.merk ASC, h.hersteld_op ASC;
        `,
    generateDateCondition: (startDate, endDate) => {
        if (startDate && endDate) {
            return `AND h.hersteld_op BETWEEN '${startDate}' AND '${endDate}'`;
        } else if (startDate) {
            return `AND h.hersteld_op >= '${startDate}'`;
        } else if (endDate) {
            return `AND h.hersteld_op <= '${endDate}'`;
        } else {
            return ''; // No date condition
        }
    },
    generateDateCondition: (day, month, year) => {
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
        return date;
    },
    getForfaitsTechnieker: (technieker, dateCondition) => {
        return query = `
        SELECT 
            h.garantie, 
            h.merk, 
            hl.produkt, 
            hl.eenheidsprijs, 
            hl.aantal, 
            h.hersteld_op, 
            h.jaar, 
            h.nummer,
            CONCAT(h.jaar, h.nummer) AS herstelnr 
        FROM 
            herstellingen h
        INNER JOIN 
            herstellingenlijn hl 
            ON h.nummer = hl.nummer 
            AND h.journaal = hl.journaal 
            AND h.jaar = hl.jaar
        INNER JOIN 
            produkt p 
            ON hl.produkt = p.prodkode
        WHERE 
            h.technieker = '${technieker}' 
            ${dateCondition} 
            AND (p.labour <> 0 OR p.prodkode IN ('DIV', 'DOA'))
        ORDER BY 
            h.hersteld_op;
        `;
    }    
}