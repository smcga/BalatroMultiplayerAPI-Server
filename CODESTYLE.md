# Balatro Multiplayer API Server Code Style Guide

This document captures the existing coding patterns observed in the TypeScript server so future contributions remain consistent. Each rule is numbered for easy reference, using the BMPSTS prefix (Balatro Multiplayer Server TypeScript Style) and increments of 10 to leave room for future additions.

## BMPSTS0010 – Formatting
- Use the Biome formatter defaults: tab-based indentation (rendered at two-space width) and Unix line endings. 【F:biome.json†L9-L14】
- Prefer single quotes for strings and rely on semicolons only where the formatter requires them ("as needed"). 【F:biome.json†L15-L18】【F:src/main.ts†L1-L41】
- Keep logical separation between sections of a file with blank lines (e.g., imports, constants, functions). 【F:src/main.ts†L1-L88】
- Place braces on the same line as declarations for functions, classes, and control blocks (K&R style). 【F:src/main.ts†L49-L142】【F:src/Client.ts†L43-L99】
- Use multiline formatting for long argument lists or object literals to keep related fields aligned and readable. 【F:src/main.ts†L4-L31】【F:src/actionHandlers.ts†L100-L178】
- Document constants or non-trivial logic with `/** ... */` blocks when extra context is helpful; use `//` inline comments for local clarifications or TODOs. 【F:src/main.ts†L36-L41】【F:src/actionHandlers.ts†L94-L130】

## BMPSTS0020 – Naming Conventions
- Name classes and type aliases with PascalCase (e.g., `Client`, `ActionHandlerArgs`). 【F:src/Client.ts†L14-L102】【F:src/actions.ts†L1-L120】
- Use camelCase for functions, variables, and methods; reserve UPPER_SNAKE_CASE for constants that represent configuration values. 【F:src/utils.ts†L1-L11】【F:src/main.ts†L34-L41】
- Mirror domain terminology in action and handler names (`sendAction`, `readyLobbyAction`) to make intent obvious. 【F:src/actionHandlers.ts†L32-L117】【F:src/Client.ts†L50-L99】
- Keep file names aligned with the primary export (e.g., `Client.ts` exports the `Client` class, `Lobby.ts` exports `Lobby`). 【F:src/Client.ts†L14-L102】【F:src/Lobby.ts†L31-L187】
- Preserve existing API-driven casing for payload fields (such as `reroll_count`) even when it diverges from camelCase. 【F:src/actions.ts†L34-L120】

## BMPSTS0030 – Language Constructs & Syntax
- Group imports with Node/built-in modules first, followed by external packages and then project-local modules. 【F:src/main.ts†L1-L3】【F:src/Client.ts†L1-L5】
- Define reusable behaviors as `const` arrow functions rather than function declarations to emphasize immutability of references. 【F:src/actionHandlers.ts†L32-L178】【F:src/main.ts†L53-L106】
- Use strict equality unless matching legacy payloads; coerce types explicitly when converting request data. 【F:src/actionHandlers.ts†L167-L178】【F:src/Lobby.ts†L160-L168】
- Prefer `try/catch` around network-parsed data and respond with structured error actions rather than throwing. 【F:src/main.ts†L151-L205】
- Lean on TypeScript utility types (e.g., `Omit`, discriminated unions) to model protocol messages precisely. 【F:src/actions.ts†L92-L156】【F:src/actions.ts†L168-L204】

## BMPSTS0040 – Code Structure & Organization
- Place runtime source in `src/` with one primary responsibility per file (client model, lobby, handlers, entrypoint). 【F:src/main.ts†L1-L205】【F:src/Lobby.ts†L31-L187】
- Keep the socket entrypoint (`main.ts`) focused on connection lifecycle while delegating gameplay logic to specialized modules. 【F:src/main.ts†L88-L205】【F:src/actionHandlers.ts†L32-L200】
- Expose domain objects via default exports (`Client`, `Lobby`) and aggregate behavior (like handlers) as named exports for straightforward imports. 【F:src/Client.ts†L14-L102】【F:src/actionHandlers.ts†L32-L200】
- Encapsulate shared helpers (such as lobby lookups or seed generation) in dedicated utilities to avoid duplication. 【F:src/Lobby.ts†L11-L29】【F:src/utils.ts†L1-L11】
- Favor small, composable handler functions that each process a single action type to keep switch statements in the entrypoint readable. 【F:src/main.ts†L165-L320】【F:src/actionHandlers.ts†L32-L260】

