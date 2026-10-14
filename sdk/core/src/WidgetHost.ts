/**
 * What a widget can ask of the app it runs in while preparing.
 */
export interface WidgetHost {
  /**
   * Loads an image from the widget's own resources (served by its server part), like `tiles/streets/3/4/2`. The host
   * takes care of authentication and credentials.
   */
  loadImage(path: string): Promise<CanvasImageSource>

  /** Runs a query of the widget's server part, like geocoding an address. */
  query<T>(name: string, params: Record<string, string>): Promise<T>

  /** Reports a problem that doesn't keep the widget from drawing. When rendering, it fails the render. */
  reportError(error: unknown): void
}
