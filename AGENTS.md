# AGENTS.md

## 1. Core Operating Hierarchy

Follow this order for every task:

```text
1. Follow the user's request and constraints
2. Determine the task type
3. Use Memory only when prior project context matters
4. Use CodeGraph for repository discovery
5. Read only relevant files
6. Use WebSearch only for external/current information
7. Make the smallest correct change
8. Run proportionate validation/tests
9. Update required documentation
10. Never commit or push without explicit approval
```

Use the minimum tools necessary. Do not invoke a tool merely because it is available.

---

# 2. Tool Selection

## 2.1 Memory MCP

Memory stores **durable project context**, not source code.

Use Memory when the task depends on:

* Previous architecture decisions
* Design decisions
* Important project constraints
* Established conventions
* Technology choices
* Approved implementation approaches
* Important debugging conclusions
* Decisions made in previous sessions
* Durable user preferences for this repository

Examples:

```text
"What architecture did we decide on?"
"Why did we choose this approach?"
"What constraints should I remember?"
"What did we decide about authentication?"
```

### Do not use Memory unnecessarily

Do not query Memory for simple implementation questions when the answer is present in the repository.

Do not store:

* Source-code files or large snippets
* Temporary logs
* Build output
* Trivial implementation details
* Guesses
* Unverified assumptions
* Secrets, passwords, tokens, API keys, or credentials

### Memory authority

For current implementation:

```text
Repository > Memory
```

For the latest explicit user instruction:

```text
Latest user instruction > Older Memory
```

If Memory is stale, update or supersede it when appropriate.

### Writing Memory

Only store concise, verified, durable facts.

```text
Investigate → Verify → Store durable conclusion
```

Do not permanently store speculation.

---

# 3. CodeGraph

CodeGraph is the primary tool for discovering the repository.

Use it first for:

* Unknown files or symbols
* Function/class discovery
* Call chains
* Dependency relationships
* Data flow
* Architecture discovery
* Impact analysis
* Cross-file relationships
* Tracing APIs and services

Preferred flow:

```text
CodeGraph
    ↓
Identify relevant symbols/files
    ↓
Read those files directly
    ↓
Reason from actual implementation
```

Do not scan the entire repository when targeted discovery is sufficient.

### Skip CodeGraph

If the user gives an exact file and location and no dependency or relationship analysis is required, read the file directly.

### Fallback

If CodeGraph fails, times out, or is insufficient:

```text
Targeted filesystem/search tools
    ↓
Targeted file reads
```

Do not repeatedly retry a failing tool unnecessarily.

---

# 4. WebSearch

WebSearch is for **external, current, or independently verified information**.

## Use WebSearch when:

* The user explicitly asks for web research
* Current documentation is required
* Current API behavior matters
* Latest package/version information matters
* Compatibility needs verification
* External service behavior needs confirmation
* Current security guidance is needed
* Repository information is insufficient

## Do not use WebSearch for ordinary repository questions

For:

```text
"How does this API work?"
"How does auth work?"
"Where is this function called?"
"Trace the upload flow."
"Why does this component behave this way?"
```

use:

```text
CodeGraph → targeted file reads → answer
```

Do not search generic documentation merely because terms such as FastAPI, Supabase, React, Express, YOLO, or PyTorch appear in the question.

## External dependency verification

When external behavior matters:

```text
Inspect local implementation
    ↓
Identify exact external behavior needed
    ↓
Search authoritative documentation
    ↓
Compare with local implementation
```

Clearly distinguish:

```text
What this repository does
```

from:

```text
What the external dependency supports/recommends
```

Prefer official documentation and primary sources.

Cite external sources when they materially contribute to the answer.

---

# 5. Standard Investigation Strategy

For non-trivial tasks:

```text
Understand request
    ↓
Determine whether it is:
  - local
  - external/current
  - mixed
    ↓
Use Memory if historical context matters
    ↓
Use CodeGraph for repository discovery
    ↓
Read relevant files
    ↓
Form a concrete hypothesis
    ↓
Make the smallest correct change
    ↓
Run targeted validation
    ↓
Run broader tests when risk warrants it
    ↓
Update documentation when required
```

