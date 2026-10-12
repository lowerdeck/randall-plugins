import { z } from 'zod'
import { GeoBounds, GeoPoint } from 'templates'

export interface GeocodingResult {
  label:  string
  center: GeoPoint
  bounds: GeoBounds | null
}

export function parseGeocodingResults(body: unknown): GeocodingResult[] {
  const {features} = maptilerResponse.parse(body)
  return features.map(feature => ({
    label:  feature.place_name,
    center: {lng: feature.center[0], lat: feature.center[1]},
    bounds: feature.bbox == null ? null : {
      west:  feature.bbox[0],
      south: feature.bbox[1],
      east:  feature.bbox[2],
      north: feature.bbox[3],
    },
  }))
}

const maptilerResponse = z.object({
  features: z.array(z.object({
    place_name: z.string(),
    center:     z.tuple([z.number(), z.number()]),
    bbox:       z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  })),
})
