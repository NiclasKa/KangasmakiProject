var express = require('express');
var router = express.Router();

let requests = [`TroubleShoot started at ${Date.now()}`];

/* GET troubleshooting info. */
router.get('/', function(req, res, next) {
  res.json({requests: requests});
});
/* PUT troubleshooting info. */
router.put('/', function(req, res, next) {
  requests.push(req.body.request);
  res.json({request: req.body});
});

module.exports = router;