import { WidgetFrameRange } from './WidgetFrameRange'

/**
 * An animation that a widget does by itself, like a map flying from one place to another. The template editor shows it
 * as a track with a keyframe at either end, which set its frames in the widget's spec. The renderer requests a frame
 * for each frame of the widget's animations.
 */
export interface WidgetAnimation {
  /** Identifies the animation within the widget, also in specs. */
  name: string

  /** An i18next key in the plugin's locale. */
  label: string

  /** In seconds, for animations that don't have their frames set yet. */
  defaultDuration: number
}

/** The frames of a widget's animations that are going on, by name. */
export type WidgetAnimationFrames = Record<string, WidgetFrameRange>
