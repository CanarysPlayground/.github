
const fs = require('fs');
const fetch = require('node-fetch');

const accessToken = process.argv[3];

const enterprise = process.argv[2];


const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-').replace(/\./g, '-');
const csvFilePath = `git_audit_log_report_${timestamp}.csv`;

async function gitauditlogevents (page){
    page = 1;
    const url = `https://api.github.com/enterprises/${enterprise}/audit-log?include=git&per_page=100&page=${page}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    if(response.headers.get('link').includes('first')){
        page = page + 1;
        const data2 = await gitauditlogevents(page);
        return data.concat(data2);
    }
    return data;
}

function storedataincsv(){
        
    gitauditlogevents().then(data => {
        const csvData = data.map(row => {
            return {
                "actor": row.actor,
                "event": row.action,
                "repository": row.repo,
                "IP": row.actor_ip
            }
        });
    
        //convert the data into csv format
        const csv = convertToCSV(csvData);
        //write the data into csv file
        fs.writeFileSync(csvFilePath, csv);
    });
}

function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
        return Object.values(it).toString()
    }).join('\n')
}

storedataincsv();
