import test from 'ava';
import M from 'moment';
import { DateRange, extendMoment } from './moment-range.mjs';

const moment = extendMoment(M);
moment().utc();

const d1 = new Date(Date.UTC(2011, 2, 5));
const d2 = new Date(Date.UTC(2011, 5, 5));
const d3 = new Date(Date.UTC(2011, 4, 9));
const d4 = new Date(Date.UTC(1988, 0, 1));
const m1 = moment.utc('06-05-1996', 'MM-DD-YYYY');
const m2 = moment.utc('11-05-1996', 'MM-DD-YYYY');
const m3 = moment.utc('08-12-1996', 'MM-DD-YYYY');
const m4 = moment.utc('01-01-2012', 'MM-DD-YYYY');
const sStart = '1996-08-12T00:00:00.000Z';
const sEnd = '2012-01-01T00:00:00.000Z';

test('constructor should allow initialization with date string', function(t) {
  const dr = moment.range(sStart, sEnd);

  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with Date object', function(t) {
  const dr = moment.range(d1, d2);

  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with Moment object', function(t) {
  const dr = moment.range(m1, m2);

  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with an ISO 8601 Time Interval string', function(t) {
  const start = '2015-01-17T09:50:04+00:00';
  const end   = '2015-04-17T08:29:55+00:00';
  const dr = moment.range(start + '/' + end);

  t.true(moment.utc(start).isSame(dr.start));
  t.true(moment.utc(end).isSame(dr.end));
});

test('constructor should allow initialization from a specified interval', function(t) {
  const range1 = moment.rangeFromInterval('month', 5, m1);  // DateRange: m1 -> m1 + 5 months
  const value1 = moment.range(m1, m2);
  t.is(range1.toString(), value1.toString());

  const range2 = moment.rangeFromInterval('day', -1);   // DateRange: now - 1 day -> now
  const value2 = moment.range(moment().add(-1, 'd'), moment());
  t.is(range2.toString(), value2.toString());
});

test('constructor should allow moments to keep given time zone', function(t) {
  const start = '2015-01-17T09:50:04+03:00';
  const end   = '2015-04-17T08:29:55-04:00';
  const timeInterval = start + '/' + end;
  const range = moment.parseZoneRange(timeInterval);
  t.is(range.toString(), timeInterval);
});

test('constructor should allow initialization with an array', function(t) {
  const dr = moment.range([m1, m2]);

  t.true(m1.isSame(dr.start));
  t.true(m2.isSame(dr.end));
});

test('constructor should allow initialization with open-ended ranges', function(t) {
  let dr = moment.range(null, m1);
  t.true(moment.isMoment(dr.start));
  dr = moment.range(m1, false);
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with Jan 1 1970', function(t) {
  let dr = moment.range(0, 0);

  t.is(dr.start.utc().year(), 1970);
  t.is(dr.end.utc().year(), 1970);

  dr = moment.range(m1, false);

  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization without any arguments', function(t) {
  const dr = moment.range();

  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with undefined arguments', function(t) {
  const dr = moment.range(undefined, undefined);

  t.true(moment.isMoment(dr.start));
  t.true(moment.isMoment(dr.end));
});

test('constructor should allow initialization with moment interval strings', function(t) {
  const date = moment('2016-12-12T11:12:18.607');
  const quarterStart = moment('2016-10-01T00:00:00.000');
  const quarterEnd = moment('2016-12-31T23:59:59.999');
  const r = date.range('quarter');

  t.true(r.start.isSame(quarterStart));
  t.true(r.end.isSame(quarterEnd));
});


test('should correctly indicate when ranges aren\'t adjacent', function(t) {
  const a = moment.range(d4, d1);
  const b = moment.range(d3, d2);

  t.false(a.adjacent(b));
});

test('should correctly indicate when a.start == b.start', function(t) {
  const a = moment('2016-03-15');
  const b = moment('2016-03-29');
  const c = moment('2016-03-15');
  const d = moment('2016-03-30');

  const range1 = moment.range(a, b);
  const range2 = moment.range(c, d);

  t.false(range1.adjacent(range2));
});

