const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const imageSearch = require('node-google-image-search');
const dotenv = require('dotenv').config()

const app = express();

app.use(express.static('public'));

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/imagesearch', (req, res) => {
  MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
    assert.equal(null, err);
    console.log('Connected to MongoDB server.');
    db.collection('absmachine').find().sort({when: -1}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
        let terms = [];
        docs.map((doc) => {
            topic = doc.topic,
            when = doc.when
          let search = {topic, when};
          terms.push(search);
        });
        res.json(terms);
    }, (err) => {
      console.log('Unable to fetch data', err);
    });
  });
});

app.get('/api/imagesearch/:topic', (req, res) => {
  let topic = req.params.topic;
  let offset = req.query.offset || 10;
  let when = new Date();
  let results = imageSearch(topic, (results) => {
    let info = [];
    results.map((result) => {
      let url = result.link;
        let snippet = result.snippet;
        let thumbnail = result.image.thumbnailLink;
        let context = result.image.contextLink;
        let infoObj = {url, snippet, thumbnail, context};
        info.push(infoObj);
    });
    res.json(info);
  }, 0, offset);
  console.log(topic, offset, when);
  MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
    assert.equal(null, err);
    console.log('Connected to MongoDB server.');
    db.collection('absmachine').insertOne({
      topic: topic,
      when: when
    }, (err, result) => {
      if (err) {
        res.send('Sorry, we can\'t handle your request right now.');
        console.log('Error when someone tried making an image search', err);
      }
      console.log(result);
    })
  })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server up on ${port}`);
});
