const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)

// TODO: put state and get messages from httpserv and compare them with received messages

it('get messages', async done => {
   const messages = await request.get('/messages');
   const messagesFromApi = await request.get('http://localhost:8080/');

   expect(messages.status).toBe(200);
   expect(messages.body.data).toBe(messagesFromApi.body.data);
   done();
 });

 it('get state', async done => {
   const paused = { state: 'PAUSED' }
   await request.post('/state').send(paused)
   const getState = await request.get('/state');
   expect(getState.status).toBe(200);
   expect(getState.body.state).toBe(paused)
   done();
 });

 it('get runlog', async done => {
   const runLog = await request.get('/run-log')
   expect(runLog.status).toBe(200);
   done();
 });