---
title: OLTP vs OLAP
tags: [databases, fundamentals, postgres, duckdb, interview]
level: beginner
status: published
updated: 2026-11-25
---

# OLTP vs OLAP

Every database is optimized for a **workload** (kiểu tải công việc: loại truy vấn
mà hệ thống phải chạy nhiều nhất). The two big families are OLTP and OLAP. Knowing
which is which explains most architecture decisions in Data Engineering.

## TL;DR

| | OLTP | OLAP |
|---|---|---|
| Stands for | Online **Transaction** Processing | Online **Analytical** Processing |
| Typical query | "Get / update order #123" | "Revenue per country per month for 3 years" |
| Rows touched per query | A few | Millions to billions |
| Query mix | Many small reads **and writes** | Few large reads, bulk loads |
| Concurrency | Thousands of users at once | A handful of analysts / jobs |
| Storage layout | **Row-oriented** | **Column-oriented** (columnar) |
| Schema style | Normalized (3NF) | Denormalized (star schema, wide tables) |
| Examples | PostgreSQL, MySQL, SQL Server, Oracle, SQLite | DuckDB, Snowflake, BigQuery, ClickHouse, Redshift |
| In this hub | Notes, users, progress, quiz attempts | Learning stats, search, SQL playground |

## 1. Storage layout: rows vs columns

Take this table:

| id | user | topic | score |
|---|---|---|---|
| 1 | an | sql | 8 |
| 2 | bo | spark | 6 |
| 3 | an | kafka | 9 |

**Row store** (Postgres) writes each row contiguously on disk, in 8 KB *pages*:

```
page: [1, an, sql, 8] [2, bo, spark, 6] [3, an, kafka, 9]
```

**Column store** (DuckDB) writes each column contiguously:

```
id:    [1, 2, 3]
user:  [an, bo, an]
topic: [sql, spark, kafka]
score: [8, 6, 9]
```

Now compare two queries:

- `SELECT * FROM attempts WHERE id = 2` — the row store reads **one page** (helped by a
  B-tree index). The column store must stitch the row back together from 4 places.
  → **Row store wins.**
- `SELECT avg(score) FROM attempts` over 100M rows — the row store reads **every column
  of every row** even though it needs only one. The column store reads **only `score`**.
  → **Column store wins**, often by 10–100×.

## 2. Why columnar engines are so fast at analytics

1. **Less I/O** — read only the columns the query mentions.
2. **Compression** — a column holds values of one type that often repeat
   (`topic = sql, sql, sql…`), so encodings like dictionary or run-length (RLE: lưu
   "sql × 1000" thay vì lặp 1000 lần) shrink it a lot. Less data to read.
3. **Vectorized execution** (thực thi theo vector) — instead of processing one row at a
   time, the engine processes a batch of values (DuckDB: 2048 per vector) in a tight
   loop that CPUs execute very efficiently.
4. **Zone maps / min-max indexes** — DuckDB stores the min and max of each column per
   *row group* (~122k rows). `WHERE score > 9` can skip whole row groups whose max ≤ 9.

## 3. Why row stores are better for transactions

1. **Cheap single-row writes** — an `INSERT` appends one row to one page. A column store
   must touch every column file.
2. **B-tree indexes** — find one row among billions in a few page reads.
3. **High concurrency** — Postgres uses **MVCC** (Multi-Version Concurrency Control:
   mỗi transaction thấy một "phiên bản" dữ liệu riêng, nên đọc không chặn ghi) and row-level
   locks, so thousands of clients can read and write at the same time.
4. **Durability** — every change goes to the **WAL** (Write-Ahead Log: ghi nhật ký trước
   khi ghi dữ liệu thật) so a crash never loses a committed transaction.

## 4. Architecture: client/server vs embedded