test('should correctly indicate when a.start == b.end', function(t) {
  const a = moment('2016-03-15');
  const b = moment('2016-03-29');
  const c = moment('2016-03-10');
  const d = moment('2016-03-15');

  const range1 = moment.range(a, b);
  const range2 = moment.range(c, d);

  t.true(range1.adjacent(range2));
});

test('should correctly indicate when a.end == b.start', function(t) {
  const a = moment('2016-03-15');
  const b = moment('2016-03-20');
  const c = moment('2016-03-20');
  const d = moment('2016-03-25');

  const range1 = moment.range(a, b);
  const range2 = moment.range(c, d);

  t.true(range1.adjacent(range2));
});

test('should correctly indicate when a.end == b.end', function(t) {
  const a = moment('2016-03-15');
  const b = moment('2016-03-20');
  const c = moment('2016-03-10');
  const d = moment('2016-03-20');

  const range1 = moment.range(a, b);
  const range2 = moment.range(c, d);

  t.false(range1.adjacent(range2));
});

test('should deep clone range', function(t) {
  const dr1 = moment().range(sStart, sEnd);
  const dr2 = dr1.clone();

  dr2.start.add(2, 'days');
  t.not(dr1.start.toDate(), dr2.start.toDate());
});

test('should return a valid iterator', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);

  // Splat
  const i1 = dr1.by('day');
  t.is([...i1].length, 5);

  // For/of
  const i2 = dr1.by('day');
  let i = 0;
  for (const n of i2) {
    i++;
  }
  t.is(i, 5);

  // Array.from
  const i3 = dr1.by('day');
  const acc = Array.from(i3);
  t.is(acc.length, 5);
});

test('should iterate correctly by shorthand string', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.by('days');
  const acc = Array.from(i1);

  t.is(acc.length, 5);
  t.is(acc[0].utc().date(), 1);
  t.is(acc[1].utc().date(), 2);
  t.is(acc[2].utc().date(), 3);
  t.is(acc[3].utc().date(), 4);
  t.is(acc[4].utc().date(), 5);
});

test('should iterate correctly by year over a Date-constructed range when leap years are involved', function(t) {
  const d1 = new Date(Date.UTC(2011, 1, 1));
  const d2 = new Date(Date.UTC(2013, 1, 1));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.by('years');
  const acc = Array.from(i1).map(m => m.utc().year());

  t.deepEqual(acc, [2011, 2012, 2013]);
});

test('should iterate correctly by year over a moment()-constructed range when leap years are involved', function(t) {
  const dr1 = moment.range(moment('2011', 'YYYY'), moment('2013', 'YYYY'));

  const i1 = dr1.by('years');
  const acc = Array.from(i1).map(m => m.year());

  t.deepEqual(acc, [2011, 2012, 2013]);
});

test('should iterate correctly by month over a moment()-constructed range when leap years are involved', function(t) {
  const dr1 = moment.range(moment.utc('2012-01', 'YYYY-MM'), moment.utc('2012-03', 'YYYY-MM'));

  const i1 = dr1.by('months');
  const acc = Array.from(i1).map(m => m.utc().format('YYYY-MM'));

  t.deepEqual(acc, ['2012-01', '2012-02', '2012-03']);
});

test('should iterate correctly by month over a Date-contstructed range when leap years are involved', function(t) {
  const d1 = new Date(Date.UTC(2012, 0));
  const d2 = new Date(Date.UTC(2012, 2));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.by('months');
  const acc = Array.from(i1).map(m => m.utc().format('YYYY-MM'));

  t.deepEqual(acc, ['2012-01', '2012-02', '2012-03']);
});

test('should not include .end in the iteration if exclusive is set to true when iterating by string', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-04T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);
  const options = { exclusive: true };
  let acc;

  acc = Array.from(dr1.by('d', options)).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-02', '2014-04-03']);

  acc = Array.from(dr1.by('d')).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-02', '2014-04-03', '2014-04-04']);
});

