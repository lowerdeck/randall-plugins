/**
 * Keeps recently fetched map tiles in memory, and shares fetches that are in flight. The editor re-requests the same
 * tiles on every preview pass, and fetching them from MapTiler each time is what makes it slow.
 */
export class TileCache<T> {

  constructor(
    private readonly capacity: number,
  ) {}

  private readonly entries = new Map<string, T>()
  private readonly inflight = new Map<string, Promise<T>>()

  public async get(key: string, fetch: () => Promise<T>): Promise<T> {
    const cached = this.entries.get(key)
    if (cached !== undefined) {
      // Re-insert to mark it as most recently used.
      this.entries.delete(key)
      this.entries.set(key, cached)
      return cached
    }

    const pending = this.inflight.get(key)
    if (pending != null) { return await pending }

    const promise = fetch()
    this.inflight.set(key, promise)
    try {
      const value = await promise
      this.store(key, value)
      return value
    } finally {
      this.inflight.delete(key)
    }
  }

  private store(key: string, value: T) {
    this.entries.set(key, value)
    while (this.entries.size > this.capacity) {
      const oldest = this.entries.keys().next().value!
      this.entries.delete(oldest)
    }
  }

}