| | PostgreSQL | DuckDB |
|---|---|---|
| Runs as | A separate **server** process; apps connect over the network | A **library** inside your process (in-process / embedded), like SQLite |
| Data lives in | A data directory managed by the server | A single `.duckdb` file (or just memory) |
| Concurrent writers | Many clients | **One read-write process** per file (many read-only processes are OK) |
| Reads files directly | Needs extensions / `COPY` | Yes: `SELECT * FROM 'data/*.parquet'`, CSV, JSON, S3 |

DuckDB is often called "SQLite for analytics".

## 5. Schema design follows the workload

- **OLTP → normalized** (3NF: mỗi thông tin chỉ lưu ở một chỗ). `users`, `notes`,
  `quiz_attempts` in separate tables joined by keys. Updates touch one place, no
  duplicated data to keep in sync.
- **OLAP → denormalized**: a **star schema** — one big *fact* table (events,
  measurements, e.g. `fact_quiz_attempt`) surrounded by *dimension* tables (who, what,
  when: `dim_user`, `dim_topic`, `dim_date`). Fewer joins, faster scans; duplication is
  fine because data is loaded in bulk, not updated row by row.

## 6. How they connect: the data pipeline

In real companies OLTP and OLAP are **different systems** joined by pipelines:

```
App DBs (OLTP) ──extract──▶ transform ──load──▶ Warehouse (OLAP) ──▶ BI / ML
   Postgres        ETL / ELT, or CDC              Snowflake, BigQuery, DuckDB
```

- **ETL** — transform before loading. **ELT** — load raw, transform inside the warehouse
  (e.g. with dbt). ELT is the modern default because warehouses are cheap and powerful.
- **CDC** (Change Data Capture: bắt từng thay đổi INSERT/UPDATE/DELETE từ log của DB
  nguồn) — stream changes from the Postgres WAL (e.g. Debezium) instead of copying full
  tables.

Running heavy analytics directly on the production OLTP database is a classic mistake:
a big scan competes with user transactions and slows the app down.

**This hub copies that pattern in miniature:** Postgres (app data) → sync job →
DuckDB (analytics). See [ADR-0001](../docs/adr/0001-postgres-oltp-duckdb-olap.md).

## 7. Try it yourself

Install the [DuckDB CLI](https://duckdb.org/docs/installation/), then:

```sql
-- 10 million fake quiz attempts, generated in a second or two
CREATE TABLE attempts AS
SELECT
    range                          AS id,
    (random() * 1000)::INT         AS user_id,
    ['sql','spark','kafka','dbt','airflow'][floor(random() * 5)::INT + 1] AS topic,
    (random() * 10)::INT           AS score
FROM range(10_000_000);

.timer on
SELECT topic, avg(score), count(*) FROM attempts GROUP BY topic;   -- analytic query
SELECT * FROM attempts WHERE id = 4242;                            -- point lookup
EXPLAIN ANALYZE SELECT avg(score) FROM attempts;                   -- see the plan
```

Then do the same in Postgres (`docker compose up -d` in the repo root):

```sql
CREATE TABLE attempts AS
SELECT
    g                              AS id,
    (random() * 1000)::INT         AS user_id,
    (ARRAY['sql','spark','kafka','dbt','airflow'])[floor(random() * 5)::INT + 1] AS topic,
    (random() * 10)::INT           AS score
FROM generate_series(1, 10000000) AS g;

\timing on
SELECT topic, avg(score), count(*) FROM attempts GROUP BY topic;
CREATE INDEX ON attempts (id);
SELECT * FROM attempts WHERE id = 4242;
```

Compare the timings. Expect DuckDB to win the `GROUP BY` clearly, and Postgres (with the
index) to be just as fast or faster for the single-row lookup.

## Interview questions

1. What is the difference between OLTP and OLAP? Give an example query for each.
2. Why does a columnar database read less data for `SELECT avg(price) FROM sales`?
3. Why is a column store bad at frequent single-row `UPDATE`s?
4. Why shouldn't you run heavy reports directly on the production database? What do
   you do instead?
5. Normalized schema vs star schema — when do you use which?
6. What is CDC and why is it preferred over nightly full-table copies?
