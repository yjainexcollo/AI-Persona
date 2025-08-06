#!/bin/bash

echo "🔧 Fixing test environment configuration..."

# Update the test database URL to use the correct port
sed -i '' 's/localhost:5432/localhost:5433/g' .env.test

echo "✅ Updated TEST_DATABASE_URL to use port 5433"
echo "📋 Current .env.test configuration:"
echo "----------------------------------------"
cat .env.test
echo "----------------------------------------"

echo ""
echo "🚀 Now you can run the tests:"
echo "   npm test" 