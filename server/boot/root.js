// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-relations
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = function(app) {
  const router = app.loopback.Router();
  router.get('/', (req, res, next) => {
    app.models.Customer.findOne({
      where: {
        name: 'Customer A'
      }
    }, (err, customer) => {
      if (err) {
        return next(err);
      }
      return res.render('index', {
        customer
      });
    });
  });
  router.get('/email', (req, res, next) => {
    app.models.Customer.findOne({
      where: {
        name: 'Larry Smith'
      }
    }, (err, customer) => {
      if (err) {
        return next(err);
      }
      return res.render('email', {
        customer
      });
    });
  });
  router.get('/address', (req, res, next) => {
    app.models.Customer.findOne({
      where: {
        name: 'John Smith'
      }
    }, (err, customer) => {
      if (err) {
        return next(err);
      }
      return res.render('address', {
        customer
      });
    });
  });
  router.get('/account', (req, res, next) => {
    app.models.Customer.findOne({
      where: {
        name: 'Mary Smith'
      }
    }, (err, customer) => {
      if (err) {
        return next(err);
      }
      return res.render('account', {
        customer
      });
    });
  });
  app.use(router);
};
