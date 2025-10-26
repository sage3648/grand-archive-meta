.PHONY: help build run test clean dev release fmt clippy

help:
	@echo "Grand Archive Meta Backend - Makefile Commands"
	@echo ""
	@echo "  make build     - Build the project in debug mode"
	@echo "  make release   - Build the project in release mode"
	@echo "  make run       - Run the project in debug mode"
	@echo "  make dev       - Run the project with auto-reload (requires cargo-watch)"
	@echo "  make test      - Run all tests"
	@echo "  make fmt       - Format code with rustfmt"
	@echo "  make clippy    - Run clippy linter"
	@echo "  make clean     - Clean build artifacts"
	@echo ""

build:
	cargo build

release:
	cargo build --release

run:
	RUST_LOG=info cargo run

dev:
	RUST_LOG=debug cargo watch -x run

test:
	cargo test

test-all:
	cargo test -- --ignored

fmt:
	cargo fmt

clippy:
	cargo clippy -- -D warnings

clean:
	cargo clean

install-tools:
	cargo install cargo-watch cargo-audit

audit:
	cargo audit

check: fmt clippy test
	@echo "All checks passed!"

docker-build:
	docker build -t grand-archive-meta .

docker-run:
	docker run -p 8080:8080 --env-file .env grand-archive-meta
