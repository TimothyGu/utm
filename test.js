const testit = require('testit');
const {fromLatLon, toLatLon} = require('.');
const {expect} = require('chai');

// Arbitrary
const DELTA = 3e-5;

const testCases = [
  [
    'Aachen, Germany',
    [50.77535, 6.08389],
    [294409, 5628898, 32, 'U', true]
  ],
  [
    'New York, USA',
    [40.71435, -74.00597],
    [583960, 4507523, 18, 'T', true]
  ],
  [
    'Wellington, New Zealand',
    [-41.28646, 174.77624],
    [313784, 5427057, 60, 'G', false]
  ],
  [
    'Capetown, South Africa',
    [-33.92487, 18.42406],
    [261878, 6243186, 34, 'H', false]
  ],
  [
    'Mendoza, Argentina',
    [-32.89018, -68.84405],
    [514586, 6360877, 19, 'h', false]
  ],
  [
    'Fairbanks, Alaska, USA',
    [64.83778, -147.71639],
    [466013, 7190568, 6, 'W', true]
  ],
  [
    'Ben Nevis, Scotland, UK',
    [56.79680, -5.00601],
    [377486, 6296562, 30, 'V', true]
  ],
  [
    'Latitude 84',
    [84, -5.00601],
    [476594, 9328501, 30, 'X', true]
  ]
];

testit('normal conversions', () => {
  for (let [
    name,
    [lat, lon],
    [easting, northing, zoneNum, zoneLetter, northern]
  ] of testCases) {
    testit(`${name} fromLatLon`, () => {
      let actual = fromLatLon(lat, lon);
      expect(actual.easting).to.be.closeTo(easting, 0.5);
      expect(actual.northing).to.be.closeTo(northing, 0.5);
      expect(actual.zoneNum).to.equal(zoneNum);
      expect(actual.zoneLetter).to.equal(zoneLetter.toUpperCase());

      actual = fromLatLon(lat, lon, zoneNum);
      expect(actual.easting).to.be.closeTo(easting, 0.5);
      expect(actual.northing).to.be.closeTo(northing, 0.5);
      expect(actual.zoneNum).to.equal(zoneNum);
      expect(actual.zoneLetter).to.equal(zoneLetter.toUpperCase());
    });

    testit(`${name} toLatLon`, () => {
      let actual = toLatLon(easting, northing, zoneNum, zoneLetter);
      expect(actual.latitude).to.be.closeTo(lat, DELTA);
      expect(actual.longitude).to.be.closeTo(lon, DELTA);

      actual = toLatLon(easting, northing, zoneNum, undefined, northern);
      expect(actual.latitude).to.be.closeTo(lat, DELTA);
      expect(actual.longitude).to.be.closeTo(lon, DELTA);
    });
  }
});

const fromLatLonBadRange = [
  [-100, 0],
  [-80.1, 0],
  [84.1, 0],
  [100, 0],
  [0, -300],
  [0, -180.1],
  [0, 180.1],
  [0, 300],
  [-100, -300],
  [100, -300],
  [-100, 300],
  [100, 300]
];

const toLatLonBadRange = [
  // test easting range
  [0, 5000000, 32, 'U'],
  [99999, 5000000, 32, 'U'],
  [1000000, 5000000, 32, 'U'],
  [100000000000, 5000000, 32, 'U'],

  // test northing range
  [500000, -100000, 32, 'U'],
  [500000, -1, 32, 'U'],
  [500000, 10000001, 32, 'U'],
  [500000, 50000000, 32, 'U'],

  // test zone numbers
  [500000, 5000000, 0, 'U'],
  [500000, 5000000, 61, 'U'],
  [500000, 5000000, 1000, 'U'],

  // test zone letters
  [500000, 5000000, 32, 'A'],
  [500000, 5000000, 32, 'B'],
  [500000, 5000000, 32, 'I'],
  [500000, 5000000, 32, 'O'],
  [500000, 5000000, 32, 'Y'],
  [500000, 5000000, 32, 'Z']
];

testit('range check', () => {
  testit('fromLatLon bad range', () => {
    for (let args of fromLatLonBadRange) {
      expect(() => fromLatLon(...args)).to.throw(RangeError);
    }
  });

  testit('fromLatLon good range', () => {
    for (let i of range(-80, 84, 0.01)) {
      fromLatLon(i, 0);
    }
    for (let i of range(-180, 180, 0.01)) {
      fromLatLon(0, i);
    }
  });

  testit('toLatLon bad range', () => {
    for (let args of toLatLonBadRange) {
      expect(() => toLatLon(...args)).to.throw(RangeError);
    }
  });

  testit('toLatLon good range', () => {
    for (let i of range(100000, 999999, 1000)) {
      toLatLon(i, 5000000, 32, 'U');
    }
    for (let i of range(10, 10000000, 1000)) {
      toLatLon(500000, i, 32, 'U');
    }
    for (let i of range(1, 60)) {
      toLatLon(500000, 5000000, i, 'U');
    }
    for (let i of range('C'.codePointAt(0), 'X'.codePointAt(0) + 1)) {
      i = String.fromCodePoint(i);
      if (i !== 'I' && i !== 'O') {
        toLatLon(500000, 5000000, 32, i);
      }
    }
  });
});

const zone32 = [
  // inside
  [56, 3, 32, 'V'],
  [56, 6, 32, 'V'],
  [56, 9, 32, 'V'],
  [56, 11.999999, 32, 'V'],

  [60, 3, 32, 'V'],
  [60, 6, 32, 'V'],
  [60, 9, 32, 'V'],
  [60, 11.999999, 32, 'V'],

  [63.999999, 3, 32, 'V'],
  [63.999999, 6, 32, 'V'],
  [63.999999, 9, 32, 'V'],
  [63.999999, 11.999999, 32, 'V'],

  // left of
  [55.999999, 2.999999, 31, 'U'],
  [56, 2.999999, 31, 'V'],
  [60, 2.999999, 31, 'V'],
  [63.999999, 2.999999, 31, 'V'],
  [64, 2.999999, 31, 'W'],

  // right of
  [55.999999, 12, 33, 'U'],
  [56, 12, 33, 'V'],
  [60, 12, 33, 'V'],
  [63.999999, 12, 33, 'V'],
  [64, 12, 33, 'W'],

  // below
  [55.999999, 3, 31, 'U'],
  [55.999999, 6, 32, 'U'],
  [55.999999, 9, 32, 'U'],
  [55.999999, 11.999999, 32, 'U'],
  [55.999999, 12, 33, 'U'],

  // above
  [64, 3, 31, 'W'],
  [64, 6, 32, 'W'],
  [64, 9, 32, 'W'],
  [64, 11.999999, 32, 'W'],
  [64, 12, 33, 'W']
];

testit('zone 32', () => {
  for (let [lat, lon, zoneNum, zoneLetter] of zone32) {
    const results = fromLatLon(lat, lon);
    expect(results.zoneNum).to.equal(zoneNum);
    expect(results.zoneLetter).to.equal(zoneLetter.toUpperCase());
  }
});

function* range(start, stop, step = 1) {
  if (arguments.length === 1) {
    stop = start;
    start = 0;
  }

  if (step === 0) {
    throw new RangeError('step must not be zero');
  }

  let i = 0;
  let cur = start;
  while (i >= 0 && (step > 0 ? cur < stop : cur > stop)) {
    yield cur;
    cur += step;
  }
}
