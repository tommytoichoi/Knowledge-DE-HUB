# Multi-stage build (build nhiều giai đoạn):
#   stage 1 has the full Go toolchain and compiles the binary,
#   stage 2 is a tiny image that only contains that binary.
# Result: a small, secure image (~15 MB instead of ~300 MB) — no Go needed on your machine.

# ---------- Stage 1: build ----------
FROM golang:1.27-alpine AS build
WORKDIR /src

# Download dependencies first so Docker can cache this layer:
# it only re-runs when go.mod / go.sum change, not on every code edit.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
ARG VERSION=dev
# CGO_ENABLED=0 -> fully static binary that runs on a minimal image.
# (Will need to change when DuckDB (cgo) is added in Phase 2.)
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" -o /out/api ./cmd/api

# ---------- Stage 2: run ----------
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/api"]
