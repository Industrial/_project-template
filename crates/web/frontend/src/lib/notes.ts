import { action, query } from '@solidjs/router'
import { redirect, reload, respond } from '@solidjs/web'

import type { BlockDto } from '../bindings/BlockDto'
import type { CommentDto } from '../bindings/CommentDto'
import type { PageDto } from '../bindings/PageDto'
import type { PageShareDto } from '../bindings/PageShareDto'
import type { WorkspaceDto } from '../bindings/WorkspaceDto'
import type { WorkspaceMemberDto } from '../bindings/WorkspaceMemberDto'
import { LocoError, locoJson } from '../server/loco'
import { readQuery } from './query'

type ListResponse<T> = {
  items: T[]
  total?: number
  page?: number
  per_page?: number
}

export { readQuery }

function actionError(err: unknown) {
  if (err instanceof LocoError) {
    return { error: err.message }
  }
  throw err
}

export const listWorkspaces = query(async () => {
  'use server'
  return locoJson<ListResponse<WorkspaceDto>>('/api/workspaces?per_page=100')
}, 'workspaces')

export const getWorkspace = query(async (id: number) => {
  'use server'
  return locoJson<WorkspaceDto>(`/api/workspaces/${id}`)
}, 'workspace')

export const listPages = query(async (workspaceId: number) => {
  'use server'
  return locoJson<ListResponse<PageDto>>(
    `/api/pages?workspace_id=${workspaceId}&per_page=200`,
  )
}, 'pages')

export const getPage = query(async (id: number) => {
  'use server'
  return locoJson<PageDto>(`/api/pages/${id}`)
}, 'page')

export const listBlocks = query(async (pageId: number) => {
  'use server'
  return locoJson<ListResponse<BlockDto>>(
    `/api/blocks?page_id=${pageId}&per_page=500`,
  )
}, 'blocks')

export const listComments = query(async (pageId: number) => {
  'use server'
  return locoJson<ListResponse<CommentDto>>(
    `/api/comments?page_id=${pageId}&per_page=100`,
  )
}, 'comments')

export const listShares = query(async (pageId: number) => {
  'use server'
  return locoJson<ListResponse<PageShareDto>>(
    `/api/page_shares?page_id=${pageId}&per_page=100`,
  )
}, 'shares')

export const listMembers = query(async (workspaceId: number) => {
  'use server'
  return locoJson<ListResponse<WorkspaceMemberDto>>(
    `/api/workspace_members?workspace_id=${workspaceId}&per_page=100`,
  )
}, 'members')

export const createPage = action(async (formData: FormData) => {
  'use server'
  const workspace_id = Number(formData.get('workspace_id'))
  try {
    const page = await locoJson<PageDto>('/api/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Untitled',
        icon: null,
        position: Date.now(),
        workspace_id,
        parent_page_id: null,
      }),
    })
    return redirect(`/w/${workspace_id}/p/${page.id}`, {
      revalidate: listPages.keyFor(workspace_id),
    })
  } catch (err) {
    if (err instanceof LocoError) {
      return { error: err.message }
    }
    throw err
  }
})

export const updatePage = action(async (id: number, formData: FormData) => {
  'use server'
  try {
    const current = await locoJson<PageDto>(`/api/pages/${id}`)
    const title = String(formData.get('title') ?? current.title)
    await locoJson(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        icon: current.icon,
        position: current.position,
        parent_page_id: current.parent_page_id,
      }),
    })
    return redirect(`/w/${current.workspace_id}/p/${id}`, {
      revalidate: [getPage.keyFor(id), listPages.keyFor(current.workspace_id)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const updateWorkspace = action(
  async (id: number, formData: FormData) => {
    'use server'
    try {
      const name = String(formData.get('name') ?? '').trim()
      await locoJson(`/api/workspaces/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      })
      return respond(
        { ok: true as const },
        { revalidate: [getWorkspace.keyFor(id), listWorkspaces.key] },
      )
    } catch (err) {
      return actionError(err)
    }
  },
)

export const inviteMember = action(async (formData: FormData) => {
  'use server'
  try {
    const workspace_id = Number(formData.get('workspace_id'))
    const user_id = Number(formData.get('user_id'))
    const role = String(formData.get('role') ?? 'viewer')
    await locoJson('/api/workspace_members', {
      method: 'POST',
      body: JSON.stringify({ workspace_id, user_id, role }),
    })
    return respond(
      { ok: true as const },
      { revalidate: listMembers.keyFor(workspace_id) },
    )
  } catch (err) {
    return actionError(err)
  }
})

export const addBlock = action(async (pageId: number) => {
  'use server'
  try {
    const existing = await locoJson<ListResponse<BlockDto>>(
      `/api/blocks?page_id=${pageId}&per_page=500`,
    )
    const position = existing.items.length * 1000
    await locoJson('/api/blocks', {
      method: 'POST',
      body: JSON.stringify({
        block_type: 'paragraph',
        checked: false,
        position,
        page_id: pageId,
        content: { text: '' },
      }),
    })
    return reload({
      revalidate: [listBlocks.key, getPage.keyFor(pageId)],
    })
  } catch (err) {
    if (err instanceof LocoError) {
      return { error: err.message }
    }
    throw err
  }
})

export const updateBlock = action(async (id: number, formData: FormData) => {
  'use server'
  try {
    const current = await locoJson<BlockDto>(`/api/blocks/${id}`)
    const block_type = String(formData.get('block_type') ?? current.block_type)
    const text = formData.get('text')
    const checkedRaw = formData.get('checked')
    await locoJson(`/api/blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        block_type,
        checked:
          checkedRaw === null
            ? current.checked
            : checkedRaw === 'true' || checkedRaw === 'on',
        position: current.position,
        content: text === null ? current.content : { text: String(text) },
      }),
    })
    return reload({
      revalidate: [listBlocks.key, getPage.keyFor(current.page_id)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const removeBlock = action(async (id: number) => {
  'use server'
  try {
    const current = await locoJson<BlockDto>(`/api/blocks/${id}`)
    await locoJson(`/api/blocks/${id}`, { method: 'DELETE' })
    return reload({
      revalidate: [listBlocks.key, getPage.keyFor(current.page_id)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const addComment = action(async (pageId: number, formData: FormData) => {
  'use server'
  try {
    const body = String(formData.get('body') ?? '').trim()
    await locoJson('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ body, page_id: pageId }),
    })
    return reload({
      revalidate: [listComments.key, getPage.keyFor(pageId)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const removeComment = action(async (id: number) => {
  'use server'
  try {
    const current = await locoJson<CommentDto>(`/api/comments/${id}`)
    await locoJson(`/api/comments/${id}`, { method: 'DELETE' })
    return reload({
      revalidate: [listComments.key, getPage.keyFor(current.page_id)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const addShare = action(async (pageId: number, formData: FormData) => {
  'use server'
  try {
    const user_id = Number(formData.get('user_id'))
    const permission = String(formData.get('permission') ?? 'view')
    await locoJson('/api/page_shares', {
      method: 'POST',
      body: JSON.stringify({ permission, page_id: pageId, user_id }),
    })
    return reload({
      revalidate: [listShares.key, getPage.keyFor(pageId)],
    })
  } catch (err) {
    return actionError(err)
  }
})

export const removeShare = action(async (id: number) => {
  'use server'
  try {
    const current = await locoJson<PageShareDto>(`/api/page_shares/${id}`)
    await locoJson(`/api/page_shares/${id}`, { method: 'DELETE' })
    return reload({
      revalidate: [listShares.key, getPage.keyFor(current.page_id)],
    })
  } catch (err) {
    return actionError(err)
  }
})
