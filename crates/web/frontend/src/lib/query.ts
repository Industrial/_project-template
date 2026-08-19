/** Query call sites type as Promise; preload/Suspense unwraps at runtime. */
export function readQuery<T>(value: T | Promise<T>): T {
  return value as unknown as T
}
