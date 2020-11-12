var express = require('express');
var router = express.Router();
fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('../httpserv/logs.txt', 'utf8', (err, data) => {
    if (err) throw err;
    res.json({data: data});
  });

  /* fs.readdir('../', (err, files) => {
    files.forEach(file => {
      console.log(file);
    });
  }); */

  /* const { URL } = require('url');
  const fileUrl = new URL('obse://usr/src/app/logs.txt');

  fs.readFileSync(fileUrl, (err, data) => {
    if (err) throw err;
    console.log(data);
  }); */
});

module.exports = router;
