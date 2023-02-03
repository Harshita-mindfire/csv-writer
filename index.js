const express = require('express');
const axios = require('axios');
const csvWriter = require('csv-write-stream');
const fs = require('fs');
const { response } = require('express');

const app = express();

app.get("/", async (req, res) => {
    res.send("hello world")
})

app.get('/api', async (req, res) => {
    console.log("fetching response for first api")
    const firstResponse = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const dataArray = firstResponse.data;
    console.log(`response received for ${dataArray.length} items`)
    const finalDataArray = [];
    for (let i = 0; i < dataArray.length; i++) {
        console.log("fetching response for second api")
        const secondResponse = await axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${dataArray[i].id}`);
        //I only need the first data from array returned in second response
        // Note: same properties will get override
        const combinedData = { ...dataArray[i], ...secondResponse.data[0] };
        finalDataArray.push(combinedData);
        console.log("response received for second api. Final Data to write in csv", finalDataArray)

    }

    const writer = csvWriter();
    writer.pipe(fs.createWriteStream('file.csv'));
    finalDataArray.forEach(data => {
        writer.write(data);
    });
    writer.end();

    res.send('CSV file has been created successfully');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
