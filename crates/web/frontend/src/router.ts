import { pageRoutes } from 'virtual:file-routes'
import { createRouter } from '@solidjs/router'
import type { FileRouteEntry, FileRoutesFrom } from '@solidjs/router/fs'
import { lazy } from 'solid-js'

/**
 * Same as `@solidjs/router/fs` fileRoutes, but passes route `src` as
 * solid-js 2's third `lazy()` argument (moduleUrl) so SSR can resolve
 * client assets. Upstream still uses the old two-arg signature.
 */
function fileRoutes<const T extends readonly FileRouteEntry[]>(
  entries: T,
): FileRoutesFrom<T> {
  const components = new Map<string, ReturnType<typeof lazy>>()

  const componentOf = (ref: NonNullable<FileRouteEntry['$component']>) => {
    if ('require' in ref) {
      return ref.require().default
    }
    let component = components.get(ref.src)
    if (!component) {
      component = lazy(ref.import, undefined, ref.src)
      components.set(ref.src, component)
    }
    return component
  }

  type RouteDef = {
    path: string
    component?: unknown
    info?: Record<string, unknown>
    children?: RouteDef[]
    [key: string]: unknown
  }

  const toRoute = (entry: FileRouteEntry): RouteDef => {
    const config = entry.$$route?.require().route ?? {}
    return {
      ...config,
      path: entry.path,
      component: entry.$component ? componentOf(entry.$component) : undefined,
      info: { ...config.info, filesystem: true },
      children: entry.children ? entry.children.map(toRoute) : undefined,
    }
  }

  return entries.map(toRoute) as FileRoutesFrom<T>
}

export const Router = createRouter({ routes: fileRoutes(pageRoutes) })

export const { paths } = Router
