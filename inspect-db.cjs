const https = require('https');

https.get('https://firestore.googleapis.com/v1/projects/epi-serra-sul/databases/(default)/documents/products', (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const data = JSON.parse(body);
        if (data.documents && data.documents.length > 0) {
            console.log(JSON.stringify(data.documents.slice(0, 3), null, 2));
        } else {
            console.log('No documents found or structure unexpected:', body.substring(0, 500));
        }
    });
});
