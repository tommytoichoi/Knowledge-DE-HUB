// Package httpapi contains the HTTP layer: routing, handlers and middleware.
package httpapi

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Pinger is anything that can check it is reachable (e.g. *pgxpool.Pool).
// Depending on a small interface instead of the concrete pool keeps handlers
// easy to unit-test with a fake.
type Pinger interface {
	Ping(ctx context.Context) error
}

// Deps are the dependencies the handlers need.
type Deps struct {
	DB      Pinger
	Version string
}

// NewRouter builds the HTTP handler tree.
func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Liveness probe: is the process alive? Never touches dependencies.
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte("ok"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", healthHandler(d))
	})

	return r
}
