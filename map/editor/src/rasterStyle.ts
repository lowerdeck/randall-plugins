import { StyleSpecification } from 'maplibre-gl'
import { MAX_TILE_ZOOM, TILE_SIZE, tilePath } from '@randall-plugins/map'
import { WidgetEditorHost } from '@randall/plugin-sdk-editor'

export function rasterStyle(style: string, host: WidgetEditorHost, paint: RasterPaint): StyleSpecification {
  return {
    version: 8,
    sources: {
      [TILES_SOURCE]: {
        type:        'raster',
        tiles:       [tileURLTemplate(style, host)],
        tileSize:    TILE_SIZE,
        maxzoom:     MAX_TILE_ZOOM,
        attribution: attribution,
      },
    },
    layers: [{
      id:     TILES_LAYER,
      type:   'raster',
      source: TILES_SOURCE,
      paint:  rasterPaint(paint),
    }],
  }
}

export function tileURLTemplate(style: string, host: WidgetEditorHost): string {
  return host.resourceURL(tilePath(style, {z: '{z}', x: '{x}', y: '{y}'}))
}

/** Shows the map like the widget draws it. */
export function rasterPaint(paint: RasterPaint) {
  return {
    'raster-saturation': paint.grayscale ? -1 : 0,
    'raster-opacity':    paint.opacity / 100,
  }
}

export interface RasterPaint {
  grayscale: boolean
  opacity:   number
}

export const TILES_SOURCE = 'tiles'
export const TILES_LAYER = 'tiles'

const attribution = '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
