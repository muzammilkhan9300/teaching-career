import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminBlogPosts, useBlogPostMutations } from '@/admin/adminQueries'
import { useAdminAuth } from '@/admin/AdminAuthContext'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import type { BlogPost } from '@/types'

const FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'lowercase-with-hyphens' },
  { name: 'category', label: 'Category', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
  { name: 'body', label: 'Body', type: 'paragraphs', required: true, placeholder: 'One paragraph per line, separated by a blank line.' },
]

export default function AdminBlogs() {
  const { data: posts, isPending } = useAdminBlogPosts()
  const { create, update, remove, runStatusAction } = useBlogPostMutations()
  const { can } = useAdminAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const controls = useTableControls(posts ?? [], { searchKeys: ['title', 'category', 'slug'], defaultSortKey: 'date' as never })

  const columns: Column<BlogPost>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as BlogPost).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'Post created' : 'Post updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(post: BlogPost) {
    if (!window.confirm(`Permanently delete "${post.title}"? This cannot be undone.`)) return
    remove.mutate(post.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Post deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleStatusAction(post: BlogPost, action: string, label: string) {
    runStatusAction.mutate(
      { id: post.id, action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `Post ${label}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Blogs — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Blog Posts</h1>
          <p className="text-sm text-body">Manage the articles shown on the public blog.</p>
        </div>
        {can('manageContent') ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add Post
          </button>
        ) : null}
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by title, category, or slug…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading posts…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage="No posts match."
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof BlogPost)}
            actions={(row) => (
              <div className="flex flex-wrap justify-end gap-1.5">
                {can('manageContent') ? (
                  <>
                    {row.status !== 'Published' ? (
                      <button type="button" onClick={() => handleStatusAction(row, 'publish', 'published')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Publish
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleStatusAction(row, 'unpublish', 'moved to draft')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Unpublish
                      </button>
                    )}
                    {row.status !== 'Archived' ? (
                      <button type="button" onClick={() => handleStatusAction(row, 'archive', 'archived')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Archive
                      </button>
                    ) : null}
                  </>
                ) : null}
                {can('manageContent') ? (
                  <button type="button" onClick={() => setEditing(row)} className="rounded-lg p-1.5 text-body hover:bg-mint hover:text-teal-deep" aria-label="Edit">
                    <EditIcon size={16} />
                  </button>
                ) : null}
                {can('hardDelete') ? (
                  <button type="button" onClick={() => handleDelete(row)} className="rounded-lg p-1.5 text-body hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <TrashIcon size={16} />
                  </button>
                ) : null}
              </div>
            )}
          />
          <Pagination page={controls.page} totalPages={controls.totalPages} onChange={controls.setPage} />
        </>
      )}

      {editing ? (
        <ResourceFormModal
          title={editing === 'new' ? 'Add Blog Post' : 'Edit Blog Post'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? {} : editing) as Record<string, unknown>}
          isSubmitting={create.isPending || update.isPending}
          error={formError}
          onSubmit={handleSubmit}
          onClose={() => {
            setEditing(null)
            setFormError(null)
          }}
        />
      ) : null}
    </div>
  )
}
