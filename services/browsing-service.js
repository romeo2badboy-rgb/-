const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const axios = require('axios');
const EventEmitter = require('events');

// ==========================================
// 🌐 AI BROWSING SERVICE - COMPLETE AUTOMATION
// ==========================================

class BrowserManager extends EventEmitter {
    constructor() {
        super();
        this.browser = null;
        this.page = null;
        this.isActive = false;
    }

    emit(event, data) {
        super.emit(event, data);
        console.log(`[Browser Event] ${event}:`, data);
    }

    async initialize() {
        try {
            // Try to launch browser (works in production with Chrome installed)
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            this.isActive = true;
            this.emit('status', { message: '✅ المتصفح جاهز!', type: 'success' });
            return true;
        } catch (error) {
            // Fallback mode without browser
            this.emit('status', { message: '⚠️ وضع القراءة فقط (بدون متصفح)', type: 'warning' });
            this.isActive = false;
            return false;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isActive = false;
            this.emit('status', { message: '🔒 تم إغلاق المتصفح', type: 'info' });
        }
    }

    // ==========================================
    // 📡 NAVIGATION TOOLS
    // ==========================================

    async navigateToUrl(url) {
        this.emit('action', { step: 'التنقل إلى الرابط', url });

        if (this.isActive && this.page) {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            const title = await this.page.title();
            this.emit('success', { message: `✅ تم فتح: ${title}` });
            return { success: true, title, url };
        } else {
            // Fallback: Just fetch HTML
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const title = $('title').text();
            this.emit('success', { message: `📄 تم جلب المحتوى: ${title}` });
            return { success: true, title, url, mode: 'fallback' };
        }
    }

