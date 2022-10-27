declare module 'utm' {
    type ZONE_LETTERS =
        | 'C'
        | 'D'
        | 'E'
        | 'F'
        | 'G'
        | 'H'
        | 'J'
        | 'K'
        | 'L'
        | 'M'
        | 'N'
        | 'P'
        | 'Q'
        | 'R'
        | 'S'
        | 'T'
        | 'U'
        | 'V'
        | 'W'
        | 'X'

    export function toLatLon(
        easting: number,
        northing: number,
        zoneNum: number,
        zoneLetter?: string | undefined,
        northern?: boolean | undefined,
        strict?: boolean,
    ): { latitude: number; longitude: number }

    export function fromLatLon(
        latitude: number,
        longitude: number,
        zoneNum?: ZONE_LETTERS,
    ): {
        easting: number
        northing: number
        zoneNum: number
        zoneLetter: ZONE_LETTERS
    }
}
