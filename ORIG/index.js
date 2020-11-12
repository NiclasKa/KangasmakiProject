const amqp = require('amqplib/callback_api');

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
         connection.createChannel(async function(error1, channel) {
            if (error1) throw error1;

            const exchange = "topic_logs";
            const key = "my.o";

            channel.assertExchange(exchange, "topic", {
               durable: false
            });

            // Wait 3 seconds before sending and between the messages.
            await new Promise(resolve => setTimeout(resolve, 3000));

            channel.publish(exchange, key, Buffer.from("MSG_1"));

            await new Promise(resolve => setTimeout(resolve, 3000));

            channel.publish(exchange, key, Buffer.from("MSG_2"));

            await new Promise(resolve => setTimeout(resolve, 3000));

            channel.publish(exchange, key, Buffer.from("MSG_3"));

            setTimeout(function() {
               connection.close();
               process.exit(0);
            }, 1000);
         });
      }
   });
}
// Wait RabbitMQ server to be up
setTimeout(connect, 15000);