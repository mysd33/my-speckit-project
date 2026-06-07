<!--
SYNC IMPACT REPORT
==================
Version change: (new) → 1.0.0
Added principles:
  - I. Code Quality
  - II. Testing Standards
  - III. User Experience Consistency
  - IV. Performance Requirements
Removed principles: none (initial ratification)
Templates reviewed:
  - .specify/templates/plan-template.md  ✅ Constitution Check gate aligns with 4 principles
  - .specify/templates/spec-template.md  ✅ Acceptance Scenarios pattern supports UX + testing principles
  - .specify/templates/tasks-template.md ✅ Phase structure supports quality gates and test tasks
Deferred TODOs: none
-->

# my-project Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST meet the following standards before merging:

- Every function, method, or module MUST have a single, clearly defined responsibility (Single Responsibility Principle).
- Code MUST pass all configured linting and formatting checks with zero warnings in CI.
- Pull requests MUST be reviewed by at least one peer before merging; authors MUST NOT self-approve.
- Duplication MUST be refactored into shared abstractions when the same logic appears three or more times.
- Dead code, unused imports, and commented-out blocks MUST be removed before merge.

**Rationale**: Inconsistent quality compounds over time; enforcing objective standards at every PR prevents
technical debt accumulation and keeps onboarding cost low.

### II. Testing Standards (NON-NEGOTIABLE)

Automated testing is a first-class deliverable, not an afterthought:

- Unit test coverage MUST be ≥ 80 % for all new or modified modules; coverage regressions MUST be justified.
- Tests MUST be written before or alongside implementation (test-driven where feasible); no feature is
  considered complete without passing tests.
- Integration tests MUST cover all public API contracts and inter-service boundaries.
- Tests MUST be deterministic: no flaky tests are permitted in the main branch; flaky tests MUST be quarantined
  and fixed within one sprint.
- Test names MUST describe the scenario and expected outcome in plain language
  (e.g., `returns_404_when_resource_not_found`).

**Rationale**: A reliable test suite is the safety net that enables refactoring and confident delivery. Gaps in
coverage are a liability, not a shortcut.

### III. User Experience Consistency

All user-facing surfaces MUST conform to the established design system and interaction patterns:

- UI components MUST be sourced from the project design system; custom one-off components require design review
  and explicit sign-off.
- Navigation flows, error states, loading indicators, and empty states MUST follow documented UX patterns and be
  consistent across all screens or pages.
- Accessibility (WCAG 2.1 AA) MUST be maintained: semantic HTML, keyboard navigation, and sufficient colour
  contrast are non-negotiable.
- Copy, terminology, and tone MUST align with the project content style guide; no inconsistent labels across
  equivalent actions.

**Rationale**: Users build mental models from consistent interfaces. Divergence creates confusion, increases
support burden, and erodes trust.

### IV. Performance Requirements

Shipped features MUST meet measurable performance budgets:

- API endpoint p95 response time MUST be ≤ 200 ms under expected load; endpoints exceeding this MUST include a
  written justification and an optimisation ticket.
- Frontend pages MUST achieve a Lighthouse Performance score ≥ 85 on mobile; regressions below this threshold
  block release.
- Database queries MUST be reviewed for index usage; N+1 query patterns are prohibited.
- Bundles and assets MUST not grow by more than 10 % in a single PR without a documented trade-off decision.

**Rationale**: Performance is a feature. Degraded performance directly harms user experience and retention; clear
budgets make performance regressions visible and actionable.

## Quality Gates

All pull requests MUST satisfy the following gates before merge:

1. **CI green**: all tests pass, lint clean, no coverage regression.
2. **Constitution check**: reviewer confirms each applicable principle is satisfied.
3. **Performance budget**: no Lighthouse or p95 regression without documented justification.
4. **UX review**: any user-facing change has been validated against the design system.

## Development Workflow

- Feature work MUST live on a dedicated branch following the `###-feature-name` naming convention.
- Commit messages MUST follow Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, etc.).
- All merges to the main branch MUST go through a pull request; direct pushes are prohibited.
- Breaking changes MUST be documented in CHANGELOG.md and communicated to affected teams before release.

## Governance

This constitution supersedes all other informal practices. Amendments require:

1. A written proposal describing the change and rationale.
2. Review and approval by at least two project maintainers.
3. A migration plan for any existing code that would violate the amended principle.
4. A version bump following semantic versioning (MAJOR: principle removal/redefinition; MINOR: new principle or
   material expansion; PATCH: clarification or wording fix).

All PR reviews MUST verify compliance with applicable principles. Non-compliance MUST be flagged as a blocking
review comment. Waivers require explicit written justification attached to the PR.

**Version**: 1.0.0 | **Ratified**: 2026-05-31 | **Last Amended**: 2026-05-31