test('should be exlusive when using by with minutes as well', function(t) {
  const d1 = moment('2014-01-01T00:00:00.000Z');
  const d2 = moment('2014-01-01T00:06:00.000Z');
  const dr = moment.range(d1, d2);
  const options = { exclusive: true };
  let acc;

  acc = Array.from(dr.by('m')).map(m => m.utc().format('mm'));
  t.deepEqual(acc, ['00', '01', '02', '03', '04', '05', '06']);

  acc = Array.from(dr.by('m', options)).map(m => m.utc().format('mm'));
  t.deepEqual(acc, ['00', '01', '02', '03', '04', '05']);
});

test('should correctly iterate by a given step', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-08T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);

  const acc = Array.from(dr1.by('days', { step: 2 })).map(m => m.utc().format('DD'));
  t.deepEqual(acc, ['02', '04', '06', '08']);
});

test('should correctly iterate by a given step when exclusive', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-08T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);

  const acc = Array.from(dr1.by('days', { exclusive: true, step: 2 })).map(m => m.utc().format('DD'));
  t.deepEqual(acc, ['02', '04', '06']);
});


test('#reverseBy should return a valid iterator', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);

  // Splat
  const i1 = dr1.reverseBy('day');
  t.is([...i1].length, 5);

  // For/of
  const i2 = dr1.reverseBy('day');
  let i = 0;
  for (const n of i2) {
    i++;
  }
  t.is(i, 5);

  // Array.from
  const i3 = dr1.reverseBy('day');
  const acc = Array.from(i3);
  t.is(acc.length, 5);
});

test('#reverseBy should iterate correctly by shorthand string', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.reverseBy('days');
  const acc = Array.from(i1);

  t.is(acc.length, 5);
  t.is(acc[0].utc().date(), 5);
  t.is(acc[1].utc().date(), 4);
  t.is(acc[2].utc().date(), 3);
  t.is(acc[3].utc().date(), 2);
  t.is(acc[4].utc().date(), 1);
});

test('#reverseBy should iterate correctly by year over a Date-constructed range when leap years are involved', function(t) {
  const d1 = new Date(Date.UTC(2011, 1, 1));
  const d2 = new Date(Date.UTC(2013, 1, 1));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.reverseBy('years');
  const acc = Array.from(i1).map(m => m.utc().year());

  t.deepEqual(acc, [2013, 2012, 2011]);
});

test('#reverseBy should iterate correctly by year over a moment()-constructed range when leap years are involved', function(t) {
  const dr1 = moment.range(moment('2011', 'YYYY'), moment('2013', 'YYYY'));

  const i1 = dr1.reverseBy('years');
  const acc = Array.from(i1).map(m => m.year());

  t.deepEqual(acc, [2013, 2012, 2011]);
});

test('#reverseBy should iterate correctly by month over a moment()-constructed range when leap years are involved', function(t) {
  const dr1 = moment.range(moment.utc('2012-01', 'YYYY-MM'), moment.utc('2012-03', 'YYYY-MM'));

  const i1 = dr1.reverseBy('months');
  const acc = Array.from(i1).map(m => m.utc().format('YYYY-MM'));

  t.deepEqual(acc, ['2012-03', '2012-02', '2012-01']);
});

test('#reverseBy should iterate correctly by month over a Date-contstructed range when leap years are involved', function(t) {
  const d1 = new Date(Date.UTC(2012, 0, 1));
  const d2 = new Date(Date.UTC(2012, 2, 28));
  const dr1 = moment.range(d1, d2);

  const i1 = dr1.reverseBy('months');
  const acc = Array.from(i1).map(m => m.utc().format('YYYY-MM'));

  t.deepEqual(acc, ['2012-03', '2012-02', '2012-01']);
});

test('#reverseBy should not include .start in the iteration if exclusive is set to true when iterating by string', function(t) {
  const my1 = moment.utc('2014-04-02T00:00:00');
  const my2 = moment.utc('2014-04-04T23:59:59');
  const dr1 = moment.range(my1, my2);
  const options = { exclusive: true };
  let acc;

  acc = Array.from(dr1.reverseBy('d', options)).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-04', '2014-04-03']);

  acc = Array.from(dr1.reverseBy('d')).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-04', '2014-04-03', '2014-04-02']);
});

