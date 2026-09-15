# Littora Project Guidelines

## 1. Project Architecture

Littora is a three-tier system:

React Frontend
↓
Node.js / Express API
↓
FastAPI AI Service
↓
Supabase PostgreSQL / Storage

Keep these service boundaries intact.

The frontend should communicate through the Node.js API rather than bypassing the backend to call internal services directly.

AI inference belongs in the FastAPI AI service.

Before changing shared interfaces, inspect affected callers and consumers and preserve existing contracts unless the requested change requires otherwise.

## 2. Code Changes

Make the smallest correct change required by the task.

Do not:

* refactor unrelated code
* reformat unrelated files
* rename unrelated symbols
* rewrite whole modules for localized fixes
* introduce abstractions without a concrete need
* change public interfaces without justification

Preserve existing behavior outside the requested scope.

For cross-service changes, verify the complete affected data flow rather than modifying only one side of the interface.

## 3. Database and Supabase

All schema changes must use incremental migrations:

supabase/migrations/<timestamp>_<name>.sql

Never use ad-hoc production DDL.

Do not weaken Row Level Security to make a query pass.

Security-sensitive views must preserve the project's security-invoker design where required.

For application-side data operations:

* use the existing Node.js / Supabase client patterns
* keep privileged service credentials server-side
* never expose service keys or other secrets to frontend code
* make scripts deterministic and safely rerunnable where practical

## 4. Authentication and Authorization

Treat authentication and authorization as security-sensitive.

When modifying authentication or protected resources, trace the relevant flow across:

Frontend auth/session
↓
Backend middleware
↓
Routes/services
↓
Supabase integration
↓
Ownership / role checks
↓
Protected resource

Always distinguish:

Authenticated != Authorized

Verify relevant success and failure paths, including:

* missing or invalid credentials
* expired credentials
* unauthorized access
* ownership violations
* role restrictions

Never log passwords, tokens, service keys, or other secrets.

## 5. AI Service

The FastAPI AI service uses the existing pytest-based testing stack.

Prefer tests that exercise real application behavior rather than excessive mocking.

When modifying inference, model selection, preprocessing, or model fallback behavior, cover both normal and failure paths.

The AI service must preserve:

* normalized detection output
* safe model resolution and fallback behavior
* correct bounding-box handling
* appropriate error responses for invalid input
* existing concurrency and thread-safety guarantees

When fixing a bug, add or strengthen a regression test that would fail if the bug returns.

## 6. UI Invariants

Detection images must never be cropped during inspection.

Use:

object-fit: contain;

Use the existing BoundingBoxImage.jsx flow for normalized YOLO bounding boxes and category badges.

For multi-scan map inspection:

* severity should reflect the worst relevant analysis
* all individual analyses at the location must remain accessible
* each scan should expose its thumbnail, severity, score, timestamp, and inspection action

Do not hide non-peak scans.

## 7. Authentic Data and Role Scoping

Never fabricate application data.

Do not introduce:

* fake analyses
* fake GPS coordinates
* fabricated map markers
* synthetic severity values presented as real data
* hardcoded statistics presented as live data

When real records do not exist, use an authentic empty state.

For /api/stats, regular users must receive only data permitted by the authorization model, including their own scan locations.

Do not substitute global location data for user-scoped location data.

Administrative views may expose global data only where explicitly authorized by the existing role model.

## 8. Testing

Run tests proportionate to the change.

For small changes, run targeted tests.

For cross-module, security, or schema changes, run targeted tests followed by broader relevant tests.

Do not report test results or counts that were not actually verified.

For bug fixes, ensure the regression is covered by an appropriate test.

## 9. Documentation

Update relevant project documentation when externally visible behavior, setup, configuration, APIs, or major capabilities change.

Relevant documentation includes:

* README.md
* backend/README.md
* frontend/README.md
* ai-service/README.md

Do not update documentation merely because an internal implementation changed unless the documented behavior is affected.

## 10. Dependencies and Environment

Before adding a dependency:

1. Check whether the existing stack already provides the required capability.
2. Prefer the project's established dependencies.
3. Verify compatibility where necessary.
4. Avoid dependencies for trivial functionality.
5. Update manifests and relevant documentation.
6. Run relevant tests.

Never commit:

* .env
* API keys
* service keys
* passwords
* tokens
* private credentials

Use environment variables and .env.example.

## 11. Git

Never commit or push without explicit user approval.

Do not create intermediate commits autonomously.

Before requesting commit approval:

* inspect the final diff
* verify relevant tests
* check documentation when required
* check for secrets or accidental files

Do not push unless explicitly requested.

Use human-readable commit titles and concise bullets rather than conventional commit prefixes.

## 12. Error Diagnosis

For bugs and failures:

Reproduce
↓
Locate failing boundary
↓
Inspect actual inputs and outputs
↓
Identify root cause
↓
Fix root cause
↓
Add regression coverage
↓
Retest

Do not suppress failures merely to make the application appear healthy.

Avoid broad exception handling unless it provides a meaningful recovery strategy.

## 13. Current Source Over Historical Context

For current implementation behavior, trust the repository and tests over stale historical information.

For project decisions and historical rationale, use persistent project context when available.

When an existing project decision conflicts with the current user request, follow the user's latest explicit requirement unless doing so would violate a higher-priority security or architectural constraint.

## 14. Tool Chain

For any task that involves tracing, understanding, or explaining relationships
between files, symbols, callers, callees, execution paths, or dependencies —
use this sequence:

Memory MCP first (historical context and architectural decisions)
↓
CodeGraph MCP (symbol search, callers, callees, execution paths, working set)
↓
Targeted view_file on files CodeGraph identified
↓
Determine approach and act

Do not use list_dir, find_by_name, grep_search, or broad filesystem discovery
to locate files or symbols that CodeGraph can identify.

list_dir chains are broad filesystem discovery. They are forbidden as a
substitute for CodeGraph when CodeGraph can answer the question.

Use filesystem search only when CodeGraph is unavailable or explicitly
cannot answer the question.
