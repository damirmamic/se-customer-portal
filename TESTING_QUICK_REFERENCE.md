# Quick Testing Reference

Common testing patterns and examples for the SE Customer Portal.

## Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Testing User Interactions

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/testUtils';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should handle clicks', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Forms

```typescript
import { render, screen } from '@/test/testUtils';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should submit with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
  
  it('should show validation errors', async () => {
    render(<LoginForm />);
    
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
});
```

## Testing Async Operations

```typescript
import { render, screen, waitFor } from '@/test/testUtils';
import { DataLoader } from '../DataLoader';

describe('DataLoader', () => {
  it('should load and display data', async () => {
    render(<DataLoader />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });
  });
});
```

## Testing Custom Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useData } from '../useData';

describe('useData', () => {
  it('should fetch data', async () => {
    const { result } = renderHook(() => useData());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Mocking Modules

```typescript
// Mock the entire module
vi.mock('@/integrations/backend/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Use the mock
import { supabase } from '@/integrations/backend/client';

vi.mocked(supabase.auth.getSession).mockResolvedValue({
  data: { session: mockSession },
  error: null,
});
```

## Testing with Context

```typescript
import { render } from '@/test/testUtils';
import { AuthProvider } from '@/hooks/useAuth';

const wrapper = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('Component with Auth', () => {
  it('should access auth context', () => {
    render(<MyComponent />, { wrapper });
    // Test component that uses useAuth
  });
});
```

## Snapshot Testing

```typescript
import { render } from '@/test/testUtils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should match snapshot', () => {
    const { container } = render(<MyComponent />);
    expect(container).toMatchSnapshot();
  });
});
```

## Testing Error States

```typescript
describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

## Testing Loading States

```typescript
describe('DataComponent', () => {
  it('should show loading state', () => {
    render(<DataComponent loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('should show data when loaded', () => {
    render(<DataComponent loading={false} data="test data" />);
    expect(screen.getByText('test data')).toBeInTheDocument();
  });
});
```

## Testing Conditional Rendering

```typescript
describe('ConditionalComponent', () => {
  it('should render when condition is true', () => {
    render(<ConditionalComponent show={true} />);
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });
  
  it('should not render when condition is false', () => {
    render(<ConditionalComponent show={false} />);
    expect(screen.queryByText('Visible')).not.toBeInTheDocument();
  });
});
```

## Testing Lists

```typescript
describe('ItemList', () => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];
  
  it('should render all items', () => {
    render(<ItemList items={items} />);
    
    items.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });
  
  it('should handle empty list', () => {
    render(<ItemList items={[]} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
```

## Common Queries

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('textbox', { name: /email/i })

// By label text
screen.getByLabelText('Email')
screen.getByLabelText(/password/i)

// By placeholder
screen.getByPlaceholderText('Enter email')

// By text content
screen.getByText('Submit')
screen.getByText(/loading/i)

// By test ID (last resort)
screen.getByTestId('custom-element')

// Query variants
getBy...    // Throws if not found
queryBy...  // Returns null if not found
findBy...   // Async, waits for element
```

## Assertions

```typescript
// Presence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Enabled/Disabled
expect(element).toBeEnabled()
expect(element).toBeDisabled()

// Value
expect(input).toHaveValue('test')
expect(input).toHaveValue('')

// Text content
expect(element).toHaveTextContent('Hello')
expect(element).toHaveTextContent(/hello/i)

// Classes
expect(element).toHaveClass('active')
expect(element).not.toHaveClass('disabled')

// Attributes
expect(element).toHaveAttribute('aria-label', 'Close')
expect(link).toHaveAttribute('href', '/home')

// Mock functions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).not.toHaveBeenCalled()
```

## Debugging Tests

```typescript
import { render, screen } from '@/test/testUtils';

describe('Debug', () => {
  it('should help debug', () => {
    const { debug } = render(<MyComponent />);
    
    // Print entire DOM
    debug();
    
    // Print specific element
    debug(screen.getByRole('button'));
    
    // Print queries available
    screen.logTestingPlaygroundURL();
  });
});
```

## Running Specific Tests

```bash
# Run tests matching pattern
npm test -- MyComponent

# Run single test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Tips

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Focus on what users see and do, not implementation
3. **Async operations**: Always use `waitFor` or `findBy` for async code
4. **Mock external dependencies**: Don't make real API calls in unit tests
5. **Keep tests simple**: One concept per test
6. **Descriptive names**: Use "should" statements for test names
7. **Avoid implementation details**: Don't test internal state
8. **Use Testing Playground**: `screen.logTestingPlaygroundURL()` helps find queries
