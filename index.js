require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const Schema = mongoose.Schema;
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true });

// DB

const urlScheme = new Schema({
  shortUrl: String,
  url: String
});

var ShortUrl = mongoose.model('ShortUrl', urlScheme);

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

// Routes

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', function (req, res) {
  if(validURL(req.body.url)){
    ShortUrl.count((err, docsLenght) => {
      if(err) return done(err);
        new ShortUrl({url: req.body.url, shortUrl: Number(docsLenght)})
          .save((err, doc) => {
            if(err) return done(err);
            res.send({original_url: doc.url, short_url: doc.shortUrl});
          });
    } 
    );
  }else{
    res.send({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short', (req, res) => {
  ShortUrl.findOne({shortUrl: req.params.short},'url', function (err, doc) {
    if(doc)
      res.redirect(doc.url)
else
      res.send({error: 'invalid short URL'});
  });
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
