var express = require('express');
var router = express.Router();
const axios = require('axios');

let currentState = { state: 'RUNNING' }
const dateAtStart = new Date()
let run_log = [`${dateAtStart}: RUNNING`]

/* GET home page. */
router.get('/messages', (req, res, next) => {
  axios.get('http://httpserv:8080/')
  .then(function (response) {
    res.json(response.data);
  }).catch(e => {throw e})
});

router.get('/state', (req, res, next) => {
  res.json(currentState)
})

router.put('/state', (req, res, next) => {

  const givenState = req.body.state

  if (givenState === currentState.state) {
    return;
  }

  if (givenState === 'PAUSED' || givenState === 'RUNNING' || givenState === 'INIT' || givenState === 'SHUTDOWN') {
    currentState.state = givenState
    const date = new Date()
    const log = [`${date}: ${givenState}`] 
    run_log = run_log.concat(log)
    res.json(currentState)
    if(currentState.state === 'SHUTDOWN') {
      setTimeout(function() {
        process.exit(0);
     }, 2000);
    }
    return;
  }
  res.status(400).json('Invalid state value')
})

router.get('/run-log', (req, res) => {
  res.json(run_log)
})

module.exports = router;