'use strict';

const graphql = require('graphql-server-express');
const bodyParser = require('body-parser');
const { getSchema } = require('./schema/index');

const startSubscriptionServer = require('./subscriptions');

module.exports = function(app, options) {
  try{
    const models = app.models();
    const schema = getSchema(models, options);
  
    const graphiqlPath = options.graphiqlPath || '/graphiql';
    const path = options.path || '/graphql';
  
    app.use(path, bodyParser.json(), graphql.graphqlExpress(req => ({
      schema,
      context: {
        app,
        req
      }
    })));
  
    app.use(graphiqlPath, graphql.graphiqlExpress({
      endpointURL: path
    }));
  
    // Subscriptions
    startSubscriptionServer(app, schema, options);
  }
  catch(err){
    console.log('Error in starting graphql endpoint and subscription server. Error details: ',err);
  }
};
