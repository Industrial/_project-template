import { Title } from '@solidjs/meta'
import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, Show, createMemo, createSignal } from 'solid-js'

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
  preload: ({ params }) => {
    void requireUser()
    const id = Number(params.pageId)
    if (Number.isFinite(id)) {
      void getPage(id)
      void listBlocks(id)
    }
  },
} satisfies RouteDefinition

export default function PageEditor(
  props: RouteProps<'/w/:workspaceId/p/:pageId'>,
) {
  const id = () => Number(props.params.pageId)
  const page = createMemo(() => readQuery(getPage(id())))
  const blocks = createMemo(() => readQuery(listBlocks(id())).items ?? [])
  const [shareOpen, setShareOpen] = createSignal(false)
  const [commentsOpen, setCommentsOpen] = createSignal(false)
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
    <section>
      <Title>{page().title || 'Untitled'}</Title>
      <div>
        <button type="button" onClick={() => setShareOpen(true)}>
          Share
        </button>{' '}
        <button type="button" onClick={() => setCommentsOpen(true)}>
          Comments
        </button>{' '}
        <form action={addBlock.with(id())} method="post">
          <button type="submit">Add block</button>
        </form>
      </div>
      <FormError submission={addBlockSub} />

      <form action={updatePage.with(id())} method="post">
        <p>
          <label>
            Page title{' '}
            <input
              type="text"
              name="title"
              value={page().title}
              placeholder="Untitled"
            />
          </label>{' '}
          <button type="submit">Save title</button>
        </p>
        <FormError submission={updatePageSub} />
      </form>

      <For
        each={blocks()}
        fallback={
          <div>
            <form action={addBlock.with(id())} method="post">
              <button type="submit">Add your first block</button>
            </form>
          </div>
        }
      >
        {(block) => (
          <article>
            <form action={updateBlock.with(block.id)} method="post">
              <p>
                <label>
                  Type{' '}
                  <select name="block_type" value={block.block_type}>
                    <For each={[...BLOCK_TYPES]}>
                      {(type) => (
                        <option value={type}>{type.replace('_', ' ')}</option>
                      )}
                    </For>
                  </select>
                </label>
              </p>
              <Show when={block.block_type === 'todo'}>
                <p>
                  <label>
                    <input
                      type="checkbox"
                      name="checked"
                      value="true"
                      defaultChecked={block.checked}
                    />{' '}
                    Done
                  </label>
                </p>
              </Show>
              <Show when={block.block_type !== 'divider'}>
                <p>
                  <label>
                    Text{' '}
                    <textarea
                      name="text"
                      rows={block.block_type.startsWith('heading') ? 1 : 2}
                      value={block.content?.text ?? ''}
                    />
                  </label>
                </p>
              </Show>
              <p>
                <button type="submit">Save</button>
              </p>
            </form>
            <form action={removeBlock.with(block.id)} method="post">
              <button type="submit">Delete</button>
            </form>
            <Show when={block.block_type === 'divider'}>
              <hr />
            </Show>
            <FormError submission={updateBlockSub} />
            <FormError submission={removeBlockSub} />
          </article>
        )}
      </For>

      <Show when={shareOpen()}>
        <section>
          <h2>Share page</h2>
          <button type="button" onClick={() => setShareOpen(false)}>
            Close
          </button>
          <ul>
            <For each={shares()} fallback={<li>No shares yet</li>}>
              {(s) => (
                <li>
                  User #{s.user_id} · {s.permission}{' '}
                  <form action={removeShare.with(s.id)} method="post">
                    <button type="submit">Remove</button>
                  </form>
                </li>
              )}
            </For>
          </ul>
          <form action={addShare.with(id())} method="post">
            <p>
              <label>
                User ID <input type="number" name="user_id" required />
              </label>
            </p>
            <p>
              <label>
                Permission{' '}
                <select name="permission" value="view">
                  <option value="view">View</option>
                  <option value="comment">Comment</option>
                  <option value="edit">Edit</option>
                </select>
              </label>
            </p>
            <FormError submission={addShareSub} />
            <FormError submission={removeShareSub} />
            <p>
              <button type="submit">Add</button>
            </p>
          </form>
        </section>
      </Show>

      <Show when={commentsOpen()}>
        <section>
          <h2>Comments</h2>
          <button type="button" onClick={() => setCommentsOpen(false)}>
            Close
          </button>
          <ul>
            <For each={comments()} fallback={<li>No comments yet</li>}>
              {(c) => (
                <li>
                  {c.body}{' '}
                  <form action={removeComment.with(c.id)} method="post">
                    <button type="submit">Delete</button>
                  </form>
                </li>
              )}
            </For>
          </ul>
          <form action={addComment.with(id())} method="post">
            <p>
              <label>
                Add comment <textarea name="body" rows={3} required />
              </label>
            </p>
            <FormError submission={addCommentSub} />
            <FormError submission={removeCommentSub} />
            <p>
              <button type="submit">Post</button>
            </p>
          </form>
        </section>
      </Show>
    </section>
  )
}
