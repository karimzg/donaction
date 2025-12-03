---
name: testing
description: Testing strategy and guidelines
argument-hint: N/A
---

# Testing Guidelines

This document outlines the testing strategies and guidelines for klubr-admin.

## Tools and Frameworks

- Jasmine v5
- Karma v6
- karma-chrome-launcher
- karma-coverage
- karma-jasmine
- karma-jasmine-html-reporter
- @angular/core/testing TestBed
- zone.js/testing

## Testing Strategy

- Unit tests for all components, services, guards, pipes, resolvers, interceptors
- Tests co-located with source files using `.spec.ts` suffix
- TestBed configuration for dependency injection and component testing
- Standalone component testing with imports array
- Basic smoke tests ("should create") for all entities

Types of tests implemented:
- Unit Tests (components, services, guards, pipes, interceptors, resolvers)

## Test Execution Process

- Run tests: `npm test` or `ng test`
- Config in @angular.json under `test` architect section
- Builder: `@angular-devkit/build-angular:karma`
- Polyfills: `zone.js` and `zone.js/testing`
- TypeScript config: @tsconfig.spec.json
- Style language: scss
- Assets: favicon.png, assets folder

## Mocking and Stubbing

- TestBed.configureTestingModule for dependency injection setup
- TestBed.inject() for service instance retrieval
- TestBed.runInInjectionContext() for functional guards/resolvers
- ComponentFixture for component instance access
- fixture.detectChanges() for change detection triggering
- No functional component mocking (per CLAUDE.md rules)
