import { WidgetFrameRange } from '@randall/plugin-sdk'
import { Size } from 'ytil'
import { TileCoord, visibleTiles } from '../geo'
import { tileKey } from '../tileKey'
import { flightProgress } from './flightProgress'
import { FlightPath } from './flightPath'

/** All tiles that the frames of the flight show, as drawing can't wait for any. */
export function flightTiles(path: FlightPath, size: Size, frames: WidgetFrameRange): TileCoord[] {
  const tiles = new Map<string, TileCoord>()
  for (let frame = frames.from; frame <= frames.to; frame++) {
    for (const {tile} of visibleTiles(path(flightProgress(frame, frames)), size)) {
      tiles.set(tileKey(tile), tile)
    }
  }
  return [...tiles.values()]
}
