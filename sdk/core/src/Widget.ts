import { WidgetDefinition } from 'templates'
import { WidgetDrawContext } from './WidgetDrawContext'
import { WidgetHost } from './WidgetHost'
import { WidgetSettings } from './WidgetSettings'
import { WidgetSize } from './WidgetSize'

/**
 * A widget: params to configure it, and code that draws it onto a canvas for a given frame. The same code runs in the
 * template editor's preview and in the backend when rendering.
 */
export interface Widget<P = any, R = any> {
  definition: WidgetDefinition

  /** Organisation-wide settings, like provider credentials. */
  settings?: WidgetSettings

  /**
   * How params are edited, where their type isn't enough: `dialog` params are left to the widget's own editor, and
   * `color` params are text params holding a color.
   */
  paramHints?: Record<string, WidgetParamHint>

  /** The props to draw with, given the (evaluated) props of the spec, which may be incomplete. */
  resolveProps(raw: Record<string, unknown>): P

  /** Loads what drawing needs, like images. Called again whenever the props or the size change. */
  prepare?(props: P, context: WidgetPrepareContext): Promise<R>

  /** Draws the widget with its top left at the origin. Drawing is clipped to its size. */
  draw(ctx: CanvasRenderingContext2D, props: P, context: WidgetDrawContext<R>): void
}

export type WidgetParamHint = 'dialog' | 'color'

export interface WidgetPrepareContext {
  size: WidgetSize
  host: WidgetHost
}
