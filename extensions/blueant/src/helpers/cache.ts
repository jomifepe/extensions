import { Cache as RCCache } from "@raycast/api";
import { getDateString, isToday } from "~/helpers/dates";

type CacheKey = 'timeRecordingFormValues' | 'previousComment';

const cache = new RCCache({ namespace: 'blueant' });

export type CacheSubscriber = (key: CacheKey | undefined, data: string | undefined) => void;

export const Cache = {
  clear: cache.clear,
  isEmpty: cache.isEmpty,
  storageDirectory: cache.storageDirectory,
  has: (key: CacheKey) => cache.has(key),
  get: (key: CacheKey) => cache.get(key),
  set: (key: CacheKey, data: string) => cache.set(key, data),
  remove: (key: CacheKey) => cache.remove(key),
  subscribe: (subscriber: CacheSubscriber) => cache.subscribe(subscriber as RCCache.Subscriber),
}

/* Specific cache helpers below */

export const cachePreviousComment = (message: string) => {
  Cache.set("previousComment", getDateString(new Date()) + message);
};

export const getCachedPreviousComment = () => {
  const cachedValue = Cache.get("previousComment");
  if (!cachedValue) return null;

  const date = new Date(cachedValue.substring(0, 10));
  if (!isToday(date)) return null;
  return cachedValue.substring(10);
};