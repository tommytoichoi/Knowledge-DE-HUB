// Command api runs the DE Knowledge Hub HTTP API.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/tommytoichoi/Knowledge-DE-HUB/backend/internal/config"
	"github.com/tommytoichoi/Knowledge-DE-HUB/backend/internal/database"
	"github.com/tommytoichoi/Knowledge-DE-HUB/backend/internal/httpapi"
)

// version is overridden at build time: go build -ldflags "-X main.version=v0.1.0"
var version = "dev"

func main() {
	if err := run(); err != nil {
		slog.Error("api stopped with error", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg := config.Load()
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))

	// Cancel ctx on Ctrl+C / SIGTERM so we can shut down gracefully.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.NewRouter(httpapi.Deps{DB: pool, Version: version}),
		ReadHeaderTimeout: 5 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("api listening", "addr", cfg.HTTPAddr, "env", cfg.Env, "version", version)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	slog.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
