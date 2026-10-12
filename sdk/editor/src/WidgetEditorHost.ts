/**
 * What a widget's editor can ask of the template editor.
 */
export interface WidgetEditorHost {
  /** Runs a query of the widget's server part, like a geocoding search. */
  query<T>(name: string, params: Record<string, string>): Promise<T>

  /** The URL of one of the widget's resources, for libraries that load them themselves. Placeholders are kept. */
  resourceURL(path: string): string

  /** Adds authentication to a request for one of the widget's resources. */
  authorizeRequest(url: string): AuthorizedRequest
}

export interface AuthorizedRequest {
  url:          string
  headers?:     Record<string, string>
  credentials?: 'same-origin' | 'include'
}
