import { WidgetDrawContext } from '@randall/plugin-sdk'
import { MapProps } from './MapProps'
import { drawAttribution } from './drawAttribution'
import { drawMarker } from './marker'
import { MapResources } from './prepareMap'

export function drawMap(ctx: CanvasRenderingContext2D, props: MapProps, {size, resources, createPath}: WidgetDrawContext<MapResources>) {
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.globalAlpha = props.map_opacity / 100
  if (props.grayscale) {
    ctx.filter = 'grayscale(1)'
  }

  for (const {rect, image} of resources.tiles) {
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
    const [x, y] = resources.viewport.pointToPixel(location, size)
    drawMarker(ctx, createPath, [x, y], marker.size, marker.color, marker.icon)
  })

  if (props.attribution) {
    drawAttribution(ctx, size)
  }
}