test('#reverseBy should be exlusive when using by with minutes as well', function(t) {
  const d1 = moment('2014-01-01T00:00:00.000Z');
  const d2 = moment('2014-01-01T00:06:00.000Z');
  const dr = moment.range(d1, d2);
  const options = { exclusive: true };
  let acc;

  acc = Array.from(dr.reverseBy('m')).map(m => m.utc().format('mm'));
  t.deepEqual(acc, ['06', '05', '04', '03', '02', '01', '00']);

  acc = Array.from(dr.reverseBy('m', options)).map(m => m.utc().format('mm'));
  t.deepEqual(acc, ['06', '05', '04', '03', '02', '01']);
});

test('#reverseBy should correctly iterate by a given step', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-08T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);

  const acc = Array.from(dr1.reverseBy('days', { step: 2 })).map(m => m.utc().format('DD'));
  t.deepEqual(acc, ['08', '06', '04', '02']);
});

test('#reverseBy should correctly iterate by a given step when exclusive', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-08T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);

  const acc = Array.from(dr1.reverseBy('days', { exclusive: true, step: 2 })).map(m => m.utc().format('DD'));
  t.deepEqual(acc, ['08', '06', '04']);
});

test('should return a valid iterator', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const d3 = new Date(Date.UTC(2012, 2, 15));
  const d4 = new Date(Date.UTC(2012, 2, 16));
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.range(d3, d4);

  // Splat
  const i1 = dr1.byRange(dr2);
  t.is([...i1].length, 5);

  // For/of
  const i2 = dr1.byRange(dr2);
  let i = 0;
  for (const n of i2) {
    i++;
  }
  t.is(i, 5);

  // Array.from
  const i3 = dr1.byRange(dr2);
  const acc = Array.from(i3);
  t.is(acc.length, 5);
});

test('should iterate correctly by range', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.byRange(dr2));

  t.is(acc.length, 5);
  t.is(acc[0].utc().date(), 1);
  t.is(acc[1].utc().date(), 2);
  t.is(acc[2].utc().date(), 3);
  t.is(acc[3].utc().date(), 4);
  t.is(acc[4].utc().date(), 5);
});

test('should iterate correctly by duration', function(t) {
  const d1 = new Date(Date.UTC(2014, 9, 6, 0, 0));
  const d2 = new Date(Date.UTC(2014, 9, 6, 23, 59));
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.duration(15, 'minutes');

  const acc = Array.from(dr1.byRange(dr2));

  t.is(acc.length, 96);
  t.is(acc[0].minute(), 0);
  t.is(acc[95].minute(), 45);
});

test('should not include .end in the iteration if exclusive is set to true when iterating by range', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-04T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);
  const dr2 = moment.range(my1, moment('2014-04-03T00:00:00.000Z'));
  let acc;

  acc = Array.from(dr1.byRange(dr2)).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-02', '2014-04-03', '2014-04-04']);

  acc = Array.from(dr1.byRange(dr2, { exclusive: false })).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-02', '2014-04-03', '2014-04-04']);

  acc = Array.from(dr1.byRange(dr2, { exclusive: true })).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-02', '2014-04-03']);
});

test('should iterate correctly by a given step', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 2));
  const d2 = new Date(Date.UTC(2012, 2, 6));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.byRange(dr2, { step: 2 })).map(m => m.utc().format('DD'));

  t.deepEqual(acc, ['02', '04', '06']);
});

test('should iterate correctly by a given step when exclusive', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 2));
  const d2 = new Date(Date.UTC(2012, 2, 6));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.byRange(dr2, { exclusive: true, step: 2 })).map(m => m.utc().format('DD'));

  t.deepEqual(acc, ['02', '04']);
});

test('#reverseByRange should return a valid iterator', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const d3 = new Date(Date.UTC(2012, 2, 15));
  const d4 = new Date(Date.UTC(2012, 2, 16));
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.range(d3, d4);

  // Splat
  const i1 = dr1.reverseByRange(dr2);
  t.is([...i1].length, 5);

  // For/of
  const i2 = dr1.reverseByRange(dr2);
  let i = 0;
  for (const n of i2) {
    i++;
  }
  t.is(i, 5);

  // Array.from
  const i3 = dr1.reverseByRange(dr2);
  const acc = Array.from(i3);
  t.is(acc.length, 5);
});

