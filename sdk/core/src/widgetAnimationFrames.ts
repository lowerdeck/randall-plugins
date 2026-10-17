import { Widget } from './Widget'
import { WidgetAnimationFrames } from './WidgetAnimation'
import { WidgetFrameRange } from './WidgetFrameRange'

/**
 * The frames of the widget's animations that are going on, given the frames in its spec. Animations without frames in
 * the spec start at the start of the scene.
 */
export function widgetAnimationFrames<P>(widget: Widget<P>, props: P, specFrames: Record<string, [number, number]> | null | undefined, fps: number): WidgetAnimationFrames {
  const frames: WidgetAnimationFrames = {}
  for (const animation of widget.animations?.(props) ?? []) {
    const spec = specFrames?.[animation.name]
    if (spec == null) {
      frames[animation.name] = {from: 0, to: Math.round(animation.defaultDuration * fps)}
    } else {
      const from = Math.max(0, Math.round(spec[0]))
      frames[animation.name] = {from, to: Math.max(from, Math.round(spec[1]))}
    }
  }
  return frames
}

/** All frames that the animations span, or `null` if there are none. */
export function animationFramesSpan(frames: WidgetAnimationFrames): WidgetFrameRange | null {
  const ranges = Object.values(frames)
  if (ranges.length === 0) { return null }

  return {
    from: Math.min(...ranges.map(it => it.from)),
    to:   Math.max(...ranges.map(it => it.to)),
  }
}
