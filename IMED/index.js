const amqp = require('amqplib/callback_api');
const fs = require('fs');

let counter = 0;
let maxTries = 4;

function tryAgain() {
   if (counter < maxTries) {
      setTimeout(connect, 2000);
      counter++;
   }
}

function connect() {
   amqp.connect('amqp://guest:guest@rabbitmq3:5672', function(error0, connection) {
      if (error0) {
         console.log("Error connecting, trying again in 2 seconds");
         tryAgain();
      } else {
         connection.createChannel(function(error1, channel) {
            if (error1) {
                  throw error1;
            }
   
            const exchange = 'topic_logs';
   
            channel.assertExchange(exchange, 'topic', {
               durable: false
            });
   
            channel.assertQueue('', {
               exclusive: true
            }, function(error2, q) {
               if (error2) throw error2;
   
               channel.bindQueue(q.queue, exchange, "my.o");
         
               channel.consume(q.queue, async function(msg) {
                  console.log(`Got message ${msg.content.toString()}`)
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  channel.publish(exchange, "my.i", Buffer.from(`Got ${msg.content.toString()}`));
               }, {
                 noAck: true
               });
            });
         });
      }
   });
}
// Wait RabbitMQ server to be up
setTimeout(connect, 20000);