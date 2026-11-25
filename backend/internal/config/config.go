// Package config loads runtime settings from environment variables.
package config

import "os"

// Config holds every setting the API needs at startup.
type Config struct {
	HTTPAddr    string // address the HTTP server listens on, e.g. ":8080"
	DatabaseURL string // PostgreSQL connection string (OLTP store)
	Env         string // "dev" or "prod"
}

// Load reads the config from env vars, falling back to local-dev defaults
// that match docker-compose.yml.
func Load() Config {
	return Config{
		HTTPAddr:    getenv("HTTP_ADDR", ":8080"),
		DatabaseURL: getenv("DATABASE_URL", "postgres://dehub:dehub@localhost:5432/dehub?sslmode=disable"),
		Env:         getenv("APP_ENV", "dev"),
	}
}

func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
