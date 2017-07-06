/* eslint-disable no-unused-expressions */

'use strict';

const server = require('../server/server');
const expect = require('chai').expect;
describe('model testing', () => {
  it.skip('should return models', (done) => {
    server.on('started', () => {
      expect(server).not.to.be.empty;
      done();
    });
  });
});
