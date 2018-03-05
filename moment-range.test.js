import test from 'ava';
import M from 'moment';
import { DateRange, extendMoment } from './moment-range.mjs';

const moment = extendMoment(M);

// MOMENT
let dr = moment.range(new Date(Date.UTC(2011, 2, 5)), new Date(Date.UTC(2011, 5, 5)));
const m1 = moment('2011-04-15', 'YYYY-MM-DD');
const m2 = moment('2012-12-25', 'YYYY-MM-DD');
const mStart = moment('2011-03-05', 'YYYY-MM-DD');
const mEnd = moment('2011-06-05', 'YYYY-MM-DD');
const or = moment.range(null, '2011-05-05');
const or2 = moment.range('2011-03-05', null);

test('#range() should return a DateRange with start & end properties', function(t) {
  dr = moment.range(m1, m2);
  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('#range() should support string units like `year`, `month`, `week`, `day`, `minute`, `second`, etc...', function(t) {
  dr = m1.range('year');
  t.is(dr.start.valueOf(), moment(m1).startOf('year').valueOf());
  t.is(dr.end.valueOf(), moment(m1).endOf('year').valueOf());
});

test('#within() should determine if the current moment is within a given range', function(t) {
  t.true(m1.within(dr));
  t.false(m2.within(dr));
  t.true(m1.within(or));
  t.true(m1.within(or2));
  t.false(m2.within(or));
  t.true(m2.within(or2));
});

test('#within() should consider the edges to be within the range', function(t) {
  t.true(mStart.within(dr));
  t.true(mEnd.within(dr));
});

test('#isRange() should determine if the current object is range', function(t) {
  t.true(moment.isRange(dr));
  t.false(moment.isRange(m1));
});