## BMPSTS0050 – Documentation & Comments
- Provide JSDoc-style comments for exported constants or behaviors whose purpose might not be obvious to new contributors. 【F:src/main.ts†L36-L41】【F:src/actionHandlers.ts†L44-L46】
- Use inline `//` comments sparingly to capture business rules, TODOs, or protocol caveats; keep them on their own line above the affected code. 【F:src/actionHandlers.ts†L94-L130】【F:src/Lobby.ts†L132-L169】
- When suppressing Biome rules, include a short justification so future cleanups know why the ignore is necessary. 【F:src/main.ts†L60-L61】【F:src/Client.ts†L10-L12】
- Let self-documenting code speak for itself; prefer renaming variables or extracting helpers over excessive commentary. The current handlers demonstrate this by using descriptive function names and minimal inline notes. 【F:src/actionHandlers.ts†L32-L117】

## BMPSTS0060 – Error Handling & Logging
- Log network events and parsing errors with `console.log`/`console.error` to aid operational debugging while keeping message formats structured. 【F:src/main.ts†L98-L163】【F:src/main.ts†L200-L210】
- Reply to clients with explicit error actions instead of closing sockets whenever validation fails. 【F:src/actionHandlers.ts†L52-L61】【F:src/main.ts†L200-L210】
- Distinguish between expected and unexpected socket errors, warning on transient issues (e.g., ECONNRESET) and logging all others. 【F:src/main.ts†L230-L252】
- Guard gameplay logic with early returns when lobby state is incomplete to avoid cascading failures. 【F:src/actionHandlers.ts†L151-L205】【F:src/Lobby.ts†L64-L109】

## BMPSTS0070 – Testing Standards
- The repository currently lacks automated tests or a test npm script, so new features should introduce targeted TypeScript unit tests alongside the modules they cover. 【F:package.json†L3-L19】
- Co-locate tests with their subject module (e.g., `src/__tests__/Lobby.test.ts`) and name them after the behavior under test for clarity. *(Convention inferred from existing module organization.)*
- Favor deterministic inputs (mocked sockets, seeded RNG) to keep networking logic testable without relying on live connections. 【F:src/utils.ts†L1-L11】【F:src/main.ts†L107-L148】
- Assert both state changes and emitted actions so regressions in client communication are caught early. 【F:src/Client.ts†L50-L99】【F:src/actionHandlers.ts†L172-L205】

## BMPSTS0080 – Performance & Security Guidelines
- Use `socket.setNoDelay()` and keep-alive timers to minimize latency and detect stale connections promptly. 【F:src/main.ts†L107-L141】
- Normalize and validate incoming data (e.g., converting scores to `InsaneInt`, parsing booleans) before mutating server state. 【F:src/main.ts†L60-L77】【F:src/actionHandlers.ts†L167-L178】
- Avoid exposing lobby state to unauthorized clients by verifying membership before broadcasting sensitive updates. 【F:src/Lobby.ts†L145-L169】【F:src/actionHandlers.ts†L151-L205】
- Do not store secrets in the repo; configuration is limited to gameplay settings and network parameters. *(Validated by repository contents.)*

## BMPSTS0090 – Tooling & Automation
- Run Biome for linting, import organization, and formatting; its configuration lives at the repo root. 【F:biome.json†L1-L26】
- Compile TypeScript with `npm run build` (tsc) and use `npm run dev` (tsx watch) for iterative work; `build.js`/`build.sh` bundle server artifacts. 【F:package.json†L3-L19】
- Keep generated output (e.g., `dist/`) out of version control as configured in Biome's ignore list. 【F:biome.json†L6-L8】
- During reviews, confirm new handlers are wired through `actionHandlers` and the entrypoint switch to maintain protocol coverage. 【F:src/main.ts†L165-L320】【F:src/actionHandlers.ts†L32-L260】

## BMPSTS0100 – Philosophy & Guiding Principles
- Prioritize clarity over cleverness: handlers are straightforward, state mutations are explicit, and logging narrates multiplayer flow. 【F:src/actionHandlers.ts†L32-L205】【F:src/main.ts†L98-L205】
- Keep protocol compatibility stable; new actions should extend the discriminated unions without breaking existing clients. 【F:src/actions.ts†L1-L204】
- Treat the lobby and client classes as the single source of truth for session state, and keep cross-module communication through their public methods. 【F:src/Client.ts†L14-L102】【F:src/Lobby.ts†L31-L187】
- Favor incremental improvements with clear TODOs that document future refactors (e.g., multi-player support) instead of speculative rewrites. 【F:src/actionHandlers.ts†L94-L145】【F:src/Lobby.ts†L64-L109】

