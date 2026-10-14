import { geocoded, geocodeQuery, locateAll, MapProps } from '@randall-plugins/map'
import { WidgetEditorHost, WidgetPreviewState } from '@randall/plugin-sdk-editor'

/**
 * Looks up the map's location texts that aren't "lat, lng", a moment after they last changed, so that typing an
 * address doesn't look up every keystroke. Calls back when they're known. Texts that fail to look up aren't tried again.
 */
export class MapLocator {

  constructor(
    private readonly host: WidgetEditorHost,
    private readonly onLocated: () => void,
  ) {}

  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly failed = new Set<string>()
  private disposed = false

  public update(state: WidgetPreviewState) {
    this.cancel()

    const pending = MapProps.locations(MapProps.resolve(state.values)).filter(text => {
      const query = geocodeQuery(text)
      return query != null && geocoded(query) === undefined && !this.failed.has(query)
    })
    if (pending.length === 0) { return }

    this.timer = setTimeout(() => this.locate(pending), DELAY)
  }

  public dispose() {
    this.disposed = true
    this.cancel()
  }

  private async locate(texts: string[]) {
    await locateAll(texts, this.host, error => console.error("Could not look up a location", error))
    for (const query of texts.map(geocodeQuery)) {
      if (query != null && geocoded(query) === undefined) { this.failed.add(query) }
    }
    if (!this.disposed) { this.onLocated() }
  }

  private cancel() {
    if (this.timer != null) { clearTimeout(this.timer) }
    this.timer = null
  }

}

const DELAY = 500
