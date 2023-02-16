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
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const firstResponse = response.data;
    console.log(`first response received for ${firstResponse.length} items`)
    const finalDataArray = [];
    console.log("fetching response for second api")
    const promisesArray = firstResponse.map(data => {
        return axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${data.id}`)
    })
    const results = await Promise.all(promisesArray);
    console.log(`second response received for ${results.length} items`)

    results.forEach((entry, index) => {
        finalDataArray.push({ ...firstResponse[index], ...entry.data[0] })
    })
    console.log(`writing in csv file for ${finalDataArray.length} items`)
    const writer = csvWriter();
    writer.pipe(fs.createWriteStream('file.csv'));
    finalDataArray.forEach(data => {
        writer.write(data);
    });
    writer.end();

    res.send('CSV file has been created successfully');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000 here');
});
