import { markerHole, markerPath, markerViewBox } from './marker'
import { markerGlyphTransform } from './markerGlyphTransform'
import { isShapeName, shapes } from './shapes'

// Draws a map pin of the given height with its tip at `tip`, with an icon shape or else a dot in its head.
export function drawMarker(context: CanvasRenderingContext2D, createPath: (data: string) => Path2D, tip: [number, number], height: number, color: string, icon: string | null) {
  const [viewWidth, viewHeight] = markerViewBox
  const scale = height / viewHeight

  // Shadows are specified in device pixels, regardless of the current transform.
  const transform = context.getTransform()
  const deviceScale = Math.hypot(transform.a, transform.b)

  context.save()
  context.translate(tip[0] - viewWidth / 2 * scale, tip[1] - height)
  context.scale(scale, scale)

  context.shadowColor = shadowColor
  context.shadowOffsetY = height * 0.04 * deviceScale
  context.shadowBlur = height * 0.1 * deviceScale
  context.fillStyle = color
  context.fill(createPath(markerPath))

  context.shadowColor = 'transparent'
  context.fillStyle = 'white'

  if (isShapeName(icon)) {
    const {x, y, scale: glyphScale} = markerGlyphTransform()
    context.translate(x, y)
    context.scale(glyphScale, glyphScale)
    context.fill(createPath(shapes[icon]))
  } else {
    context.beginPath()
    context.arc(markerHole.cx, markerHole.cy, markerHole.r, 0, 2 * Math.PI)
    context.fill()
  }

  context.restore()
}

const shadowColor = 'rgba(0, 0, 0, 0.31)'
