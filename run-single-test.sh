#!/bin/bash
# Script to run a single test file for debugging

echo "Running useAzureMonitor tests..."
npm test -- --run src/hooks/__tests__/useAzureMonitor.test.tsx 2>&1 | tee test-output.log

echo ""
echo "Running StatusBadge tests..."
npm test -- --run src/components/dashboard/__tests__/StatusBadge.test.tsx 2>&1 | tee -a test-output.log

echo ""
echo "Full output saved to test-output.log"
