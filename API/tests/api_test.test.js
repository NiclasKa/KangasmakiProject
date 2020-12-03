const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const axios = require('axios');

// TODO: put state and get messages from httpserv and compare them with received messages

it('get messages', async done => {
   const messages = await request.get('/messages');
   const messagesFromApi = await axios.get('http://httpserv:8080/')

   expect(messages.status).toBe(200);
   expect(messages.body.data).toBe(messagesFromApi.data.data);
   done();
 });

 it('get state', async done => {
   const getState = await request.get('/state');
   expect(getState.status).toBe(200);
   expect(getState.body.state).toBe('RUNNING')
   done();
 });

 it('put state', async done => {
  const paused = { state: 'PAUSED' }
  await request.put('/state').send(paused)
  const getState = await request.get('/state');
  expect(getState.status).toBe(200);
  expect(getState.body.state).toBe('PAUSED')
  done();
});

 it('get runlog', async done => {
   const runLog = await request.get('/run-log')
   expect(runLog.status).toBe(200);
   done();
 });