test('#reverseByRange should iterate correctly by range', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 1));
  const d2 = new Date(Date.UTC(2012, 2, 5));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.reverseByRange(dr2));

  t.is(acc.length, 5);
  t.is(acc[0].utc().date(), 5);
  t.is(acc[1].utc().date(), 4);
  t.is(acc[2].utc().date(), 3);
  t.is(acc[3].utc().date(), 2);
  t.is(acc[4].utc().date(), 1);
});

test('#reverseByRange should iterate correctly by duration', function(t) {
  const d1 = new Date(Date.UTC(2014, 9, 6, 0, 1));
  const d2 = new Date(Date.UTC(2014, 9, 7, 0, 0));
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.duration(15, 'minutes');

  const acc = Array.from(dr1.reverseByRange(dr2));

  t.is(acc.length, 96);
  t.is(acc[0].minute(), 0);
  t.is(acc[95].minute(), 15);
});

test('#reverseByRange should not include .start in the iteration if exclusive is set to true when iterating by range', function(t) {
  const my1 = moment('2014-04-02T00:00:00.000Z');
  const my2 = moment('2014-04-04T00:00:00.000Z');
  const dr1 = moment.range(my1, my2);
  const dr2 = moment.range(my1, moment('2014-04-03T00:00:00.000Z'));
  let acc;

  acc = Array.from(dr1.reverseByRange(dr2)).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-04', '2014-04-03', '2014-04-02']);

  acc = Array.from(dr1.reverseByRange(dr2, { exclusive: false })).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-04', '2014-04-03', '2014-04-02']);

  acc = Array.from(dr1.reverseByRange(dr2, { exclusive: true })).map(m => m.utc().format('YYYY-MM-DD'));
  t.deepEqual(acc, ['2014-04-04', '2014-04-03']);
});

test('#reverseByRange should iterate correctly by a given step', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 2));
  const d2 = new Date(Date.UTC(2012, 2, 6));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.reverseByRange(dr2, { step: 2 })).map(m => m.utc().format('DD'));

  t.deepEqual(acc, ['06', '04', '02']);
});

test('#reverseByRange should iterate correctly by a given step when exclusive', function(t) {
  const d1 = new Date(Date.UTC(2012, 2, 2));
  const d2 = new Date(Date.UTC(2012, 2, 6));
  const dr1 = moment.range(d1, d2);
  const dr2 = 1000 * 60 * 60 * 24;

  const acc = Array.from(dr1.reverseByRange(dr2, { exclusive: true, step: 2 })).map(m => m.utc().format('DD'));

  t.deepEqual(acc, ['06', '04']);
});

test('should work with Date objects', function(t) {
  const dr = moment.range(d1, d2);

  t.true(dr.contains(d3));
  t.false(dr.contains(d4));
});

test('should work with Moment objects', function(t) {
  const dr = moment.range(m1, m2);

  t.true(dr.contains(m3));
  t.false(dr.contains(m4));
});

test('should work with DateRange objects', function(t) {
  const dr1 = moment.range(m1, m4);
  const dr2 = moment.range(m3, m2);

  t.true(dr1.contains(dr2));
  t.false(dr2.contains(dr1));
});

test('should be an inclusive comparison', function(t) {
  const dr1 = moment.range(m1, m4);

  t.true(dr1.contains(m1));
  t.true(dr1.contains(m4));
  t.true(dr1.contains(dr1));
});

test('should be exlusive when the exclusive param is set', function(t) {
  const dr1 = moment.range(m1, m2);

  t.false(dr1.contains(dr1, { exclusive: true }));
  t.true(dr1.contains(dr1, { exclusive: false }));
  t.true(dr1.contains(dr1));
  t.false(dr1.contains(m2, { exclusive: true }));
  t.true(dr1.contains(m2, { exclusive: false }));
  t.true(dr1.contains(m2));
});

