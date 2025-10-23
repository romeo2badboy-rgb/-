const express = require('express');
const router = express.Router();
const aiService = require('../services/ai-service');

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'الرسالة مطلوبة'
            });
        }

        const result = await aiService.chat(message, history || []);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في معالجة الطلب',
            error: error.message
        });
    }
});

// Get available tools
router.get('/tools', (req, res) => {
    res.json({
        success: true,
        tools: aiService.tools
    });
});

module.exports = router;
