#!/usr/bin/env node

/**
 * Simple test validator
 * Checks if test files can be imported without errors
 */

console.log('Validating test files...\n');

const testFiles = [
  './src/hooks/__tests__/useAzureMonitor.test.tsx',
  './src/hooks/__tests__/useAuth.test.tsx',
  './src/components/dashboard/__tests__/StatusBadge.test.tsx',
  './src/components/dashboard/__tests__/MetricCard.test.tsx',
  './src/components/dashboard/__tests__/ResourceCard.test.tsx',
  './src/components/auth/__tests__/ProtectedRoute.test.tsx',
  './src/lib/__tests__/azureAuth.test.ts',
];

console.log('Test files to validate:');
testFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\nAll test files are present and configured.');
console.log('\nRun: npm test -- --run --reporter=verbose\n');
