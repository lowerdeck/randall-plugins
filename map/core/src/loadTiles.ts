import { WidgetHost } from '@randall/plugin-sdk'
import { TileCoord } from './geo'
import { tileKey } from './tileKey'
import { tilePath } from './tilePath'

/** Loads tiles a few at a time, as a flight can need hundreds. Tiles that fail to load are reported and left out. */
export async function loadTiles(style: string, tiles: TileCoord[], host: WidgetHost): Promise<Map<string, CanvasImageSource>> {
  const loaded = new Map<string, CanvasImageSource>()
  const queue = [...tiles]

  const worker = async () => {
    for (let tile = queue.shift(); tile != null; tile = queue.shift()) {
      try {
        loaded.set(tileKey(tile), await host.loadImage(tilePath(style, tile)))
      } catch (error) {
        host.reportError(error)
      }
    }
  }

  await Promise.all(Array.from({length: CONCURRENCY}, worker))
  return loaded
}

const CONCURRENCY = 16
