# Testing Documentation

This document provides comprehensive information about the testing framework and best practices for the SE Customer Portal.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

The SE Customer Portal uses a modern testing stack with Vitest and React Testing Library to ensure code quality, reliability, and maintainability. Our testing strategy includes:

- **Unit Tests**: Test individual functions, hooks, and utilities
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test interactions between components and services
- **E2E Tests**: (Future) Test complete user workflows

## Testing Stack

- **[Vitest](https://vitest.dev/)**: Fast unit test framework powered by Vite
- **[React Testing Library](https://testing-library.com/react)**: Component testing utilities
- **[Testing Library Jest DOM](https://github.com/testing-library/jest-dom)**: Custom matchers for DOM nodes
- **[User Event](https://testing-library.com/docs/user-event/intro/)**: Simulate user interactions
- **[jsdom](https://github.com/jsdom/jsdom)**: Browser environment simulation

## Running Tests

### Available Scripts

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Watch Mode

During development, use watch mode for instant feedback:

```bash
npm test
```

Vitest will re-run tests automatically when files change.

### Coverage Reports

Generate coverage reports to identify untested code:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Visual HTML report
- `coverage/coverage-final.json` - JSON data for CI tools

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Test Structure

### Directory Organization

```
src/
├── components/
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   └── __tests__/
│   │       └── MetricCard.test.tsx
│   └── auth/
│       ├── ProtectedRoute.tsx
│       └── __tests__/
│           └── ProtectedRoute.test.tsx
├── hooks/
│   ├── useAuth.tsx
│   └── __tests__/
│       └── useAuth.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── test/
    ├── setup.ts              # Test setup and global mocks
    ├── testUtils.tsx         # Custom render functions
    └── integration/          # Integration tests
        └── azureMonitor.integration.test.ts
```

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Place tests in `__tests__/` directory next to source files
- Name test files to match source files
- Integration tests: `*.integration.test.ts`

## Writing Tests

### Unit Tests

Unit tests verify individual functions work correctly:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils';

describe('formatCurrency', () => {
  it('should format number as currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});
```

### Component Tests

Component tests verify UI rendering and interactions:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Hook Tests

Test custom hooks with `renderHook`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should provide authentication state', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeDefined();
  });
});
```

### Integration Tests

Integration tests verify interactions between multiple components/services:

```typescript
import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/backend/client';

describe('Azure Monitor Integration', () => {
  it('should fetch subscriptions from Azure', async () => {
    const { data, error } = await supabase.functions.invoke('azure-monitor', {
      body: { action: 'list-subscriptions' },
    });

    if (!error && !data?.error) {
      expect(data.subscriptions).toBeDefined();
      expect(Array.isArray(data.subscriptions)).toBe(true);
    }
  });
});
```

### Mocking

#### Mock Modules

```typescript
vi.mock('@/integrations/backend/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));
```

#### Mock Functions

```typescript
const mockFn = vi.fn();
mockFn.mockResolvedValue({ data: 'test' });
mockFn.mockRejectedValue(new Error('Failed'));
```

#### Mock Implementations

```typescript
vi.mocked(supabase.auth.getSession).mockImplementation(async () => ({
  data: { session: mockSession },
  error: null,
}));
```

## Best Practices

### Test Organization

1. **Arrange, Act, Assert (AAA)**
   ```typescript
   it('should do something', () => {
     // Arrange: Set up test data
     const input = 'test';
     
     // Act: Perform the action
     const result = transform(input);
     
     // Assert: Verify the result
     expect(result).toBe('TEST');
   });
   ```

2. **One assertion per test** (when possible)
   - Makes tests easier to understand
   - Provides clearer error messages

3. **Descriptive test names**
   - Use "should" statements
   - Describe the expected behavior
   - Include context when needed

### Testing Principles

1. **Test behavior, not implementation**
   ```typescript
   // Good: Tests user-facing behavior
   it('should display error message when form is invalid', () => {
     render(<LoginForm />);
     fireEvent.submit(screen.getByRole('form'));
     expect(screen.getByText('Email is required')).toBeInTheDocument();
   });
   
   // Bad: Tests implementation details
   it('should set error state to true', () => {
     const { result } = renderHook(() => useForm());
     result.current.setError(true);
     expect(result.current.hasError).toBe(true);
   });
   ```

2. **Avoid testing implementation details**
   - Don't test internal state
   - Don't test private methods
   - Test the public API

3. **Keep tests simple and focused**
   - One concept per test
   - Avoid complex setup
   - Use helper functions for common tasks

### Performance

1. **Use `beforeEach` for common setup**
   ```typescript
   describe('MyComponent', () => {
     beforeEach(() => {
       vi.clearAllMocks();
     });
   });
   ```

2. **Clean up after tests**
   ```typescript
   afterEach(() => {
     cleanup();
     vi.clearAllMocks();
   });
   ```

3. **Avoid unnecessary async/await**
   ```typescript
   // Only use async when needed
   it('should render immediately', () => {
     render(<Component />);
     expect(screen.getByText('Hello')).toBeInTheDocument();
   });
   ```

### Accessibility Testing

Test components with accessibility in mind:

```typescript
import { axe } from 'vitest-axe'; // If installed

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Or use semantic queries
it('should be accessible via keyboard', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

### Pre-commit Hooks

Use Husky to run tests before commits:

```bash
npm install -D husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

## Troubleshooting

### Common Issues

**Tests timing out**
```typescript
// Increase timeout for slow operations
it('should fetch data', async () => {
  // ...
}, 10000); // 10 second timeout
```

**Module not found errors**
- Check path aliases in `vitest.config.ts`
- Ensure mock paths match actual import paths

**Flaky tests**
- Use `waitFor` for async operations
- Avoid hardcoded timeouts
- Mock unstable dependencies

**Coverage not accurate**
- Check exclude patterns in `vitest.config.ts`
- Ensure all test files are discovered
- Run `npm run test:coverage -- --reporter=verbose`

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)
