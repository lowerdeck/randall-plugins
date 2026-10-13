import { WidgetSize } from '@randall/plugin-sdk'
import { GeoBounds } from './GeoBounds'
import { GeoPoint } from './GeoPoint'
import { project, unproject, worldSize } from './mercator'

// A view on the map: what is in the center and how far zoomed in. Combined with a pixel size, it fully determines
// what's visible.
export class MapViewport {

  constructor(
    public readonly center: GeoPoint,
    public readonly zoom: number,
  ) {}

  public static fitBounds(bounds: GeoBounds, size: WidgetSize, padding: number = 0): MapViewport {
    const [west, north] = project({lat: bounds.north, lng: bounds.west})
    let [east, south] = project({lat: bounds.south, lng: bounds.east})

    // Bounds crossing the antimeridian have east < west.
    if (east < west) { east += 1 }

    const width = Math.max(1, size.width - 2 * padding)
    const height = Math.max(1, size.height - 2 * padding)
    const spanX = Math.max(east - west, MIN_SPAN)
    const spanY = Math.max(south - north, MIN_SPAN)

    const zoom = Math.log2(Math.min(width / worldSize(0) / spanX, height / worldSize(0) / spanY))
    const center = unproject([wrap((west + east) / 2), (north + south) / 2])
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, zoom)))
  }

  // The pixel position of a geo point, relative to the top-left of a map of the given size.
  public pointToPixel(point: GeoPoint, size: WidgetSize): [number, number] {
    const [cx, cy] = project(this.center)
    let [px, py] = project(point)

    // Pick the copy of the world nearest to the center.
    if (px - cx > 0.5) { px -= 1 }
    if (cx - px > 0.5) { px += 1 }

    const scale = worldSize(this.zoom)
    return [
      size.width / 2 + (px - cx) * scale,
      size.height / 2 + (py - cy) * scale,
    ]
  }

}

function wrap(x: number) {
  return x - Math.floor(x)
}

export const MAX_ZOOM = 22
const MIN_SPAN = 1e-9
