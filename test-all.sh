#!/bin/bash
# Comprehensive test runner with detailed output

echo "======================================"
echo "Running ALL Tests with Verbose Output"
echo "======================================"
echo ""

cd /workspaces/se-customer-portal

echo "Step 1: Running hook tests..."
npm test -- --run src/hooks/__tests__/*.test.tsx --reporter=verbose 2>&1 | head -n 150

echo ""
echo "Step 2: Running component tests..."
npm test -- --run src/components/**/__tests__/*.test.tsx --reporter=verbose 2>&1 | head -n 150

echo ""
echo "Step 3: Running lib tests..."
npm test -- --run src/lib/__tests__/*.test.ts --reporter=verbose 2>&1 | head -n 100

echo ""
echo "======================================"
echo "Test run complete"
echo "======================================"
