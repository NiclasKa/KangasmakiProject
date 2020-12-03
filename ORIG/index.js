const amqp = require('amqplib/callback_api');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

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

function connect() {
   amqp.connect('amqp://guest:guest@rabbitmq3:5672', function(error0, connection) {
      if (error0) {
         console.log("Error connecting, trying again in two seconds");
         tryAgain();
      } else {
         connection.createChannel(async function(error1, channel) {
            if (error1) throw error1;

            const exchange = "topic_logs";
            const key = "my.o";

            channel.assertExchange(exchange, "topic", {
               durable: false
            });

            let messageCount = 0;

            // Loop as long as the service is not shutdown
            while (true) {
               // Wait 3 seconds
               await new Promise(resolve => setTimeout(resolve, 3000));

               function sendMessage() {
                  channel.publish(exchange, key, Buffer.from(`MSG_${messageCount++}`));
               }

               let state = await axios.get('http://localhost:8081/state').then((res) => { return res.state }).catch(e => {console.log(e)});
               if (!state) state = "PAUSED";

               if (state === "RUNNING") sendMessage();
               else if (state === "PAUSED") {
                  console.log("Paused.");
               }
               else if (state === "INIT") {
                  channel.publish(exchange, key, Buffer.from(`INIT`));
               }
               else if (state === "SHUTDOWN") {
                  channel.publish(exchange, key, Buffer.from(`SHUTDOWN`));
                  setTimeout(function() {
                     connection.close();
                     process.exit(0);
                  }, 2000);
               }
            }
         });
      }
   });
}

// Wait RabbitMQ server to be up
setTimeout(connect, 26500);
