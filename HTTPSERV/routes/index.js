var express = require('express');
var router = express.Router();
fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('../httpserv/logs.txt', 'utf8', (err, data) => {
    if (err) throw err;
    res.json({data: data});
  });
});

module.exports = router;