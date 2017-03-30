/**
 * Created by jason on 5/23/16.
 */

'use strict';

const assert = require('chai').assert;
const should = require('chai').should();
before(function() {
  console.log('before every test in every file');
});
describe('Array', function() {
  beforeEach(function (done) {
    console.log('starting test...');
    done();
  });
  describe('#indexOf()', function () {
    afterEach(function () {
      console.log('done testing...');
    });
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
describe('Demo', function () {
  it('should be a string', function () {
    const foo = 'bar';
    foo.should.be.a('string');
  });
  it('should be a number', function () {
    const foo = 'bar';
    foo.should.not.be.a('number');
  });
});