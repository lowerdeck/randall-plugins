import { WidgetSize } from '@randall/plugin-sdk'

// The credits for the tiles, small in the bottom right corner, on a light backdrop so they read on any map.
export function drawAttribution(ctx: CanvasRenderingContext2D, size: WidgetSize) {
  const fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size.height * 0.025))
  const padding = fontSize * 0.4

  ctx.save()
  ctx.font = `${fontSize}px sans-serif`
  ctx.textBaseline = 'middle'

  const width = ctx.measureText(ATTRIBUTION).width + 2 * padding
  const height = fontSize + 2 * padding
  const left = size.width - width
  const top = size.height - height

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.fillRect(left, top, width, height)
  ctx.fillStyle = '#333333'
  ctx.fillText(ATTRIBUTION, left + padding, top + height / 2)
  ctx.restore()
}

export const ATTRIBUTION = '© MapTiler © OpenStreetMap contributors'

const MIN_FONT_SIZE = 9
const MAX_FONT_SIZE = 14