Avoid unnecessary parallel tool calls, repository scans, and repeated reads.

---

# 6. Code Change Discipline

Make the smallest change that solves the requested problem.

Do not:

* Refactor unrelated code
* Reformat unrelated files
* Rename unrelated symbols
* Replace working dependencies without justification
* Rewrite whole modules for localized problems
* Introduce abstractions without a concrete need
* Change public interfaces unless required

Before changing shared logic, inspect relevant callers and consumers.

Preserve existing behavior outside the requested scope.

---

# 7. Supabase Database Schema

All schema changes must use incremental migrations:

```text
supabase/migrations/<timestamp>_<name>.sql
```

Never execute ad-hoc production DDL.

Pushing migrations to GitHub is the deployment mechanism for Supabase schema changes in this project.

## Views and RLS

Security-sensitive views such as:

```text
vw_analysis_details
```

must use:

```sql
WITH (security_invoker = true)
```

where required by the security architecture.

Never weaken RLS simply to make a query pass.

---

# 8. Supabase Data Operations

For DML, updates, and batch backfills:

* Use Node.js scripts
* Use `@supabase/supabase-js`
* Load environment variables with `dotenv/config`
* Use the service key only for server-side privileged operations
* Never expose service credentials to frontend code

Scripts should be deterministic and safe to rerun where practical.

---

# 9. Authentication and Security

Treat authentication and authorization as security-sensitive.

When modifying or investigating authentication:

```text
Frontend auth state
    ↓
Login/session handling
    ↓
Backend middleware
    ↓
Routes/services
    ↓
Supabase integration
    ↓
Authorization / ownership / roles
    ↓
Protected resources
```

Verify authentication and authorization separately.

Do not assume:

```text
Authenticated = Authorized
```

Test:

* Valid authentication
* Missing authentication
* Invalid/expired credentials
* Unauthorized access
* Ownership violations
* Role restrictions
* Failure paths

Never log passwords, tokens, service keys, or secrets.

---

# 10. AI Service Testing

The FastAPI + PyTorch service should use:

* `pytest`
* `pytest-asyncio`
* `httpx`
* `ASGITransport`
* Shared fixtures in `conftest.py`
* `@pytest.mark.parametrize` where useful

Prefer tests that exercise real application behavior over excessive mocking.

Cover:

* Successful requests
* Invalid input
* Unauthorized requests
* Missing resources
* Malformed payloads
* Boundary conditions
* Error handling
* Model/inference failures
* Relevant integration paths

---

# 11. Test Veracity

Tests must verify application behavior rather than mock configuration.

Avoid tautologies such as:

```text
assert mock.return_value == mock.return_value
```

Tests should fail when real application logic is intentionally broken.

Prefer:

* Real HTTP status assertions
* Real response assertions
* Negative-path tests
* Boundary tests
* Unauthorized access tests
* Regression tests
* Mutation-resistant checks

When fixing a bug, add or strengthen a test that would catch the regression.

---

# 12. UI and Lightbox Invariants

Photo inspection modals must never crop images.

Use:

```css
object-fit: contain;
```

Use `BoundingBoxImage.jsx` for normalized YOLO bounding boxes and category badges.

## Map Multi-Scan Inspection

When multiple analyses share a geographic coordinate or label:

* Pin color reflects peak/worst severity.
* Popup shows every individual analysis.
* Each scan includes:

  * Thumbnail
  * Severity
  * Score
  * Timestamp
  * Inspection action

Never hide non-peak scans.

---

# 13. Authentic Data and Role Scoping

Never fabricate application data.

Do not create:

* Phantom map markers
* Fake analyses
* Hardcoded scores presented as real data
* Synthetic severities
* Fake GPS records

When real records do not exist, render an authentic empty state.

## `/api/stats`

Regular users must receive:

```text
Personal statistics
+
Only their own scan locations
```

Never replace:

```text
userStats.locations
```

