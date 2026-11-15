import { ContentManager } from '@/admin/components/ContentManager'
import type { FieldConfig } from '@/admin/components/ResourceFormModal'
import type { Column } from '@/admin/components/DataTable'
import { youTubeThumbnailUrl, youTubeWatchUrl } from '@/lib/youtube'
import type { HomepageVideo } from '@/types'
import { DateCell, StatusCell, Thumbnail } from './shared'
import { publishActions } from './helpers'

const FIELDS: FieldConfig[] = [
  {
    name: 'youtubeUrl',
    label: 'YouTube Link',
    type: 'youtube',
    required: true,
    hint: 'Paste the link from the TeachingCareer YouTube channel. Only the link is saved — no video file is uploaded.',
  },
  { name: 'title', label: 'Video Title', type: 'text', required: true },
  { name: 'order', label: 'Display Order', type: 'number', hint: 'The first published video is featured in the New Services tab.' },
  { name: 'description', label: 'Description', type: 'textarea' },
]

const COLUMNS: Column<HomepageVideo>[] = [
  { key: 'youtubeId', label: 'Thumbnail', render: (r) => <Thumbnail src={youTubeThumbnailUrl(r.youtubeId)} /> },
  { key: 'title', label: 'Title', sortable: true },
  {
    key: 'youtubeUrl',
    label: 'Video',
    render: (r) => (
      <a href={youTubeWatchUrl(r.youtubeId)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-teal-deep hover:underline">
        {r.youtubeId}
      </a>
    ),
  },
  { key: 'createdAt', label: 'Added', sortable: true, render: (r) => <DateCell value={r.createdAt} /> },
  { key: 'order', label: 'Order', sortable: true },
  { key: 'status', label: 'Status', render: (r) => <StatusCell status={r.status} /> },
]

export default function AdminHomepageVideos() {
  return (
    <ContentManager<HomepageVideo>
      resource="homepage-videos"
      title="YouTube Videos"
      description="Videos from the TeachingCareer YouTube channel, shown with a play button in the homepage hero."
      itemName="Video"
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'youtubeId']}
      newDefaults={{ order: 0 }}
      statusActionsFor={publishActions}
    />
  )
}
