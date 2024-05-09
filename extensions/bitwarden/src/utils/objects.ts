export type ObjectEntries<Obj> = { [Key in keyof Obj]: [Key, Obj[Key]] }[keyof Obj][];

/** `Object.entries` with typed keys */
export function objectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as ObjectEntries<T>;
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
