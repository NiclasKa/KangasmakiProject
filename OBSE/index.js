const amqp = require('amqplib/callback_api');
const fs = require('fs');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.listen(port);

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
troubleshoot(`OBSE started, waiting for connection to RabbitMQ server...`);

function connect() {
   amqp.connect('amqp://guest:guest@rabbitmq3:5672', function(error0, connection) {
      if (error0) {
         console.log("Error connecting, trying again in 2 seconds");
         troubleshoot("IMED: Error connecting to RabbitMQ, trying again in two seconds");
         tryAgain();
      } else {
         connection.createChannel(function(error1, channel) {
            if (error1) {
                  throw error1;
            }

            troubleshoot("OBSE connected to RabbitMQ server!");
   
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
         
               channel.consume(q.queue, async function(msg) {
                  console.log(`Got message ${msg.content.toString()}`)
                  const date = new Date().toISOString();
                  
                  if (msg.content.toString() === "INIT") {
                     // Clear the log and set state to RUNNING
                     fs.writeFile('../obse/logs.txt', "", function (err) {
                        if (err) throw err;
                     });
                     await axios.put('http://api:8081/state', {state: "RUNNING"}).catch(e => {console.log(e)});;
                  } else if (msg.content.toString() === "SHUTDOWN") {
                     // Shutdown
                     setTimeout(function() {
                        connection.close();
                        process.exit(0);
                     }, 1000);
                  } else {
                     const write = `${date} Topic ${msg.fields.routingKey}: ${msg.content.toString()} `;
                     fs.appendFile('../obse/logs.txt', write, function (err) {
                        if (err) throw err;
                     });
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
