var express = require('express');
var router = express.Router();

const date = new Date();
let requests = [`TroubleShoot started at ${date.toISOString().split('T')[0]}`];

/* GET troubleshooting info. */
router.get('/', function(req, res, next) {
  res.json({requests: requests});
});
/* PUT troubleshooting info. */
router.put('/', function(req, res, next) {
  console.log(req.body);
  requests.push(req.body);
  res.json({request: req.body});
});

module.exports = router;