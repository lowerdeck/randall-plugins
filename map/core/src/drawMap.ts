import { WidgetDrawContext } from '@randall/plugin-sdk'
import { MapProps } from './MapProps'
import { drawAttribution } from './drawAttribution'
import { flightAnimation, flightProgress } from './flight'
import { visibleTiles } from './geo'
import { drawMarker } from './marker'
import { MapResources } from './prepareMap'
import { tileKey } from './tileKey'

export function drawMap(ctx: CanvasRenderingContext2D, props: MapProps, {size, frame, animations, resources, createPath}: WidgetDrawContext<MapResources>) {
  const frames = animations[flightAnimation.name]
  const progress = frames == null ? 0 : flightProgress(frame, frames)
  const viewport = resources.flight?.(progress) ?? resources.viewport

  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.globalAlpha = props.map_opacity / 100
  if (props.grayscale) {
    ctx.filter = 'grayscale(1)'
  }

  for (const {tile, rect} of visibleTiles(viewport, size)) {
    const image = resources.tiles.get(tileKey(tile))
    if (image == null) { continue }

    // Snap to whole pixels so that neighbouring tiles meet without seams.
    const left = Math.round(rect.left)
    const top = Math.round(rect.top)
    const right = Math.round(rect.left + rect.width)
    const bottom = Math.round(rect.top + rect.height)
    ctx.drawImage(image, left, top, right - left, bottom - top)
  }

  ctx.restore()

  props.markers.forEach((marker, index) => {
    if (marker.size <= 0) { return }
    
    const location = resources.markers[index] ?? MapProps.defaultCenter()
    const [x, y] = viewport.pointToPixel(location, size)
    drawMarker(ctx, createPath, [x, y], marker.size, marker.color, marker.icon)
  })

  if (props.attribution) {
    drawAttribution(ctx, size)
  }
}
