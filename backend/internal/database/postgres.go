// Package database wires up connections to the hub's data stores.
package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresPool creates a connection pool for PostgreSQL.
//
// A pool (bể kết nối) keeps a few open connections and reuses them, instead of
// opening a new TCP connection for every query. pgxpool connects lazily, so the
// API can still start (and report "database: down") if Postgres is not up yet.
func NewPostgresPool(ctx context.Context, url string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		return nil, fmt.Errorf("parse DATABASE_URL: %w", err)
	}
	cfg.MaxConns = 10
	cfg.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create postgres pool: %w", err)
	}
	return pool, nil
}
