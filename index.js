var K0 = 0.9996

var E = 0.00669438
var E2 = Math.pow(E, 2)
var E3 = Math.pow(E, 3)
var E_P2 = E / (1 - E)

var SQRT_E = Math.sqrt(1 - E)
var _E = (1 - SQRT_E) / (1 + SQRT_E)
var _E2 = Math.pow(_E, 2)
var _E3 = Math.pow(_E, 3)
var _E4 = Math.pow(_E, 4)
var _E5 = Math.pow(_E, 5)

var M1 = 1 - E / 4 - 3 * E2 / 64 - 5 * E3 / 256
var M2 = 3 * E / 8 + 3 * E2 / 32 + 45 * E3 / 1024
var M3 = 15 * E2 / 256 + 45 * E3 / 1024
var M4 = 35 * E3 / 3072

var P2 = 3 / 2 * _E - 27 / 32 * _E3 + 269 / 512 * _E5
var P3 = 21 / 16 * _E2 - 55 / 32 * _E4
var P4 = 151 / 96 * _E3 - 417 / 128 * _E5
var P5 = 1097 / 512 * _E4

var R = 6378137

var ZONE_LETTERS_CONVERSION = {
  '':  84, X:  72, W:  64, V:  56, U:  48, T:  40, S:  32,
  R :  24, Q:  16, P:   8, N:   0, M:  -8, L: -16, K: -24,
  J : -32, H: -40, G: -48, F: -56, E: -64, D: -72, C: -80
}
var ZONE_LETTERS = [
  '',  'X', 'W', 'V', 'U', 'T', 'S',
  'R', 'Q', 'P', 'N', 'M', 'L', 'K',
  'J', 'H', 'G', 'F', 'E', 'D', 'C'
]

module.exports.toLatLon = function (easting, northing, zoneNum, zoneLetter, northern) {
  zoneLetter = zoneLetter || ''
  northern = !!northern
  if (!zoneLetter && !northern) {
    throw new Error('either zoneLetter or northern needs to be set')
  } else if (zoneLetter && northern) {
    throw new Error('set either zoneLetter or northern, but not both')
  }

  if (easting < 100000 || 1000000 <= easting) {
    throw new RangeError('easting out of range (must be between 100.000 m and 999.999 m)')
  }
  if (northing < 0 || northing > 10000000) {
    throw new RangeError('northing out of range (must be between 0 m and 10.000.000 m)')
  }
  if (zoneNum < 1 || zoneNum > 60) {
    throw new RangeError('zone number out of range (must be between 1 and 60)')
  }
  if (zoneLetter) {
    zoneLetter = zoneLetter.toUpperCase();
    if (!ZONE_LETTERS_CONVERSION[zoneLetter]) {
      throw new RangeError('zone letter out of range (must be between C and X)')
    }
    northern = ZONE_LETTERS_CONVERSION[zoneLetter]
  }

  var x = easting - 500000
  var y = northing

  if (!northern) y -= 1e7

  var m = y / K0
  var mu = m / (R * M1)

  var pRad = mu +
             P2 * Math.sin(2 * mu) +
             P3 * Math.sin(4 * mu) +
             P4 * Math.sin(6 * mu) +
             P5 * Math.sin(8 * mu)

  var pSin = Math.sin(pRad)
  var pSin2 = Math.pow(pSin, 2)

  var pCos = Math.cos(pRad)

  var pTan = Math.tan(pRad)
  var pTan2 = Math.pow(pTan, 2)
  var pTan4 = Math.pow(pTan, 4)

  var epSin = 1 - E * pSin2
  var epSinSqrt = Math.sqrt(epSin)

  var n = R / epSinSqrt
  var r = (1 - E) / epSin

  var c = _E * pCos * pCos
  var c2 = c * c

  var d = x / (n * K0)
  var d2 = Math.pow(d, 2)
  var d3 = Math.pow(d, 3)
  var d4 = Math.pow(d, 4)
  var d5 = Math.pow(d, 5)
  var d6 = Math.pow(d, 6)

  var latitude = pRad - (pTan / r) *
                 (d2 / 2 -
                  d4 / 24 * (5 + 3 * pTan2 + 10 * c - 4 * c2 - 9 * E_P2)) +
                  d6 / 720 * (61 + 90 * pTan2 + 298 * c + 45 * pTan4 - 252 * E_P2 - 3 * c2)
  var longitude = (d -
                   d3 / 6 * (1 + 2 * pTan2 + c) +
                   d5 / 120 * (5 - 2 * c + 28 * pTan2 - 3 * c2 + 8 * E_P2 + 24 * pTan4)) / pCos

  return {
    latitude: toDegrees(latitude),
    longitude: toDegrees(longitude) + zoneNumberToCentralLongitude(zoneNum)
  }
}

