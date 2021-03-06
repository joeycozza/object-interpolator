'use strict'
const assert       = require('chai').assert;
const mocha        = require('mocha');
const moment       = require('moment');
const _            = require('lodash');
const interpolator = require('../');

describe('Basic usage', () => {

  it("should parse {{date('YYYY-MM-DD')}}", () => {

    var obj = {
      a: 'test',
      b: 'test',
      c: "{{date('YYYY-MM-DD')}}",
      d: "{{date('-1days', 'YYYY-MM-DD')}}",
      e: "{{date('YYYY-MM-DD')}}",
      f: "{{date('-30days', 'YYYY-MM-DD')}}"
    };

    var testObj = {
      a: 'test',
      b: 'test',
      c: moment().format('YYYY-MM-DD'),
      d: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      e: moment().format('YYYY-MM-DD'),
      f: moment().subtract(30, 'days').format('YYYY-MM-DD')
    };

    var newObj = interpolator.interpolateSpecialValues(obj);

    assert(_.isEqual(newObj, testObj));

  });

  it("should parse {{date('-/+10{interval}', 'YYYY-MM-DD HH:MM:SS')}}", () => {

    //'seconds' could make the test fail

    _.each(['minutes', 'hours', 'days', 'weeks', 'months', 'years'], interval => {
      _.each(['-', '+'], direction => {

        var obj = {
          a: 'test',
          b: 'test',
          c: `{{date('${direction}1${interval}', 'YYYY-MM-DD HH:MM')}}`
        };

        var testObj = {
          a: 'test',
          b: 'test',
          c: moment()[(direction == '-' ? 'subtract' : 'add')](1, interval).format('YYYY-MM-DD HH:MM')
        };

        var newObj = interpolator.interpolateSpecialValues(obj);

        assert(_.isEqual(newObj, testObj));

      });
    });


  });

  it("should parse {{date('YYYY-MM-DD')}}", () => {
    var obj     = "Hello world, {)_0 {{date('-30days', 'YYYY-MM-DD')}} +-=}";
    var testObj = "Hello world, {)_0 " + moment().subtract(30, 'days').format('YYYY-MM-DD') + " +-=}";
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('start of year', 'YYYY-MM-DD')}}", () => {
    var obj     = "{{date('start of year', 'YYYY-MM-DD')}}";
    var testObj = moment().startOf('year').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('start of week', 'YYYY-MM-DD')}}", () => {
    var obj     = "{{date('start of week', 'YYYY-MM-DD')}}";
    var testObj = moment().startOf('week').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('start of month', 'YYYY-MM-DD')}}", () => {
    var obj     = "{{date('start of month', 'YYYY-MM-DD')}}";
    var testObj = moment().startOf('month').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse two dates in the same string 'once' {{date('start of year', 'YYYY-MM-DD')}} -- {{date('start of month', 'YYYY-MM-DD')}}",
    () => {
      var obj     = "{{date('start of year', 'YYYY-MM-DD')}} -- {{date('start of month', 'YYYY-MM-DD')}}";
      var testObj = moment().startOf('year').format('YYYY-MM-DD') + ' -- ' + moment().startOf('month').format('YYYY-MM-DD');
      var newObj  = interpolator.interpolateSpecialValues(obj);
      assert(_.isEqual(newObj, testObj));
    });

  it("should parse {{date('-1years', 'start of year', 'YYYY-MM-DD')}}", () => {
    var obj     = "{{date('-1years', 'start of year', 'YYYY-MM-DD')}}";
    var testObj = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('-1years', '-1years', 'start of year', 'YYYY-MM-DD')}}", () => {
    var obj     = "{{date('-1years', '-1years', 'start of year', 'YYYY-MM-DD')}}";
    var testObj = moment().subtract(2, 'year').startOf('year').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('start of year', '-1years')}}", () => {
    var obj     = "{{date('start of year', '-1years')}}";
    var testObj = moment().startOf('year').subtract(1, 'year').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('end of year')}}", () => {
    var obj     = "{{date('end of year')}}";
    var testObj = moment().endOf('year').format('YYYY-MM-DD');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should parse {{date('-1years', 'end of year', 'YYYY-MM-DD HH:mm')}}", () => {
    var obj     = "{{date('-1years', 'end of year', 'YYYY-MM-DD HH:mm')}}";
    var testObj = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD HH:mm');
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, testObj));
  });

  it("should return a regular string without changing it", () => {
    var obj     = "2015-01-01";
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, obj));
  });

  it("should return an object without changing it if no interpolations are given", () => {
    var obj     = {a:"2015-01-01", b:13, c:true, d:false};
    var newObj  = interpolator.interpolateSpecialValues(obj);
    assert(_.isEqual(newObj, obj));
  });

  it("should return an error with bad input 1", () => {
    var obj     = "{{date('year,-1,GETDATE()')}}";
    try {
      var newObj = interpolator.interpolateSpecialValues(obj);
    } catch (err) {

      assert(_.isError(err));
      return;
    }
    assert(false, 'we should not get here');

  });

  it("should not throw and error if you pass it something that it can't work with. It should return what you gave it.", () => {
    var obj      = null;
    try {
      var newObj = interpolator.interpolateSpecialValues(obj);
      assert(_.isNull(newObj));
    } catch (err) {
      assert(false);
      return;
    }
  });

});
