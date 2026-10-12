/**
 * What a widget can ask of the app it runs in while preparing.
 */
export interface WidgetHost {
  /**
   * Loads an image from the widget's own resources (served by its server part), like `tiles/streets/3/4/2`. The host
   * takes care of authentication and credentials.
   */
  loadImage(path: string): Promise<CanvasImageSource>

  /** Reports a problem that doesn't keep the widget from drawing. When rendering, it fails the render. */
  reportError(error: unknown): void
}