with:

```text
globalStats.locations
```

Administrators may receive global platform data according to the authorization model.

UI titles/subtitles must dynamically reflect the active role.

---

# 14. Multi-Agent Work

When a task has genuinely independent domains, parallelize them.

Typical domains:

```text
Frontend
Backend
AI Service
Database
Testing
Documentation
```

Do not parallelize tightly coupled edits that are likely to conflict.

After parallel work:

```text
Review findings
    ↓
Resolve inconsistencies
    ↓
Integrate changes
    ↓
Run validation
```

---

# 15. Documentation

When capabilities or behavior change, update the relevant documentation before committing.

Relevant files:

```text
README.md
backend/README.md
frontend/README.md
ai-service/README.md
```

Keep documentation synchronized with:

* Features
* Directory structure
* Configuration
* APIs
* Setup instructions
* Testing instructions

Only report test counts that were actually verified.

---

# 16. Git

Never commit or push without explicit user approval.

Do not create intermediate commits autonomously.

Before requesting approval to commit:

```text
Changes complete
    ↓
Documentation updated
    ↓
Tests run
    ↓
Final diff inspected
    ↓
Secrets/accidental files checked
    ↓
Ask for explicit commit approval
```

Do not push unless explicitly requested.

## Commit messages

Do not use conventional prefixes such as:

```text
feat:
fix:
chore:
refactor:
```

Use a human-readable title followed by concise bullets.

Example:

```text
Harden authentication across protected API routes

- Validate authenticated users in middleware
- Enforce ownership checks for analysis records
- Add unauthorized access tests
- Update backend documentation
```

---

# 17. Dependencies and Environment

Before adding a dependency:

1. Check whether existing dependencies already solve the problem.
2. Prefer the project's current stack.
3. Verify compatibility when required.
4. Avoid dependencies for trivial functionality.
5. Update manifests and documentation.
6. Run relevant tests.

Never commit:

```text
.env
API keys
Service keys
Passwords
Tokens
Private credentials
```

Use environment variables and `.env.example`.

---

# 18. Error Diagnosis

Use:

```text
Reproduce
    ↓
Locate failing boundary
    ↓
Inspect actual inputs/outputs
    ↓
Identify root cause
    ↓
Fix root cause
    ↓
Add regression coverage
    ↓
Retest
```

Do not hide failures simply to make the application appear healthy.

Avoid broad exception handling without a meaningful recovery strategy.

---

# 19. Final Tool Decision Matrix

| Request                                                       | Primary           | Secondary                                        |
| ------------------------------------------------------------- | ----------------- | ------------------------------------------------ |
| How does our API work?                                        | CodeGraph + files | Memory if historical context matters             |
| How does auth work?                                           | CodeGraph + files | WebSearch for current external/security guidance |
| Where is this function used?                                  | CodeGraph         | Targeted file reads                              |
| Trace request/data flow                                       | CodeGraph         | Targeted file reads                              |
| Why did we choose this architecture?                          | Memory            | Repository                                       |
| What decision did we make previously?                         | Memory            | Repository                                       |
| What does current Supabase documentation recommend?           | WebSearch         | Repository                                       |
| Is our implementation aligned with current Supabase guidance? | CodeGraph + files | WebSearch                                        |
| What is the latest package/API behavior?                      | WebSearch         | Repository                                       |
| Exact file/location edit                                      | Direct file read  | Tests                                            |
| Memory conflicts with current code                            | Repository        | Memory                                           |

---

# 20. Core Source-of-Truth Model

Always use each source for the job it is best at:

```text
CODEGRAPH
"What code exists and how is it connected?"

MEMORY
"What durable context, decisions, and constraints do we remember?"

FILES
"What does the actual source text say?"

WEBSEARCH
"What does the current external world/documentation say?"
```

Priority for current implementation:

```text
Actual repository
    >
Memory
```

Priority for current user intent:

```text
Latest explicit user instruction
    >
Older project context
```

Never use a more expensive or broader tool when a narrower reliable source is sufficient.
