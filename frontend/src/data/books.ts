import type { Book } from '@/components/ui/cue-3d-book-carousel-reading-mode'

/**
 * The shelf: one book per Data Engineering topic, one chapter per note.
 * A chapter is "available" when content/<chapter slug>.md exists.
 *
 * Mock data for the UI — later this comes from the API (books/chapters tables).
 * Cover colours stay inside the Slate + Blue family; every text/cover pair is ≥ 4.5:1.
 */

export interface Chapter {
  slug: string
  title: string
}

export interface ShelfBook extends Book {
  slug: string
  chapters: Chapter[]
}

const ch = (slug: string, title: string): Chapter => ({ slug, title })

export const BOOKS: ShelfBook[] = [
  {
    slug: 'foundations',
    title: 'Foundations',
    subtitle: 'How data systems really work',
    eyebrow: 'Vol. 01',
    color: '#1E293B',
    textColor: '#F1F5F9',
    spineW: 48,
    h: 360,
    chapters: [
      ch('oltp-vs-olap', 'OLTP vs OLAP'),
      ch('de-lifecycle', 'The data engineering lifecycle'),
      ch('batch-vs-streaming', 'Batch vs streaming'),
      ch('file-formats', 'File formats: CSV, Parquet, Avro'),
      ch('distributed-basics', 'Distributed systems basics'),
    ],
  },
  {
    slug: 'sql',
    title: 'SQL',
    subtitle: 'From SELECT to window functions',
    eyebrow: 'Vol. 02',
    color: '#2563EB',
    textColor: '#FFFFFF',
    spineW: 36,
    h: 330,
    chapters: [
      ch('sql-joins', 'Joins explained'),
      ch('sql-aggregations', 'Aggregations & GROUP BY'),
      ch('sql-window-functions', 'Window functions'),
      ch('sql-ctes', 'CTEs & recursive queries'),
      ch('sql-query-plans', 'Query plans & indexes'),
    ],
  },
  {
    slug: 'data-modeling',
    title: 'Data Modeling',
    subtitle: 'Shape data for the questions you ask',
    eyebrow: 'Vol. 03',
    color: '#E2E8F0',
    textColor: '#1E293B',
    spineW: 58,
    h: 375,
    rotZ: -2.5,
    chapters: [
      ch('normalization', 'Normalization (1NF–3NF)'),
      ch('star-schema', 'Star & snowflake schema'),
      ch('scd', 'Slowly changing dimensions'),
      ch('data-vault', 'Data Vault'),
      ch('one-big-table', 'One big table'),
    ],
  },
  {
    slug: 'python',
    title: 'Python for DE',
    subtitle: 'Scripts that scale',
    eyebrow: 'Vol. 04',
    color: '#334155',
    textColor: '#E2E8F0',
    spineW: 30,
    h: 310,
    chapters: [
      ch('python-essentials', 'Python essentials for DE'),
      ch('pandas-polars-duckdb', 'Pandas vs Polars vs DuckDB'),
      ch('python-packaging', 'Packaging & environments'),
      ch('testing-data-code', 'Testing data code'),
    ],
  },
  {
    slug: 'batch-processing',
    title: 'Batch Processing',
    subtitle: 'Spark and friends',
    eyebrow: 'Vol. 05',
    color: '#1D4ED8',
    textColor: '#FFFFFF',
    spineW: 52,
    h: 365,
    chapters: [
      ch('spark-architecture', 'Spark architecture'),
      ch('spark-partitioning', 'Partitioning & shuffles'),
      ch('spark-sql', 'Spark SQL & DataFrames'),
      ch('spark-tuning', 'Tuning Spark jobs'),
    ],
  },
  {
    slug: 'streaming',
    title: 'Streaming',
    subtitle: 'Data that never stops',
    eyebrow: 'Vol. 06',
    color: '#93C5FD',
    textColor: '#172554',
    spineW: 40,
    h: 340,
    chapters: [
      ch('kafka-fundamentals', 'Kafka fundamentals'),
      ch('event-time', 'Event time vs processing time'),
      ch('exactly-once', 'Exactly-once semantics'),
      ch('cdc', 'Change Data Capture'),
    ],
  },
  {
    slug: 'orchestration',
    title: 'Orchestration',
    subtitle: 'Pipelines that run on time',
    eyebrow: 'Vol. 07',
    color: '#475569',
    textColor: '#F8FAFC',
    spineW: 34,
    h: 350,
    chapters: [
      ch('airflow-concepts', 'Airflow concepts'),
      ch('dagster-assets', 'Dagster & software-defined assets'),
      ch('idempotent-pipelines', 'Idempotent pipelines'),
      ch('backfills', 'Backfills'),
    ],
  },
  {
    slug: 'warehouses',
    title: 'Warehouses & Lakehouses',
    subtitle: 'Where analytics lives',
    eyebrow: 'Vol. 08',
    color: '#1E3A8A',
    textColor: '#DBEAFE',
    spineW: 60,
    h: 380,
    chapters: [
      ch('warehouse-vs-lake', 'Warehouse vs data lake'),
      ch('table-formats', 'Lakehouse: Delta, Iceberg, Hudi'),
      ch('snowflake-bigquery', 'Snowflake & BigQuery'),
      ch('dbt', 'dbt for transformations'),
    ],
  },
  {
    slug: 'cloud',
    title: 'Cloud & Infra',
    subtitle: 'Docker, object storage, IaC',
    eyebrow: 'Vol. 09',
    color: '#CBD5E1',
    textColor: '#0F172A',
    spineW: 28,
    h: 320,
    rotZ: -4,
    chapters: [
      ch('docker-for-de', 'Docker for data engineers'),
      ch('object-storage', 'Object storage (S3 / GCS)'),
      ch('iac', 'Infrastructure as code'),
      ch('cloud-cost', 'Cost awareness'),
    ],
  },
  {
    slug: 'data-quality',
    title: 'Data Quality & Ops',
    subtitle: 'Trust your data',
    eyebrow: 'Vol. 10',
    color: '#0369A1',
    textColor: '#FFFFFF',
    spineW: 44,
    h: 355,
    chapters: [
      ch('dq-dimensions', 'Data quality dimensions'),
      ch('data-tests', 'Testing data (dbt tests, Great Expectations)'),
      ch('observability-lineage', 'Observability & lineage'),
      ch('data-contracts', 'Data contracts'),
    ],
  },
  {
    slug: 'interview-prep',
    title: 'Interview Prep',
    subtitle: 'Patterns, systems, stories',
    eyebrow: 'Vol. 11',
    color: '#DBEAFE',
    textColor: '#1E3A8A',
    spineW: 38,
    h: 335,
    chapters: [
      ch('sql-interview-patterns', 'SQL interview patterns'),
      ch('data-system-design', 'System design for data'),
      ch('behavioral', 'Behavioral questions'),
    ],
  },
]

export const findBook = (slug: string) => BOOKS.find((b) => b.slug === slug)