test('should work with DateRange objects', function(t) {
  const dr1 = moment.range(m1, m2);
  const dr2 = moment.range(m3, m4);
  const dr3 = moment.range(m2, m4);
  const dr4 = moment.range(m1, m3);

  t.true(dr1.overlaps(dr2));
  t.false(dr1.overlaps(dr3));
  t.false(dr4.overlaps(dr3));
});

test('should indicate if ranges overlap if the options is passed in', function(t) {
  const a = moment('2016-03-15');
  const b = moment('2016-03-20');
  const c = moment('2016-03-20');
  const d = moment('2016-03-25');

  const range1 = moment.range(a, b);
  const range2 = moment.range(c, d);

  t.false(range1.overlaps(range2));
  t.false(range1.overlaps(range2, { adjacent: false }));
  t.true(range1.overlaps(range2, { adjacent: true }));
});

test('should not overlap zero-length ranges on the start date when `adjacent` is `false`', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const range1 = moment.range(a, a);
  const range2 = moment.range(a, b);

  t.false(range1.overlaps(range2));
  t.false(range1.overlaps(range2, { adjacent: false }));
});

test('should overlap zero-length ranges on the start date when `adjacent` is `true`', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const range1 = moment.range(a, a);
  const range2 = moment.range(a, b);

  t.true(range1.overlaps(range2, { adjacent: true }));
});

test('should not overlap zero-length ranges on the end date when `adjacent` is `false`', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const range1 = moment.range(a, b);
  const range2 = moment.range(b, b);

  t.false(range1.overlaps(range2));
  t.false(range1.overlaps(range2, { adjacent: false }));
});

test('should overlap zero-length ranges on the end date when `adjacent` is `true`', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const range1 = moment.range(a, b);
  const range2 = moment.range(b, b);

  t.true(range1.overlaps(range2, { adjacent: true }));
});

let d5 = new Date(Date.UTC(2011, 2, 2));
let d6 = new Date(Date.UTC(2011, 4, 4));
let d7 = new Date(Date.UTC(2011, 6, 6));
let d8 = new Date(Date.UTC(2011, 8, 8));

test('should work with [---{==]---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d8);

  t.true(dr1.intersect(dr2).isSame(moment.range(d6, d7)));
});

test('should work with {---[==}---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d8);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.intersect(dr2).isSame(moment.range(d6, d7)));
});

test('should work with [{===]---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.intersect(dr2).isSame(moment.range(d5, d6)));
});

test('should work with {[===}---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d5, d6);

  t.true(dr1.intersect(dr2).isSame(moment.range(d5, d6)));
});

test('should work with [---{===]} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d7);

  t.true(dr1.intersect(dr2).isSame(moment.range(d6, d7)));
});

test('should work with {---[===}] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.intersect(dr2).isSame(moment.range(d6, d7)));
});

test('should work with [---] {---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d7, d8);

  t.is(dr1.intersect(dr2), null);
});

test('should work with {---} [---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d7, d8);
  const dr2 = moment.range(d5, d6);

  t.is(dr1.intersect(dr2), null);
});

test('should work with [---]{---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d6, d7);

  t.is(dr1.intersect(dr2), null);
});

test('should work with {---}[---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d6);
  t.is(dr1.intersect(dr2), null);
});

test('should work with {--[===]--} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d8);

  t.true(dr1.intersect(dr2).isSame(dr1));
});

test('should work with [--{===}--] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d8);
  const dr2 = moment.range(d6, d7);

  t.true(dr1.intersect(dr2).isSame(dr2));
});

test('should work with [{===}] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d5, d6);

  t.true(dr1.intersect(dr2).isSame(dr2));
});

test('should work with [--{}--] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d6);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.intersect(dr2).isSame(dr1));
});

test('should return `null` with [---{}] non-overlaps where (a=[], b={})', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const dr1 = moment.range(a, b);
  const dr2 = moment.range(b, b);
  t.is(dr1.intersect(dr2), null);
});

test('should return `null` with [{}---] non-overlaps where (a=[], b={})', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const dr1 = moment.range(a, b);
  const dr2 = moment.range(a, a);

  t.is(dr1.intersect(dr2), null);
});

