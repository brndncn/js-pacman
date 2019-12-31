// const path = require('path');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

app.use('/', express.static('dist'));
app.use('/', express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('dist/index.html');
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
