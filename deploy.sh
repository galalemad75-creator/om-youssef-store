#!/bin/bash
# سكريبت نشر المتجر على Vercel
# استخدم: bash deploy.sh

echo "🚀 جاري نشر المتجر..."

# Install vercel if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 تثبيت Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "🔨 جاري البناء والنشر..."
vercel --yes --prod

echo ""
echo "✅ تم النشر بنجاح!"
echo "🌐 المتجر: https://om-youssef-store.vercel.app"
echo "🔧 لوحة التحكم: https://om-youssef-store.vercel.app/admin"
echo "🔑 كلمة المرور: omYoussef2024"
