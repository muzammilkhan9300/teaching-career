/**
 * Tiny in-process cache for public read endpoints whose data rarely changes
 * (site settings, the homepage hero). Each request to them otherwise pays a
 * full round trip to MongoDB Atlas. Every admin write clears the whole cache
 * (see routes/index.ts), so edits still show up immediately.
 */
const store = new Map<string, { expires: number; value: unknown }>()
const pending = new Map<string, Promise<unknown>>()
let generation = 0

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T

  // Concurrent misses share one database query.
  let promise = pending.get(key) as Promise<T> | undefined
  if (!promise) {
    const startedAt = generation
    promise = load()
      .then((value) => {
        // Plain JSON copy: what the client receives, safe to share between requests.
        const plain = JSON.parse(JSON.stringify(value)) as T
        // Skip storing if an admin write happened while this was loading.
        if (startedAt === generation) store.set(key, { expires: Date.now() + ttlMs, value: plain })
        return plain
      })
      .finally(() => pending.delete(key))
    pending.set(key, promise)
  }
  return promise
}

export function clearCache() {
  generation++
  store.clear()
  pending.clear()
}
