var express = require('express');
var router = express.Router();
const axios = require('axios');

const httpservUrl = 'Localhost:8080/';

/* GET home page. */
router.get('/messages', (req, res, next) => {
  axios.get('http://localhost:8080/')
  .then(function (response) {
    res.json(response.data);
  }).catch(e => {throw e})
});

module.exports = router;