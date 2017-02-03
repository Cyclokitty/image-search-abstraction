const express = require('express');
const MongodbClient = require('mongodb').MongodbClient;
const assert = require('assert');
const imageSearch = require('node-google-image-search');
const dotenv = require('dotenv').config()

const app = express();

app.get('/', (req, res) => {
  let results = imageSearch('grumpy cat', (results) => {
    let info = [];
    for (var i in results) {
      let url = results[i].link;
      let snippet = results[i].snippet;
      let thumbnail = results[i].image.thumbnailLink;
      let context = results[i].image.contextLink;
      let infoObj = {url, snippet, thumbnail, context};
      info.push(infoObj);
    }
      console.log(info);
    res.json(info);
  }, 0, 5);
});

// change "grumpy cat" to catch the query
// change 5 to become the offset


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up on ${port}`);
});