module.exports.fromLatLon = function (latitude, longitude, zoneNum) {
  if (latitude > 84 || latitude < -80) {
    throw new RangeError('latitude out of range (must be between 80 deg S and 84 deg N)')
  }
  if (longitude > 180 || longitude < -180) {
    throw new RangeError('longitude out of range (must be between 180 deg W and 180 deg E)')
  }

  var latRad = toRadians(latitude)
  var latSin = Math.sin(latRad)
  var latCos = Math.cos(latRad)

  var latTan = Math.tan(latRad)
  var latTan2 = Math.pow(latTan, 2)
  var latTan4 = Math.pow(latTan, 4)

  if (zoneNum === undefined) {
    zoneNum = latLonToZoneNumber(latitude, longitude)
  }

  var zoneLetter = latitudeToZoneLetter(latitude)

  var lonRad = toRadians(longitude)
  var centralLon = zoneNumberToCentralLongitude(zoneNum)
  var centralLonRad = toRadians(centralLon)

  var n = R / Math.sqrt(1 - E * latSin * latSin)
  var c = E_P2 * latCos * latCos

  var a = latCos * (lonRad - centralLonRad)
  var a2 = Math.pow(a, 2)
  var a3 = Math.pow(a, 3)
  var a4 = Math.pow(a, 4)
  var a5 = Math.pow(a, 5)
  var a6 = Math.pow(a, 6)

  var m = R * (M1 * latRad -
               M2 * Math.sin(2 * latRad) +
               M3 * Math.sin(4 * latRad) -
               M4 * Math.sin(6 * latRad))
  var easting = K0 * n * (a +
                          a3 / 6 * (1 - latTan2 + c) +
                          a5 / 120 * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * E_P2)) + 500000
  var northing = K0 * (m + n * latTan * (a2 / 2 +
                                         a4 / 24 * (5 - latTan2 + 9 * c + 4 * c * c) +
                                         a6 / 720 * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * E_P2)))
  if (latitude < 0) northing += 1e7

  return { easting, northing, zoneNum, zoneLetter }
}

function latitudeToZoneLetter (latitude) {
  for (var i = 0; i < ZONE_LETTERS.length; i++) {
    var letter = ZONE_LETTERS[i];
    if (latitude >= ZONE_LETTERS_CONVERSION[letter]) return letter
  }
}

function latLonToZoneNumber (latitude, longitude) {
  if (56 <= latitude && latitude < 64 && 3 <= longitude && longitude < 12) return 32

  if (72 <= latitude && latitude <= 84 && longitude >= 0) {
    if (longitude <=  9) return 31
    if (longitude <= 21) return 33
    if (longitude <= 33) return 35
    if (longitude <= 42) return 37
  }

  return ((longitude + 180) / 6 | 0) + 1
}

function zoneNumberToCentralLongitude (zoneNum) {
  return (zoneNum - 1) * 6 - 180 + 3
}

function toDegrees (rad) {
  return rad / Math.PI * 180
}

function toRadians (deg) {
  return deg * Math.PI / 180
}