test('should return `null` with {---[]} non-overlaps where (a=[], b={})', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const dr1 = moment.range(b, b);
  const dr2 = moment.range(a, b);

  t.is(dr1.intersect(dr2), null);
});

test('should return `null` with {[]---} non-overlaps where (a=[], b={})', function(t) {
  const a = moment.utc('2018-02-01T03:00:00');
  const b = moment.utc('2018-02-01T13:00:00');
  const dr1 = moment.range(a, a);
  const dr2 = moment.range(a, b);

  t.is(dr1.intersect(dr2), null);
});

d5 = new Date(Date.UTC(2011, 2, 2));
d6 = new Date(Date.UTC(2011, 4, 4));
d7 = new Date(Date.UTC(2011, 6, 6));
d8 = new Date(Date.UTC(2011, 8, 8));

test('should add ranges with [---{==]---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d8);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d8)));
});

test('should add ranges with {---[==}---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d8);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d8)));
});

test('should add ranges with [{===]---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d7)));
});

test('should add ranges with {[===}---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d5, d6);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d7)));
});

test('should add ranges with [---{===]} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d7);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d7)));
});

test('should add ranges with {---[===}] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d7);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d7)));
});

test('should not add ranges with [---] {---} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d7, d8);

  t.is(dr1.add(dr2), null);
});

test('should not add ranges with {---} [---] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d7, d8);
  const dr2 = moment.range(d5, d6);

  t.is(dr1.add(dr2), null);
});

test('should not add ranges with [---]{---} overlaps where (a=[], b={}) by default or with adjacent: false', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d6, d7);

  t.is(dr1.add(dr2), null);
  t.is(dr1.add(dr2, { adjacent: false }), null);
});

test('should add ranges with [---]{---} overlaps where (a=[], b={}) with adjacent: true', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d6, d7);

  t.true(dr1.add(dr2, { adjacent: true }).isSame(moment.range(d5, d7)));
});

test('should not add ranges with {---}[---] overlaps where (a=[], b={}) by default or with adjacent: false', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d6);

  t.is(dr1.add(dr2), null);
  t.is(dr1.add(dr2, { adjacent: false }), null);
});

test('should add ranges with {---}[---] overlaps where (a=[], b={}) with adjacent: true', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d6);

  t.true(dr1.add(dr2, { adjacent: true }).isSame(moment.range(d5, d7)));
});

test('should add ranges {--[===]--} overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d8);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d8)));
});

test('should add ranges [--{===}--] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d8);
  const dr2 = moment.range(d6, d7);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d8)));
});

test('should add ranges [{===}] overlaps where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d5, d6);

  t.true(dr1.add(dr2).isSame(moment.range(d5, d6)));
  t.true(dr1.add(dr2, { adjacent: false }).isSame(moment.range(d5, d6)));
  t.true(dr1.add(dr2, { adjacent: true }).isSame(moment.range(d5, d6)));
});

d5 = new Date(Date.UTC(2011, 2, 2));
d6 = new Date(Date.UTC(2011, 4, 4));
d7 = new Date(Date.UTC(2011, 6, 6));
d8 = new Date(Date.UTC(2011, 8, 8));

test('should turn [--{==}--] into (--) (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d8);
  const dr2 = moment.range(d6, d7);
  const temp = dr1.subtract(dr2);

  t.true(temp[0].isEqual(moment.range(d5, d6)));
  t.true(temp[1].isEqual(moment.range(d7, d8)));
});

test('should turn {--[==]--} into () where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d7);
  const dr2 = moment.range(d5, d8);

  t.deepEqual(dr1.subtract(dr2), []);
});

test('should turn {[==]} into () where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d5, d6);

  t.deepEqual(dr1.subtract(dr2), []);
});

test('should turn [--{==]--} into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d8);
  const temp = dr1.subtract(dr2);

  t.is(temp.length, 1);
  t.true(temp[0].isEqual(moment.range(d5, d6)));
});

test('should turn [--{==]} into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d7);
  const dr2 = moment.range(d6, d7);
  const temp = dr1.subtract(dr2);

  t.is(temp.length, 1);
  t.true(temp[0].isEqual(moment.range(d5, d6)));
});

