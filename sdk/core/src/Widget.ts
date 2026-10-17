import { Size } from 'ytil'
import { WidgetAnimation, WidgetAnimationFrames } from './WidgetAnimation'
import { WidgetAssistant } from './WidgetAssistant'
import { WidgetDrawContext } from './WidgetDrawContext'
import { WidgetForm } from './WidgetForm'
import { WidgetHost } from './WidgetHost'
import { WidgetParams } from './WidgetParam'
import { WidgetSettings } from './WidgetSettings'

/**
 * A widget: params to configure it, and code that draws it onto a canvas for a given frame. The same code runs in the
 * template editor's preview and in the backend when rendering.
 */
export interface Widget<P = any, R = any> {
  name:   string
  /** An i18next key in the plugin's locale. */
  label:  string
  form:   WidgetForm

  /** All params of the form, by name. */
  params: WidgetParams

  /** Organisation-wide settings, like provider credentials. */
  settings?: WidgetSettings

  /** Offers the widget to the template editor's assistant. */
  assistant?: WidgetAssistant

  /** The props to draw with, given the (evaluated) props of the spec, which may be incomplete. See `defineWidget`. */
  resolveProps(raw: Record<string, unknown>): P

  /** Loads what drawing needs, like images. Called again whenever the props or the size change. */
  prepare?(props: P, context: WidgetPrepareContext): Promise<R>

  /** The animations that the widget does by itself with these props. Without any, it's still. */
  animations?: (props: P) => WidgetAnimation[]

  /** Draws the widget with its top left at the origin. Drawing is clipped to its size. */
  draw(ctx: CanvasRenderingContext2D, props: P, context: WidgetDrawContext<R>): void
}

export interface WidgetPrepareContext {
  size: Size
  host: WidgetHost

  /** The frames of the animations, see `widgetAnimationFrames`. */
  animations: WidgetAnimationFrames
}
