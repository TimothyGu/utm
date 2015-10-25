# utm

Bidirectional UTM-WGS84 converter for JavaScript.

Translated directly from [Tobias Bieniek's implementation in Python](https://github.com/Turbo87/utm).

## Usage

```js
var utm = require('utm')
```

### `utm.toLatLon(easting, northing, zoneNum, zoneLetter, northern)`

Convert from UTM-WGS84 to latitude/longitude coordinates. One and only one of
`zoneLetter` and `northern` must be specified.

Returns `{ latitude, longitude }`.

### `utm.fromLatLon(latitude, longitude[, zoneNum])`

Convert from latitude/longitude coordinates to UTM-WGS84. `zoneNum` can be set
to force a specific zone number.

Returns `{ easting, northing, zoneNum, zoneLetter }`.