test('should turn {--[==}--] into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d8);
  const dr2 = moment.range(d5, d7);
  const temp = dr1.subtract(dr2);

  t.is(temp.length, 1);
  t.true(temp[0].isEqual(moment.range(d7, d8)));
});

test('should turn {[==}--] into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d6, d8);
  const dr2 = moment.range(d6, d7);
  const temp = dr1.subtract(dr2);

  t.is(temp.length, 1);
  t.true(temp[0].isEqual(moment.range(d7, d8)));
});

test('should turn [--] {--} into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d5, d6);
  const dr2 = moment.range(d7, d8);

  t.deepEqual(dr1.subtract(dr2), [dr1]);
});

test('should turn {--} [--] into (--) where (a=[], b={})', function(t) {
  const dr1 = moment.range(d7, d8);
  const dr2 = moment.range(d5, d6);

  t.deepEqual(dr1.subtract(dr2), [dr1]);
});

test('should turn [--{==}--] into (--) where (a=[], b={})', function(t) {
  const o = moment.range('2015-04-07T00:00:00+00:00/2015-04-08T00:00:00+00:00');
  const s = moment.range('2015-04-07T17:12:18+00:00/2015-04-07T17:12:18+00:00');
  const subtraction = o.subtract(s);
  const a = moment.range('2015-04-07T00:00:00+00:00/2015-04-07T17:12:18+00:00');
  const b = moment.range('2015-04-07T17:12:18+00:00/2015-04-08T00:00:00+00:00');

  t.true(subtraction[0].start.isSame(a.start));
  t.true(subtraction[0].end.isSame(a.end));
  t.true(subtraction[1].start.isSame(b.start));
  t.true(subtraction[1].end.isSame(b.end));
});

test('should true if the start and end of both DateRange objects equal', function(t) {
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.range(d1, d2);

  t.true(dr1.isSame(dr2));
});

test('should false if the starts differ between objects', function(t) {
  const dr1 = moment.range(d1, d3);
  const dr2 = moment.range(d2, d3);

  t.false(dr1.isSame(dr2));
});

test('should false if the ends differ between objects', function(t) {
  const dr1 = moment.range(d1, d2);
  const dr2 = moment.range(d1, d3);

  t.false(dr1.isSame(dr2));
});

test('should be a correctly formatted ISO8601 Time Interval', function(t) {
  const start = moment.utc('2015-01-17T09:50:04+00:00');
  const end   = moment.utc('2015-04-17T08:29:55+00:00');
  const dr = moment.range(start, end);

  t.is(dr.toString(), start.format() + '/' + end.format());
});

test('should be the value of the range in milliseconds', function(t) {
  const dr = moment.range(d1, d2);

  t.is(dr.valueOf(), d2.getTime() - d1.getTime());
});

test('should correctly coerce to a number', function(t) {
  const dr1 = moment.range(d4, d2);
  const dr2 = moment.range(d3, d2);

  t.true((dr1 > dr2));
});

test('should be a array like [dateObject, dateObject]', function(t) {
  const dr = moment.range(d1, d2);
  const drTodate = dr.toDate();

  t.is(drTodate.length, 2);
  t.is(drTodate[0].valueOf(), d1.valueOf());
  t.is(drTodate[1].valueOf(), d2.valueOf());
});

test('should use momentjs’ diff method', function(t) {
  const dr = moment.range(d1, d2);

  t.is(dr.diff('months'), 3);
  t.is(dr.diff('days'), 92);
  t.is(dr.diff(), 7948800000);
});

test('should optionally pass the rounded argument', function(t) {
  const d1 = new Date(Date.UTC(2011, 4, 1));
  const d2 = new Date(Date.UTC(2011, 4, 5, 12));
  const dr = moment.range(d1, d2);

  t.is(dr.diff('days', true), 4.5);
});

test('should use momentjs’ center method', function(t) {
  const d1 = new Date(Date.UTC(2011, 2, 5));
  const d2 = new Date(Date.UTC(2011, 3, 5));
  const dr = moment.range(d1, d2);

  t.is(dr.center().valueOf(), 1300622400000);
});
