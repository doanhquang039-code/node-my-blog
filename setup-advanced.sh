#!/bin/bash
# Setup script for advanced blog features

echo "🚀 Setting up Advanced Blog Features..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running
# echo "🔍 Checking MySQL connection..."
# (You may need to adjust this based on your system)

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Running database migrations..."
npm run db:migrate

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env file with your configuration:"
echo "   - Email settings (EMAIL_USER, EMAIL_PASS)"
echo "   - APP_URL"
echo "2. Start the server: npm run dev"
echo "3. Visit http://localhost:8080"
echo ""
echo "📚 For API documentation, see ADVANCED_FEATURES.md"
