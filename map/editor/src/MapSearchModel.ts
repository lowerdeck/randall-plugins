import { action, makeObservable, observable } from 'mobx'
import { WidgetEditorHost } from '@randall/plugin-sdk-editor'
import { GeocodeResult } from './GeocodeResult'

export class MapSearchModel {

  constructor(
    private readonly host: WidgetEditorHost,
  ) {
    makeObservable(this)
  }

  @observable
  private accessor _query: string = ''
  public get query() { return this._query }

  @observable
  private accessor _results: GeocodeResult[] = []
  public get results() { return this._results }

  @observable
  private accessor _searching: boolean = false
  public get searching() { return this._searching }

  private timeout: ReturnType<typeof setTimeout> | null = null
  private searchId = 0

  @action
  public setQuery(query: string) {
    this._query = query
    this.cancel()

    if (query.trim() === '') {
      this._results = []
      return
    }

    this.timeout = setTimeout(() => this.search(query.trim()), DEBOUNCE_MS)
  }

  public dispose() {
    this.cancel()
  }

  @action
  private cancel() {
    if (this.timeout != null) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.searchId++
    this._searching = false
  }

  private async search(query: string) {
    const searchId = ++this.searchId
    this.setSearching(true)

    try {
      const results = await this.host.query<GeocodeResult[]>('geocode', {query})
      if (searchId === this.searchId) { this.finishSearch(results) }
    } catch {
      // The host reports failed queries itself; the search just ends without results.
      if (searchId === this.searchId) { this.finishSearch([]) }
    }
  }

  @action
  private setSearching(searching: boolean) {
    this._searching = searching
  }

  @action
  private finishSearch(results: GeocodeResult[]) {
    this._results = results
    this._searching = false
  }

}

const DEBOUNCE_MS = 300
