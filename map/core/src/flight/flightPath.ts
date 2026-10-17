import { Size } from 'ytil'
import { MapViewport, MAX_ZOOM, project, unproject, worldSize } from '../geo'

/**
 * The viewports of a flight from one viewport to another, by progress from 0 to 1: zooming out, across and back in.
 * This is the curve of MapLibre's `flyTo` (van Wijk & Nunes, "Smooth and efficient zooming and panning").
 */
export function flightPath(from: MapViewport, to: MapViewport, size: Size): FlightPath {
  const [x0, y0] = project(from.center)
  let [x1, y1] = project(to.center)

  // Across the antimeridian, if that's shorter.
  if (x1 - x0 > 0.5) { x1 -= 1 }
  if (x0 - x1 > 0.5) { x1 += 1 }

  // In pixels at the starting zoom.
  const w0 = Math.max(size.width, size.height)
  const w1 = w0 / 2 ** (to.zoom - from.zoom)
  const u1 = Math.hypot(x1 - x0, y1 - y0) * worldSize(from.zoom)
  const curve = flightCurve(w0, w1, u1)

  return progress => {
    if (progress <= 0) { return from }
    if (progress >= 1) { return to }

    const s = progress * curve.length
    const travelled = curve.travelled(s)
    const center = unproject([wrap(x0 + (x1 - x0) * travelled), y0 + (y1 - y0) * travelled])
    const zoom = from.zoom - Math.log2(curve.width(s))
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, zoom)))
  }
}

export type FlightPath = (progress: number) => MapViewport

interface FlightCurve {
  length: number

  /** The fraction of the distance travelled at `s`. */
  travelled(s: number): number

  /** The width of the view at `s`, relative to the starting one. */
  width(s: number): number
}

function flightCurve(w0: number, w1: number, u1: number): FlightCurve {
  // Hardly moving: just zoom, or if not even that, ease linearly.
  if (u1 < EPSILON) {
    const length = Math.abs(Math.log(w1 / w0)) / RHO
    if (length < EPSILON) {
      return {length: 1, travelled: s => s, width: () => 1}
    }

    const sign = w1 < w0 ? -1 : 1
    return {length, travelled: s => s / length, width: s => Math.exp(sign * RHO * s)}
  }

  const r = (end: 0 | 1) => {
    const b = (w1 * w1 - w0 * w0 + (end ? -1 : 1) * RHO ** 4 * u1 * u1) / (2 * (end ? w1 : w0) * RHO ** 2 * u1)
    return Math.log(Math.sqrt(b * b + 1) - b)
  }

  const r0 = r(0)
  return {
    length:    (r(1) - r0) / RHO,
    travelled: s => w0 * ((Math.cosh(r0) * Math.tanh(r0 + RHO * s) - Math.sinh(r0)) / RHO ** 2) / u1,
    width:     s => Math.cosh(r0) / Math.cosh(r0 + RHO * s),
  }
}

function wrap(x: number) {
  return x - Math.floor(x)
}

// How far the flight zooms out: MapLibre's default, which feels most natural.
const RHO = 1.42
const EPSILON = 1e-6
