package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type fakePinger struct{ err error }

func (f fakePinger) Ping(context.Context) error { return f.err }

func TestHealth(t *testing.T) {
	tests := []struct {
		name         string
		db           Pinger
		wantStatus   string
		wantDatabase string
	}{
		{"database up", fakePinger{}, "ok", "up"},
		{"database down", fakePinger{err: errors.New("connection refused")}, "degraded", "down"},
		{"no database configured", nil, "degraded", "down"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			router := NewRouter(Deps{DB: tc.db, Version: "test"})
			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/health", nil))

			if rec.Code != http.StatusOK {
				t.Fatalf("status code = %d, want 200", rec.Code)
			}
			var got HealthResponse
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decode body: %v", err)
			}
			if got.Status != tc.wantStatus || got.Database != tc.wantDatabase {
				t.Errorf("got %+v, want status=%q database=%q", got, tc.wantStatus, tc.wantDatabase)
			}
		})
	}
}

func TestLiveness(t *testing.T) {
	rec := httptest.NewRecorder()
	NewRouter(Deps{}).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if rec.Code != http.StatusOK || rec.Body.String() != "ok" {
		t.Fatalf("got %d %q, want 200 \"ok\"", rec.Code, rec.Body.String())
	}
}
