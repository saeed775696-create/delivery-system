 

### الخطوات
```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إنشاء ملف البيئة
cp .env.example .env
# عدل DATABASE_URL و JWT_SECRET في ملف .env

# 3. إنشاء جداول قاعدة البيانات
npx drizzle-kit push

# 4. إضافة بيانات تجريبية (اختياري)
npx tsx scripts/seed.ts

# 5. تشغيل التطبيق
npm run dev
```

### أوامر مفيدة
```bash
npm run dev       # تشغيل خادم التطوير
npm run build     # بناء للإنتاج
npm run start     # تشغيل الإنتاج
npm run lint      # فحص الكود
npm run typecheck # فحص الأنواع
```

## الميزات القادمة (قابلة للإضافة)
- [ ] الدفع الإلكتروني (Payment Gateway)
- [ ] إشعارات Firebase (Push Notifications)
- [ ] خرائط وتتبع مباشر للمندوب
- [ ] تطبيق موبايل (React Native)
- [ ] نظام القسائم والخصومات
- [ ] التقارير المتقدمة
- [ ] الشات المباشر
- [ ] إصدار للغة الإنجليزية
