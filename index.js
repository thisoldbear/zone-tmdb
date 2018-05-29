require('dotenv').config();

const express = require('express');

const app = express();

app.set('view engine', 'ejs');

app.use("/public", express.static(__dirname + "/public"));

app.get('/', (req, res) => {
  res.render('pages/index', {
    data: {
      title: 'Zone TMDb Challenge',
      apiKey: process.env.API_KEY,
    },
  });
});

app.listen(process.env.PORT || 3000);
