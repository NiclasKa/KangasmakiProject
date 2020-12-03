const app = require('../app') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)

// TODO: put state and get messages from httpserv and compare them with received messages

it('get messages', async done => {
   const messages = await request.get('/messages');

   // The status must be 200 and the messages should at least display the first message received by the api (orig -> obse -> httpserv -> api)
   expect(messages.status).toBe(200);
   expect(messages.body.data.includes("Topic my.o: MSG_0")).toBe(true);
   done();
 });

// The initial state should be RUNNING
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