import type { TestUser } from './data-factory'

export type TestRunContext = {
  user: TestUser
  token?: string
  workspaceIds: number[]
  pageIds: number[]
  blockIds: number[]
  commentIds: number[]
  shareIds: number[]
  memberIds: number[]
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async json<T>(
    path: string,
    init: RequestInit = {},
    token?: string,
  ): Promise<{ status: number; body: T }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers })
    const text = await res.text()
    const body = text ? (JSON.parse(text) as T) : ({} as T)
    return { status: res.status, body }
  }

  async register(user: TestUser): Promise<number> {
    const { status } = await this.json('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: user.name, email: user.email, password: user.password }),
    })
    return status
  }

  async login(user: TestUser): Promise<string> {
    const { status, body } = await this.json<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    })
    if (status !== 200) {
      throw new Error(`Login failed (${status}) for ${user.email}`)
    }
    return body.token
  }

  async listWorkspaces(token: string): Promise<Array<{ id: number }>> {
    const { body } = await this.json<{ items: Array<{ id: number }> }>(
      '/api/workspaces?per_page=100',
      {},
      token,
    )
    return body.items ?? []
  }

  async deleteWorkspace(token: string, id: number): Promise<void> {
    await this.json(`/api/workspaces/${id}`, { method: 'DELETE' }, token)
  }

  async deletePage(token: string, id: number): Promise<void> {
    await this.json(`/api/pages/${id}`, { method: 'DELETE' }, token)
  }

  async deleteBlock(token: string, id: number): Promise<void> {
    await this.json(`/api/blocks/${id}`, { method: 'DELETE' }, token)
  }

  async deleteComment(token: string, id: number): Promise<void> {
    await this.json(`/api/comments/${id}`, { method: 'DELETE' }, token)
  }

  async deleteShare(token: string, id: number): Promise<void> {
    await this.json(`/api/page_shares/${id}`, { method: 'DELETE' }, token)
  }

  async deleteMember(token: string, id: number): Promise<void> {
    await this.json(`/api/workspace_members/${id}`, { method: 'DELETE' }, token)
  }

  async createWorkspace(token: string, name: string): Promise<number> {
    const { status, body } = await this.json<{ id: number }>(
      '/api/workspaces',
      { method: 'POST', body: JSON.stringify({ name }) },
      token,
    )
    if (status !== 201) {
      throw new Error(`Create workspace failed (${status})`)
    }
    return body.id
  }

  async createPage(
    token: string,
    workspaceId: number,
    title = 'Untitled',
  ): Promise<number> {
    const { status, body } = await this.json<{ id: number }>(
      '/api/pages',
      {
        method: 'POST',
        body: JSON.stringify({
          title,
          icon: null,
          position: Date.now(),
          workspace_id: workspaceId,
          parent_page_id: null,
        }),
      },
      token,
    )
    if (status !== 201) {
      throw new Error(`Create page failed (${status})`)
    }
    return body.id
  }

  async listBlocks(
    token: string,
    pageId: number,
  ): Promise<Array<{ id: number }>> {
    const { body } = await this.json<{ items: Array<{ id: number }> }>(
      `/api/blocks?page_id=${pageId}&per_page=500`,
      {},
      token,
    )
    return body.items ?? []
  }

  async createBlock(token: string, pageId: number, text = ''): Promise<number> {
    const { status, body } = await this.json<{ id: number }>(
      '/api/blocks',
      {
        method: 'POST',
        body: JSON.stringify({
          block_type: 'paragraph',
          checked: false,
          position: Date.now(),
          page_id: pageId,
          content: { text },
        }),
      },
      token,
    )
    if (status !== 201) {
      throw new Error(`Create block failed (${status})`)
    }
    return body.id
  }

  async listComments(
    token: string,
    pageId: number,
  ): Promise<Array<{ id: number; body: string }>> {
    const { body } = await this.json<{ items: Array<{ id: number; body: string }> }>(
      `/api/comments?page_id=${pageId}&per_page=100`,
      {},
      token,
    )
    return body.items ?? []
  }

  async listShares(
    token: string,
    pageId: number,
  ): Promise<Array<{ id: number; user_id: number }>> {
    const { body } = await this.json<{ items: Array<{ id: number; user_id: number }> }>(
      `/api/page_shares?page_id=${pageId}&per_page=100`,
      {},
      token,
    )
    return body.items ?? []
  }

  async createComment(
    token: string,
    pageId: number,
    bodyText: string,
  ): Promise<number> {
    const { status, body } = await this.json<{ id: number }>(
      '/api/comments',
      {
        method: 'POST',
        body: JSON.stringify({ body: bodyText, page_id: pageId }),
      },
      token,
    )
    if (status !== 201) {
      throw new Error(`Create comment failed (${status})`)
    }
    return body.id
  }

  async createShare(
    token: string,
    pageId: number,
    userId: number,
    permission = 'view',
  ): Promise<number> {
    const { status, body } = await this.json<{ id: number }>(
      '/api/page_shares',
      {
        method: 'POST',
        body: JSON.stringify({
          permission,
          page_id: pageId,
          user_id: userId,
        }),
      },
      token,
    )
    if (status !== 201) {
      throw new Error(`Create share failed (${status})`)
    }
    return body.id
  }
}

export async function cleanupTestRun(
  api: ApiClient,
  run: TestRunContext,
): Promise<void> {
  if (!run.token) {
    return
  }
  const token = run.token

  for (const id of run.shareIds) {
    await api.deleteShare(token, id).catch(() => undefined)
  }
  for (const id of run.commentIds) {
    await api.deleteComment(token, id).catch(() => undefined)
  }
  for (const id of run.blockIds) {
    await api.deleteBlock(token, id).catch(() => undefined)
  }
  for (const id of run.pageIds) {
    await api.deletePage(token, id).catch(() => undefined)
  }
  for (const id of run.memberIds) {
    await api.deleteMember(token, id).catch(() => undefined)
  }
  for (const id of run.workspaceIds) {
    await api.deleteWorkspace(token, id).catch(() => undefined)
  }

  const remaining = await api.listWorkspaces(token)
  for (const ws of remaining) {
    await api.deleteWorkspace(token, ws.id).catch(() => undefined)
  }
}
