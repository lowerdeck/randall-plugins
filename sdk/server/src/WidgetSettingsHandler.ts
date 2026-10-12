import { WidgetSecrets } from './WidgetSecrets'

/**
 * The organisation settings of a widget, stored under its name.
 */
export interface WidgetSettingsHandler<S> {
  default: S
  parse(stored: unknown): S

  /** The settings as shown to admins, e.g. with masked credentials. */
  publicView(settings: S, secrets: WidgetSecrets): unknown

  /** Applies an update as sent by admins. Throws a `WidgetSettingsError` for invalid updates. */
  update(current: S, update: unknown, secrets: WidgetSecrets): S

  /** Tries out changed settings. Throws a `WidgetSettingsError` if they don't work. */
  test?(settings: S, secrets: WidgetSecrets): Promise<void>
}
