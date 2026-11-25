package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// HealthResponse is the JSON body returned by GET /api/v1/health.
type HealthResponse struct {
	Status   string `json:"status"`   // "ok" or "degraded"
	Database string `json:"database"` // "up" or "down"
	Version  string `json:"version"`
}

// healthHandler is a readiness check: it reports whether the API can reach
// its dependencies. It always answers 200 so the UI can show the details;
// "status" tells whether everything is healthy.
func healthHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp := HealthResponse{Status: "ok", Database: "up", Version: d.Version}

		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if d.DB == nil || d.DB.Ping(ctx) != nil {
			resp.Status = "degraded"
			resp.Database = "down"
		}

		writeJSON(w, http.StatusOK, resp)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
