import { WidgetFrameRange } from '@randall/plugin-sdk'

/** How far along the flight the map is at a frame, eased in and out. */
export function flightProgress(frame: number, frames: WidgetFrameRange): number {
  if (frames.to <= frames.from) { return frame >= frames.from ? 1 : 0 }

  const t = (frame - frames.from) / (frames.to - frames.from)
  return easeInOut(Math.max(0, Math.min(1, t)))
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}
