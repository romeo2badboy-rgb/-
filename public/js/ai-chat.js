// AI Chat State
let aiChatHistory = [];
let isAIChatOpen = false;
let isAIThinking = false;

// Toggle AI Chat
function toggleAIChat() {
    const chatContainer = document.getElementById('ai-chat-container');
    isAIChatOpen = !isAIChatOpen;

    if (isAIChatOpen) {
        chatContainer.style.display = 'flex';
        document.getElementById('ai-chat-input').focus();
    } else {
        chatContainer.style.display = 'none';
    }
}

// Add message to chat
function addAIMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'ai-message-user' : 'ai-message-bot'}`;

    const avatar = document.createElement('div');
    avatar.className = 'ai-message-avatar';

    if (isUser) {
        avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    } else {
        avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.innerHTML = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageDiv;
}

// Add typing indicator
function addTypingIndicator() {
    const messagesContainer = document.getElementById('ai-chat-messages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-message-bot';
    typingDiv.id = 'ai-typing-indicator';

    typingDiv.innerHTML = `
        <div class="ai-message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        </div>
        <div class="ai-message-content">
            <div class="ai-typing-indicator">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Send AI Message
async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message || isAIThinking) return;

    // Add user message
    addAIMessage(message, true);
    input.value = '';

    // Show typing indicator
    isAIThinking = true;
    addTypingIndicator();

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                history: aiChatHistory
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        if (data.success) {
            // Add AI response
            const aiResponse = data.data.text || 'عذراً، لم أتمكن من معالجة طلبك.';
            addAIMessage(aiResponse);

            // Update conversation history
            if (data.data.conversationHistory) {
                aiChatHistory = data.data.conversationHistory;
            }

            // Refresh page content if needed (to show new data)
            // You can add logic here to refresh specific sections

        } else {
            addAIMessage(`⚠️ حدث خطأ: ${data.message || 'غير معروف'}`, false);
        }

    } catch (error) {
        removeTypingIndicator();
        console.error('AI Error:', error);
        addAIMessage('⚠️ عذراً، حدث خطأ في الاتصال بالـ AI. الرجاء المحاولة مرة أخرى.', false);
    } finally {
        isAIThinking = false;
    }
}

// Handle Enter key in input
document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-chat-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }
});

// Voice command examples (you can add voice recognition later)
function getAIExamples() {
    return [
        'أضف عميل جديد اسمه أحمد ورقم هاتفه 0551234567',
        'أضف منتج جديد اسمه لابتوب سعره 5000 والكمية 10',
        'أنشئ طلب للعميل رقم 1',
        'اعرض جميع العملاء',
        'اعرض المنتجات',
        'اعرض إحصائيات لوحة التحكم',
        'احذف العميل رقم 5',
        'حدث سعر المنتج رقم 3 إلى 1500'
    ];
}

// Show examples on button click (optional feature)
function showAIExamples() {
    const examples = getAIExamples();
    let examplesHTML = '<strong>أمثلة على ما يمكنني فعله:</strong><ul>';
    examples.forEach(example => {
        examplesHTML += `<li style="cursor: pointer; color: var(--accent-primary);" onclick="fillAIInput('${example}')">${example}</li>`;
    });
    examplesHTML += '</ul>';

    addAIMessage(examplesHTML, false);
}

function fillAIInput(text) {
    document.getElementById('ai-chat-input').value = text;
    document.getElementById('ai-chat-input').focus();
}

console.log('🤖 AI Assistant loaded! Powered by Gemini 2.0 Flash');
