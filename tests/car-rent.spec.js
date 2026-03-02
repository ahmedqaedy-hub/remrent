const { test, expect } = require('@playwright/test');

test.describe('نظام حجوزات ريم الخليج', () => {
  
  test.beforeEach(async ({ page }) => {
    // تحميل الصفحة الرئيسية
    await page.goto('index.html');
  });

  test('يجب أن يطلب تسجيل الدخول عند محاولة الحجز بدون حساب', async ({ page }) => {
    // الضغط على زر "حجز الآن" لأول سيارة متاحة
    await page.click('button:has-text("حجز الآن")');
    
    // يجب أن تظهر صفحة تسجيل الدخول
    await expect(page.locator('#page-auth')).toBeVisible();
    await expect(page.locator('h2:has-text("تسجيل الدخول")')).toBeVisible();
  });

  test('يجب إتمام عملية التسجيل والحجز بنجاح', async ({ page }) => {
    // 1. تسجيل الدخول
    await page.click('button[onclick*="navigateTo(\'profile\'"]'); // الذهاب لصفحة الحساب
    await page.fill('#user-phone', '0501234567');
    await page.click('button:has-text("دخول / إنشاء حساب")');
    
    // 2. العودة للرئيسية وحجز سيارة
    await page.click('button[onclick*="navigateTo(\'home\'"]');
    await page.click('button:has-text("حجز الآن") >> nth=0'); // حجز أول سيارة
    
    // تأكيد الحجز من النافذة المنبثقة
    page.on('dialog', dialog => dialog.accept()); // التعامل مع الـ alert
    await page.click('button:has-text("تأكيد الحجز")');
    
    // 3. التحقق من ظهور الحجز في صفحة "سياراتي"
    await expect(page.locator('#page-cars')).toBeVisible();
    const bookingItem = page.locator('#user-bookings-list div').first();
    await expect(bookingItem).toBeVisible();
    await expect(bookingItem).toContainText('مؤكد');
  });

  test('يجب أن يعمل فلتر السيارات المتاحة بشكل صحيح', async ({ page }) => {
    // عدّ جميع السيارات قبل الفلترة
    const initialCount = await page.locator('#cars-grid > div').count();
    
    // تفعيل الفلتر
    await page.click('#filter-available');
    
    // عدّ السيارات بعد الفلترة (يجب أن يكون أقل)
    const filteredCount = await page.locator('#cars-grid > div').count();
    expect(filteredCount).toBeLessThan(initialCount);
  });

});
