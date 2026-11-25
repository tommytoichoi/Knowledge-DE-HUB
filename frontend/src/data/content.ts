/**
 * TEMPORARY content source — reads Markdown straight from the repo's content/ folder at
 * build time. Phase 1 replaces this with the Go API (GET /api/v1/notes/:slug), which serves
 * notes that cmd/ingest loaded into Postgres. Remove this file and the `@content` alias then.
 */

export interface Note {
  slug: string
  title: string
  tags: string[]
  level?: string
  status?: string
  updated?: string
  body: string // Markdown without frontmatter and without the leading "# Title"
}

const files = import.meta.glob<string>('../../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Minimal frontmatter parser — enough for the preview; the real one lives in cmd/ingest. */
function parseNote(slug: string, raw: string): Note {
  const match = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta: Record<string, string> = {}
  let body = raw
  if (match) {
    body = match[2]
    for (const line of match[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*?)\s*(#.*)?$/)
      if (kv) meta[kv[1]] = kv[2]
    }
  }
  const tags = (meta.tags ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    slug,
    title: meta.title ?? slug,
    tags,
    level: meta.level,
    status: meta.status,
    updated: meta.updated,
    body: body.replace(/^\s*# .*\n/, ''),
  }
}

export const notes: Record<string, Note> = Object.fromEntries(
  Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      return [slug, parseNote(slug, raw)] as const
    })
    .filter(([slug]) => slug.toLowerCase() !== 'readme'),
)