    async goBack() {
        this.emit('action', { step: 'العودة للصفحة السابقة' });
        if (this.isActive && this.page) {
            await this.page.goBack();
            this.emit('success', { message: '⬅️ تم الرجوع' });
            return { success: true };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async goForward() {
        this.emit('action', { step: 'التقدم للصفحة التالية' });
        if (this.isActive && this.page) {
            await this.page.goForward();
            this.emit('success', { message: '➡️ تم التقدم' });
            return { success: true };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async reload() {
        this.emit('action', { step: 'إعادة تحميل الصفحة' });
        if (this.isActive && this.page) {
            await this.page.reload();
            this.emit('success', { message: '🔄 تم التحديث' });
            return { success: true };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 🖱️ INTERACTION TOOLS
    // ==========================================

    async clickElement(selector) {
        this.emit('action', { step: 'الضغط على عنصر', selector });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            await this.page.click(selector);
            this.emit('success', { message: `✅ تم الضغط على: ${selector}` });
            return { success: true, selector };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async typeText(selector, text) {
        this.emit('action', { step: 'كتابة نص', selector, text });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            await this.page.type(selector, text, { delay: 100 });
            this.emit('success', { message: `⌨️ تم كتابة: ${text}` });
            return { success: true, selector, text };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async clearAndType(selector, text) {
        this.emit('action', { step: 'مسح وكتابة نص', selector, text });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            await this.page.click(selector, { clickCount: 3 });
            await this.page.keyboard.press('Backspace');
            await this.page.type(selector, text, { delay: 100 });
            this.emit('success', { message: `✏️ تم التعديل: ${text}` });
            return { success: true, selector, text };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async selectOption(selector, value) {
        this.emit('action', { step: 'اختيار من قائمة', selector, value });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            await this.page.select(selector, value);
            this.emit('success', { message: `📋 تم الاختيار: ${value}` });
            return { success: true, selector, value };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async pressKey(key) {
        this.emit('action', { step: 'الضغط على مفتاح', key });
        if (this.isActive && this.page) {
            await this.page.keyboard.press(key);
            this.emit('success', { message: `⌨️ تم الضغط على: ${key}` });
            return { success: true, key };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 📄 CONTENT EXTRACTION TOOLS
    // ==========================================

    async readPageContent() {
        this.emit('action', { step: 'قراءة محتوى الصفحة' });

        if (this.isActive && this.page) {
            const content = await this.page.evaluate(() => {
                return {
                    title: document.title,
                    text: document.body.innerText.substring(0, 5000),
                    url: window.location.href,
                    links: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => ({
                        text: a.innerText,
                        href: a.href
                    }))
                };
            });
            this.emit('success', { message: `📖 تم قراءة: ${content.title}` });
            return { success: true, content };
        } else {
            // Fallback mode
            const currentUrl = this.lastUrl || 'https://example.com';
            const response = await axios.get(currentUrl);
            const $ = cheerio.load(response.data);
            const content = {
                title: $('title').text(),
                text: $('body').text().substring(0, 5000),
                url: currentUrl,
                links: $('a').slice(0, 20).map((i, el) => ({
                    text: $(el).text(),
                    href: $(el).attr('href')
                })).get()
            };
            this.emit('success', { message: `📄 تم قراءة المحتوى` });
            return { success: true, content, mode: 'fallback' };
        }
    }

    async extractElements(selector) {
        this.emit('action', { step: 'استخراج عناصر', selector });
        if (this.isActive && this.page) {
            const elements = await this.page.$$eval(selector, elements =>
                elements.map(el => ({
                    text: el.innerText,
                    html: el.innerHTML,
                    attributes: Array.from(el.attributes).map(attr => ({
                        name: attr.name,
                        value: attr.value
                    }))
                }))
            );
            this.emit('success', { message: `🎯 تم استخراج ${elements.length} عنصر` });
            return { success: true, elements, count: elements.length };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async getElementText(selector) {
        this.emit('action', { step: 'قراءة نص عنصر', selector });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            const text = await this.page.$eval(selector, el => el.innerText);
            this.emit('success', { message: `📝 النص: ${text}` });
            return { success: true, text };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async getPageTitle() {
        this.emit('action', { step: 'الحصول على عنوان الصفحة' });
        if (this.isActive && this.page) {
            const title = await this.page.title();
            return { success: true, title };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async getCurrentUrl() {
        this.emit('action', { step: 'الحصول على الرابط الحالي' });
        if (this.isActive && this.page) {
            const url = await this.page.url();
            return { success: true, url };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 📸 SCREENSHOT & VISUAL TOOLS
    // ==========================================

    async takeScreenshot(fullPage = false) {
        this.emit('action', { step: 'التقاط صورة للصفحة', fullPage });
        if (this.isActive && this.page) {
            const screenshot = await this.page.screenshot({
                encoding: 'base64',
                fullPage: fullPage
            });
            this.emit('success', { message: '📸 تم التقاط الصورة' });
            return { success: true, screenshot: `data:image/png;base64,${screenshot}` };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async takeElementScreenshot(selector) {
        this.emit('action', { step: 'تصوير عنصر محدد', selector });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            const element = await this.page.$(selector);
            const screenshot = await element.screenshot({ encoding: 'base64' });
            this.emit('success', { message: '📷 تم تصوير العنصر' });
            return { success: true, screenshot: `data:image/png;base64,${screenshot}` };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 🔍 SEARCH & AUTOMATION TOOLS
    // ==========================================

    async searchGoogle(query) {
        this.emit('action', { step: 'البحث في جوجل', query });
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        if (this.isActive && this.page) {
            await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('h3', { timeout: 10000 });

            const results = await this.page.$$eval('h3', elements =>
                elements.slice(0, 10).map(el => ({
                    title: el.innerText,
                    link: el.closest('a')?.href || ''
                }))
            );

            this.emit('success', { message: `🔍 تم العثور على ${results.length} نتيجة` });
            return { success: true, results, query };
        } else {
            // Fallback: basic search info
            return {
                success: true,
                message: `بحث عن: ${query}`,
                searchUrl,
                mode: 'fallback'
            };
        }
    }

    async fillForm(formData) {
        this.emit('action', { step: 'تعبئة استمارة', fields: Object.keys(formData).length });

        if (this.isActive && this.page) {
            for (const [selector, value] of Object.entries(formData)) {
                await this.page.waitForSelector(selector, { timeout: 5000 });
                await this.page.type(selector, value.toString(), { delay: 50 });
                this.emit('progress', { field: selector, value });
            }
            this.emit('success', { message: `✅ تم تعبئة ${Object.keys(formData).length} حقل` });
            return { success: true, fieldsCount: Object.keys(formData).length };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 📜 SCROLLING & WAITING TOOLS
    // ==========================================

    async scrollPage(direction = 'down', amount = 500) {
        this.emit('action', { step: 'تمرير الصفحة', direction, amount });
        if (this.isActive && this.page) {
            if (direction === 'down') {
                await this.page.evaluate((amt) => window.scrollBy(0, amt), amount);
            } else if (direction === 'up') {
                await this.page.evaluate((amt) => window.scrollBy(0, -amt), amount);
            } else if (direction === 'top') {
                await this.page.evaluate(() => window.scrollTo(0, 0));
            } else if (direction === 'bottom') {
                await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            }
            this.emit('success', { message: `📜 تم التمرير ${direction}` });
            return { success: true, direction, amount };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async waitForElement(selector, timeout = 10000) {
        this.emit('action', { step: 'الانتظار لظهور عنصر', selector, timeout });
        if (this.isActive && this.page) {
            await this.page.waitForSelector(selector, { timeout });
            this.emit('success', { message: `✅ ظهر العنصر: ${selector}` });
            return { success: true, selector };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async wait(milliseconds) {
        this.emit('action', { step: 'الانتظار', duration: `${milliseconds}ms` });
        await new Promise(resolve => setTimeout(resolve, milliseconds));
        this.emit('success', { message: `⏱️ تم الانتظار ${milliseconds}ms` });
        return { success: true, duration: milliseconds };
    }

    // ==========================================
    // 🍪 COOKIES & STORAGE TOOLS
    // ==========================================

    async getCookies() {
        this.emit('action', { step: 'الحصول على ملفات تعريف الارتباط' });
        if (this.isActive && this.page) {
            const cookies = await this.page.cookies();
            this.emit('success', { message: `🍪 تم الحصول على ${cookies.length} cookie` });
            return { success: true, cookies, count: cookies.length };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async setCookie(cookie) {
        this.emit('action', { step: 'تعيين cookie', name: cookie.name });
        if (this.isActive && this.page) {
            await this.page.setCookie(cookie);
            this.emit('success', { message: `✅ تم تعيين cookie: ${cookie.name}` });
            return { success: true, cookie };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async clearCookies() {
        this.emit('action', { step: 'مسح جميع الـ cookies' });
        if (this.isActive && this.page) {
            const cookies = await this.page.cookies();
            await this.page.deleteCookie(...cookies);
            this.emit('success', { message: `🗑️ تم مسح ${cookies.length} cookie` });
            return { success: true, cleared: cookies.length };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    // ==========================================
    // 🔗 ADVANCED TOOLS
    // ==========================================

    async evaluateScript(script) {
        this.emit('action', { step: 'تنفيذ كود JavaScript' });
        if (this.isActive && this.page) {
            const result = await this.page.evaluate(script);
            this.emit('success', { message: '✅ تم تنفيذ الكود' });
            return { success: true, result };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async getPageHTML() {
        this.emit('action', { step: 'الحصول على HTML الكامل' });
        if (this.isActive && this.page) {
            const html = await this.page.content();
            this.emit('success', { message: `📄 تم الحصول على HTML (${html.length} حرف)` });
            return { success: true, html, length: html.length };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }

    async checkElementExists(selector) {
        this.emit('action', { step: 'التحقق من وجود عنصر', selector });
        if (this.isActive && this.page) {
            const exists = await this.page.$(selector) !== null;
            this.emit('success', { message: exists ? '✅ العنصر موجود' : '❌ العنصر غير موجود' });
            return { success: true, exists, selector };
        }
        return { success: false, message: 'المتصفح غير نشط' };
    }
}

// Singleton instance
const browserManager = new BrowserManager();

module.exports = browserManager;
