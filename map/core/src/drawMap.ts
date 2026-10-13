import { WidgetDrawContext } from '@randall/plugin-sdk'
import { GeoPoint } from 'templates'
import { MapProps } from './MapProps'
import { drawMarker } from './marker'
import { MapResources } from './prepareMap'

export function drawMap(ctx: CanvasRenderingContext2D, props: MapProps, {size, resources, createPath}: WidgetDrawContext<MapResources>) {
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  for (const {rect, image} of resources.tiles) {
    // Snap to whole pixels so that neighbouring tiles meet without seams.
    const left = Math.round(rect.left)
    const top = Math.round(rect.top)
    const right = Math.round(rect.right)
    const bottom = Math.round(rect.bottom)
    ctx.drawImage(image, left, top, right - left, bottom - top)
  }

  ctx.restore()

  for (const marker of props.markers) {
    if (!GeoPoint.is(marker.location) || marker.size <= 0) { continue }

    const [x, y] = resources.viewport.pointToPixel(marker.location, size)
    drawMarker(ctx, createPath, [x, y], marker.size, marker.color, marker.icon)
  }
}
