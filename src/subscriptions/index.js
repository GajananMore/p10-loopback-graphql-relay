const PubSub = require('./pubsub');
const SubscriptionManager = require('./subscriptionManager');
const RedisPubSub = require('./redis-pubsub').RedisPubSub;
const SubscriptionServer = require('./server');

// start a subscription (for testing)
// function test(subscriptionManager) {
//   subscriptionManager.subscribe({
//     query: `
//       subscription AuthorSubscription(
//         $options: JSON
//         $create: Boolean
//         $update: Boolean
//         $remove: Boolean
//       ) {
//         Author(input: {
//           options: $options
//           create: $create
//           update: $update
//           remove: $remove
//           clientSubscriptionId: 85
//         }) {
//           author {
//             id first_name last_name
//           }
//           where type target clientSubscriptionId
//         }
//       }
//     `,
//     variables: {
//       options: {},
//       create: true,
//       update: true,
//       remove: true,
//     },
//     context: {},
//     callback: (err, data) => {
//       console.log('subs output', data);
//     },
//   }).catch(err => console.log(`An error occured: ${err}`));
// }

module.exports = function startSubscriptionServer(app, schema, options) {
  const models = app.models();
  const pubsub = (process.env.NODE_ENV.toLocaleLowerCase() === 'production')?
   new RedisPubSub({  host: options.redis.host,
    port: options.redis.port
  }):new PubSub();
  const subscriptionManager = SubscriptionManager(models, schema, pubsub);
  SubscriptionServer(app, subscriptionManager, options);

  // test(subscriptionManager);
};
