import { z } from 'zod'

export interface GeoPoint {
  lat: number
  lng: number
}

export namespace GeoPoint {

  export function is(arg: unknown): arg is GeoPoint {
    return schema.safeParse(arg).success
  }

  // Parses "lat, lng" strings, as typically copied from Google Maps.
  export function parse(text: string): GeoPoint | null {
    const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
    if (match == null) { return null }

    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) { return null }
    return {lat, lng}
  }

  export const schema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })

  /** Also takes "lat, lng" strings, which is what data usually has. */
  export const paramSchema: z.ZodType<GeoPoint> = z.union([
    schema,
    z.string().transform((value, ctx) => {
      const point = parse(value)
      if (point == null) {
        ctx.addIssue({code: 'custom', message: 'Invalid location, expected "lat, lng"'})
        return z.NEVER
      }
      return point
    }),
  ])

}
