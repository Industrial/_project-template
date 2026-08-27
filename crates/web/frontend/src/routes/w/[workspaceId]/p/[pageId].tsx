import { Title } from '@solidjs/meta'
import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { useSearchParams } from '@solidjs/router'
import { For, Show, createMemo } from 'solid-js'

import { requireUser } from '../../../../lib/auth'
import { FormError, latestSubmission } from '../../../../lib/form'
import {
  addBlock,
  addComment,
  addShare,
  getPage,
  listBlocks,
  listComments,
  listShares,
  readQuery,
  removeBlock,
  removeComment,
  removeShare,
  updateBlock,
  updatePage,
} from '../../../../lib/notes'

const BLOCK_TYPES = [
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'todo',
  'bullet',
  'numbered',
  'quote',
  'code',
  'divider',
] as const

export const route = {
  preload: async ({ params }) => {
    await requireUser()
    const id = Number(params.pageId)
    if (Number.isFinite(id)) {
      await Promise.all([getPage(id), listBlocks(id)])
    }
  },
} satisfies RouteDefinition

export default function PageEditor(
  props: RouteProps<'/w/:workspaceId/p/:pageId'>,
) {
  const id = () => Number(props.params.pageId)
  const page = createMemo(() => readQuery(getPage(id())))
  const blockList = createMemo(() => readQuery(listBlocks(id())))
  const blocks = createMemo(() => blockList().items ?? [])
  const [searchParams] = useSearchParams()
  const shareOpen = createMemo(() => searchParams.share === '1')
  const commentsOpen = createMemo(() => searchParams.comments === '1')
  const shares = createMemo(() =>
    shareOpen() ? readQuery(listShares(id())).items : [],
  )
  const comments = createMemo(() =>
    commentsOpen() ? readQuery(listComments(id())).items : [],
  )

  const updatePageSub = latestSubmission(updatePage)
  const addBlockSub = latestSubmission(addBlock)
  const updateBlockSub = latestSubmission(updateBlock)
  const removeBlockSub = latestSubmission(removeBlock)
  const addShareSub = latestSubmission(addShare)
  const removeShareSub = latestSubmission(removeShare)
  const addCommentSub = latestSubmission(addComment)
  const removeCommentSub = latestSubmission(removeComment)

  return (
    <section class="stack">
      <Title>{page().title || 'Untitled'}</Title>
      <div class="toolbar">
        <a href="?share=1" class="btn-secondary">
          Share
        </a>
        <a href="?comments=1" class="btn-secondary">
          Comments
        </a>
        <form action={addBlock.with(id())} method="post">
          <button type="submit" class="btn-primary">
            Add block
          </button>
        </form>
      </div>
      <FormError submission={addBlockSub} />

      <form action={updatePage.with(id())} method="post" class="card stack">
        <label class="field-label">
          Page title
          <input
            type="text"
            name="title"
            value={page().title}
            placeholder="Untitled"
            class="field-input"
          />
        </label>
        <FormError submission={updatePageSub} />
        <button type="submit" class="btn-primary w-fit">
          Save title
        </button>
      </form>

      <div class="stack">
        <For
          each={blocks()}
          fallback={
            <div class="card text-center">
              <p class="text-sm text-muted-foreground">
                This page has no blocks yet.
              </p>
              <form action={addBlock.with(id())} method="post" class="mt-4">
                <button type="submit" class="btn-primary">
                  Add your first block
                </button>
              </form>
            </div>
          }
        >
          {(block) => (
            <article class="card stack">
              <form
                action={updateBlock.with(block.id)}
                method="post"
                class="stack"
              >
                <label class="field-label">
                  Type
                  <select
                    name="block_type"
                    value={block.block_type}
                    class="field-input"
                  >
                    <For each={[...BLOCK_TYPES]}>
                      {(type) => (
                        <option value={type}>{type.replace('_', ' ')}</option>
                      )}
                    </For>
                  </select>
                </label>
                <Show when={block.block_type === 'todo'}>
                  <label class="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="checked"
                      value="true"
                      defaultChecked={block.checked}
                      class="size-4 rounded border-border"
                    />
                    Done
                  </label>
                </Show>
                <Show when={block.block_type !== 'divider'}>
                  <label class="field-label">
                    Text
                    <textarea
                      name="text"
                      data-testid={`block-text-${block.id}`}
                      rows={block.block_type.startsWith('heading') ? 1 : 2}
                      value={block.content?.text ?? ''}
                      class="field-input"
                    />
                  </label>
                </Show>
                <div class="toolbar">
                  <button type="submit" class="btn-secondary">
                    Save
                  </button>
                </div>
              </form>
              <form action={removeBlock.with(block.id)} method="post">
                <button type="submit" class="btn-danger">
                  Delete
                </button>
              </form>
              <Show when={block.block_type === 'divider'}>
                <hr class="border-border" />
              </Show>
              <FormError submission={updateBlockSub} />
              <FormError submission={removeBlockSub} />
            </article>
          )}
        </For>
      </div>

      <Show when={shareOpen()}>
        <section class="panel stack" data-testid="share-panel">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-foreground">Share page</h2>
            <a href="?" class="btn-ghost">
              Close
            </a>
          </div>
          <ul class="divide-y divide-border">
            <For
              each={shares()}
              fallback={
                <li class="py-2 text-sm text-muted-foreground">
                  No shares yet
                </li>
              }
            >
              {(s) => (
                <li class="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    User #{s.user_id} · {s.permission}
                  </span>
                  <form action={removeShare.with(s.id)} method="post">
                    <button type="submit" class="btn-danger">
                      Remove
                    </button>
                  </form>
                </li>
              )}
            </For>
          </ul>
          <form action={addShare.with(id())} method="post" class="stack">
            <label class="field-label">
              User ID
              <input
                type="number"
                name="user_id"
                required
                class="field-input"
              />
            </label>
            <label class="field-label">
              Permission
              <select name="permission" value="view" class="field-input">
                <option value="view">View</option>
                <option value="comment">Comment</option>
                <option value="edit">Edit</option>
              </select>
            </label>
            <FormError submission={addShareSub} />
            <FormError submission={removeShareSub} />
            <button type="submit" class="btn-primary w-fit">
              Add
            </button>
          </form>
        </section>
      </Show>

      <Show when={commentsOpen()}>
        <section class="panel stack" data-testid="comments-panel">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-foreground">Comments</h2>
            <a href="?" class="btn-ghost">
              Close
            </a>
          </div>
          <ul class="divide-y divide-border">
            <For
              each={comments()}
              fallback={
                <li class="py-2 text-sm text-muted-foreground">
                  No comments yet
                </li>
              }
            >
              {(c) => (
                <li class="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                  <p class="text-foreground">{c.body}</p>
                  <form action={removeComment.with(c.id)} method="post">
                    <button type="submit" class="btn-danger">
                      Delete
                    </button>
                  </form>
                </li>
              )}
            </For>
          </ul>
          <form action={addComment.with(id())} method="post" class="stack">
            <label class="field-label">
              Add comment
              <textarea name="body" rows={3} required class="field-input" />
            </label>
            <FormError submission={addCommentSub} />
            <FormError submission={removeCommentSub} />
            <button type="submit" class="btn-primary w-fit">
              Post
            </button>
          </form>
        </section>
      </Show>
    </section>
  )
}
