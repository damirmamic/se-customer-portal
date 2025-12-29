/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, any> {}
  }
}

export {};
