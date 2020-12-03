var express = require('express');
var router = express.Router();
fs = require('fs');

const troubleshoot = async(data) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  await axios.put('http://troubleshoot:8082/', {data: data}).catch(e => {console.log(e)});
}

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile('../httpserv/logs.txt', 'utf8', (err, data) => {
    if (err) throw err;
    troubleshoot(`Data requested from HTTPSERV`);
    res.json({data: data});
  });
});

module.exports = router;