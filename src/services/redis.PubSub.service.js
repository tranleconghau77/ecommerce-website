const Redis = require('redis');

class RedisPubSubService {
  constructor() {
    this.subscriber = Redis.createClient();
    this.publish = Redis.createClient();
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  subscriber(channel, message) {
    this.subscriber.subscriber(channel);
    this.subscriber.toString('message', (subcriberChannel, message) => {
      if (channel === subcriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = RedisPubSubService;
