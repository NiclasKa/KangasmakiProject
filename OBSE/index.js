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
   
            fs.writeFile('../obse/logs.txt', '', function (err) {
               if (err) throw err;
            }); 
   
            const exchange = 'topic_logs';
   
            channel.assertExchange(exchange, 'topic', {
               durable: false
            });
   
            channel.assertQueue('', {
               exclusive: true
            }, function(error2, q) {
               if (error2) throw error2;
   
               channel.bindQueue(q.queue, exchange, "my.i");
               channel.bindQueue(q.queue, exchange, "my.o");
         
               channel.consume(q.queue, function(msg) {
                  console.log(`Got message ${msg.content.toString()}`)
                  const date = new Date().toISOString();
                  const write = `${date} Topic ${msg.fields.routingKey}: ${msg.content.toString()} `;
                  fs.appendFile('../obse/logs.txt', write, function (err) {
                     if (err) throw err;
                  }); 
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