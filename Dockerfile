FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN GOFLAGS=-mod=mod GOTOOLCHAIN=auto go mod download

COPY . .
RUN GOTOOLCHAIN=auto go build -o server cmd/server/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
COPY migrations/ ./migrations/

EXPOSE 8080
CMD ["./server"]
