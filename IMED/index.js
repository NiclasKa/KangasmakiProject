const amqp = require('amqplib/callback_api');
const fs = require('fs');

let counter = 0;
let maxTries = 6;

function tryAgain() {
   if (counter < maxTries) {
      setTimeout(connect, 2000);
      counter++;
   }
}

const troubleshoot = async(data) => {
   await new Promise(resolve => setTimeout(resolve, 1000));
   await axios.put('http://troubleshoot:8082/', {data: data}).catch(e => {console.log(e)});
}
troubleshoot(`IMED started, waiting for connection to RabbitMQ server...`);

function connect() {
   amqp.connect('amqp://guest:guest@rabbitmq3:5672', function(error0, connection) {
      if (error0) {
         console.log("Error connecting, trying again in two seconds");
         troubleshoot("IMED: Error connecting to RabbitMQ, trying again in two seconds");
         tryAgain();
      } else {
         connection.createChannel(function(error1, channel) {
            if (error1) {
                  throw error1;
            }

            troubleshoot("IMED connected to RabbitMQ server!");
   
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
                  console.log(`Got message ${msg.content.toString()}`);
                  await new Promise(resolve => setTimeout(resolve, 1000));

                  if (msg.content.toString() === "INIT") {
                     // Pass the message forward, since the log is saved in OBSERVER
                     channel.publish(exchange, "my.i", Buffer.from("INIT"));
                  } else if (msg.content.toString() === "SHUTDOWN") {
                     // Pass the message and shutdown
                     channel.publish(exchange, "my.i", Buffer.from("SHUTDOWN"));
                     setTimeout(function() {
                        connection.close();
                        process.exit(0);
                     }, 2000);
                  } else {
                     channel.publish(exchange, "my.i", Buffer.from(`Got ${msg.content.toString()}`));
                  }
               }, {
                 noAck: true
               });
            });
         });
      }
   });
}

// Wait RabbitMQ server to be up
setTimeout(connect, 22000);
