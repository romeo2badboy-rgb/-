const express = require('express');
const router = express.Router();
const browserManager = require('../services/browsing-service');

// ==========================================
// 🌐 AI BROWSING API ROUTES
// ==========================================

// Initialize browser
router.post('/init', async (req, res) => {
    try {
        const initialized = await browserManager.initialize();
        res.json({
            success: true,
            initialized,
            message: initialized ? 'المتصفح جاهز!' : 'وضع القراءة فقط'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Close browser
router.post('/close', async (req, res) => {
    try {
        await browserManager.close();
        res.json({ success: true, message: 'تم إغلاق المتصفح' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Navigate to URL
router.post('/navigate', async (req, res) => {
    try {
        const { url } = req.body;
        const result = await browserManager.navigateToUrl(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Click element
router.post('/click', async (req, res) => {
    try {
        const { selector } = req.body;
        const result = await browserManager.clickElement(selector);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Type text
router.post('/type', async (req, res) => {
    try {
        const { selector, text } = req.body;
        const result = await browserManager.typeText(selector, text);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Read page content
router.get('/content', async (req, res) => {
    try {
        const result = await browserManager.readPageContent();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Take screenshot
router.get('/screenshot', async (req, res) => {
    try {
        const fullPage = req.query.fullPage === 'true';
        const result = await browserManager.takeScreenshot(fullPage);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search Google
router.post('/search-google', async (req, res) => {
    try {
        const { query } = req.body;
        const result = await browserManager.searchGoogle(query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fill form
router.post('/fill-form', async (req, res) => {
    try {
        const { formData } = req.body;
        const result = await browserManager.fillForm(formData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Scroll page
router.post('/scroll', async (req, res) => {
    try {
        const { direction, amount } = req.body;
        const result = await browserManager.scrollPage(direction, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Extract elements
router.post('/extract', async (req, res) => {
    try {
        const { selector } = req.body;
        const result = await browserManager.extractElements(selector);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get element text
router.post('/get-text', async (req, res) => {
    try {
        const { selector } = req.body;
        const result = await browserManager.getElementText(selector);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Wait for element
router.post('/wait-element', async (req, res) => {
    try {
        const { selector, timeout } = req.body;
        const result = await browserManager.waitForElement(selector, timeout);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get cookies
router.get('/cookies', async (req, res) => {
    try {
        const result = await browserManager.getCookies();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Clear cookies
router.delete('/cookies', async (req, res) => {
    try {
        const result = await browserManager.clearCookies();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Execute JavaScript
router.post('/execute', async (req, res) => {
    try {
        const { script } = req.body;
        const result = await browserManager.evaluateScript(script);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get page HTML
router.get('/html', async (req, res) => {
    try {
        const result = await browserManager.getPageHTML();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// SSE endpoint for real-time updates
router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send events from browser manager
    const onStatus = (data) => res.write(`event: status\ndata: ${JSON.stringify(data)}\n\n`);
    const onAction = (data) => res.write(`event: action\ndata: ${JSON.stringify(data)}\n\n`);
    const onSuccess = (data) => res.write(`event: success\ndata: ${JSON.stringify(data)}\n\n`);
    const onProgress = (data) => res.write(`event: progress\ndata: ${JSON.stringify(data)}\n\n`);

    browserManager.on('status', onStatus);
    browserManager.on('action', onAction);
    browserManager.on('success', onSuccess);
    browserManager.on('progress', onProgress);

    req.on('close', () => {
        browserManager.off('status', onStatus);
        browserManager.off('action', onAction);
        browserManager.off('success', onSuccess);
        browserManager.off('progress', onProgress);
    });
});

module.exports = router;
