var express = require('express');
var router = express.Router();
const axios = require('axios');

let currentState = { state: 'RUNNING' }
const dateAtStart = new Date()
let run_log = [`${dateAtStart}: RUNNING`]

const troubleshoot = async(data) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  await axios.put('http://troubleshoot:8082/', {data: data}).catch(e => {console.log(e)});
}

/* GET home page. */
router.get('/messages', (req, res, next) => {
  axios.get('http://httpserv:8080/')
  .then(function (response) {
    troubleshoot("Messages requested from API");
    res.json(response.data);
  }).catch(e => {throw e})
});

router.get('/state', (req, res, next) => {
  troubleshoot("state requested from API");
  res.json(currentState)
})

router.put('/state', (req, res, next) => {
  const givenState = req.body.state;

  troubleshoot("New state request to API");

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