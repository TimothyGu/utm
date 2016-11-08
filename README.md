# utm

Bidirectional UTM-WGS84 converter for JavaScript.

[![npm version](https://img.shields.io/npm/v/utm.svg)](https://www.npmjs.org/package/utm)
[![Travis](https://img.shields.io/travis/TimothyGu/utm.svg)](https://travis-ci.org/TimothyGu/utm)

Translated directly from [Tobias Bieniek's implementation in Python](https://github.com/Turbo87/utm).

## Usage

```js
var utm = require('utm')
```

### `utm.toLatLon(easting, northing, zoneNum, zoneLetter, northern, strict = true)`

Convert from UTM-WGS84 to latitude/longitude coordinates. One and only one of
`zoneLetter` and `northern` must be specified. `strict` option specifies
whether easting and northing are checked against their respective ranges.

Returns `{ latitude, longitude }`.

### `utm.fromLatLon(latitude, longitude[, zoneNum])`

Convert from latitude/longitude coordinates to UTM-WGS84. `zoneNum` can be set
to force a specific zone number.

Returns `{ easting, northing, zoneNum, zoneLetter }`.
