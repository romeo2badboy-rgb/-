// ==========================================
// 🌐 AI BROWSING - LIVE BROWSER INTERFACE
// ==========================================

let eventSource = null;
let browserInitialized = false;

// Initialize
function initAIBrowsing() {
    setupEventStream();
    attachEventListeners();
}

// Setup Server-Sent Events stream
function setupEventStream() {
    eventSource = new EventSource('/api/browsing/stream');

    eventSource.addEventListener('status', (e) => {
        const data = JSON.parse(e.data);
        addBrowsingLog(data.message, data.type || 'info');
    });

    eventSource.addEventListener('action', (e) => {
        const data = JSON.parse(e.data);
        addBrowsingLog(`🎬 ${data.step}`, 'action');
    });

    eventSource.addEventListener('success', (e) => {
        const data = JSON.parse(e.data);
        addBrowsingLog(data.message, 'success');
    });

    eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        addBrowsingLog(`⏳ ${data.field}: ${data.value}`, 'progress');
    });

    eventSource.onerror = () => {
        addBrowsingLog('⚠️ اتصال البث متقطع', 'warning');
    };
}

// Attach event listeners
function attachEventListeners() {
    // Initialize browser button
    document.getElementById('btn-init-browser')?.addEventListener('click', initBrowser);

    // Close browser button
    document.getElementById('btn-close-browser')?.addEventListener('click', closeBrowser);

    // Navigate button
    document.getElementById('btn-navigate')?.addEventListener('click', () => {
        const url = document.getElementById('input-url')?.value;
        if (url) navigateToUrl(url);
    });

    // Screenshot button
    document.getElementById('btn-screenshot')?.addEventListener('click', takeScreenshot);

    // Search Google button
    document.getElementById('btn-search-google')?.addEventListener('click', () => {
        const query = document.getElementById('input-search')?.value;
        if (query) searchGoogle(query);
    });

    // Read content button
    document.getElementById('btn-read-content')?.addEventListener('click', readContent);

    // Clear logs button
    document.getElementById('btn-clear-logs')?.addEventListener('click', clearLogs);
}

// ==========================================
// API CALLS
// ==========================================

async function initBrowser() {
    try {
        addBrowsingLog('🚀 جاري تشغيل المتصفح...', 'info');
        const response = await fetch('/api/browsing/init', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            browserInitialized = data.initialized;
            addBrowsingLog(data.message, 'success');
            updateBrowserStatus(true);
        } else {
            addBrowsingLog('❌ فشل تشغيل المتصفح', 'error');
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

async function closeBrowser() {
    try {
        const response = await fetch('/api/browsing/close', { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            browserInitialized = false;
            addBrowsingLog(data.message, 'info');
            updateBrowserStatus(false);
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

async function navigateToUrl(url) {
    try {
        addBrowsingLog(`🌐 الانتقال إلى: ${url}`, 'action');
        const response = await fetch('/api/browsing/navigate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await response.json();

        if (data.success) {
            addBrowsingLog(`✅ تم فتح: ${data.title}`, 'success');
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

async function takeScreenshot() {
    try {
        addBrowsingLog('📸 جاري التقاط صورة...', 'action');
        const response = await fetch('/api/browsing/screenshot');
        const data = await response.json();

        if (data.success && data.screenshot) {
            displayScreenshot(data.screenshot);
            addBrowsingLog('✅ تم التقاط الصورة', 'success');
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

async function searchGoogle(query) {
    try {
        addBrowsingLog(`🔍 البحث عن: ${query}`, 'action');
        const response = await fetch('/api/browsing/search-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();

        if (data.success && data.results) {
            displaySearchResults(data.results);
            addBrowsingLog(`✅ تم العثور على ${data.results.length} نتيجة`, 'success');
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

async function readContent() {
    try {
        addBrowsingLog('📖 جاري قراءة المحتوى...', 'action');
        const response = await fetch('/api/browsing/content');
        const data = await response.json();

        if (data.success && data.content) {
            displayPageContent(data.content);
            addBrowsingLog('✅ تم قراءة المحتوى', 'success');
        }
    } catch (error) {
        addBrowsingLog(`❌ خطأ: ${error.message}`, 'error');
    }
}

// ==========================================
// UI UPDATES
// ==========================================

function addBrowsingLog(message, type = 'info') {
    const logsContainer = document.getElementById('browsing-logs');
    if (!logsContainer) return;

    const logEntry = document.createElement('div');
    logEntry.className = `browsing-log-entry log-${type}`;

    const timestamp = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span>
        <span class="log-message">${message}</span>
    `;

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Keep only last 100 logs
    const logs = logsContainer.querySelectorAll('.browsing-log-entry');
    if (logs.length > 100) {
        logs[0].remove();
    }
}

function clearLogs() {
    const logsContainer = document.getElementById('browsing-logs');
    if (logsContainer) {
        logsContainer.innerHTML = '';
        addBrowsingLog('🗑️ تم مسح السجلات', 'info');
    }
}

function updateBrowserStatus(active) {
    const statusIndicator = document.getElementById('browser-status');
    if (statusIndicator) {
        statusIndicator.className = `browser-status ${active ? 'status-active' : 'status-inactive'}`;
        statusIndicator.textContent = active ? '🟢 نشط' : '🔴 متوقف';
    }
}

function displayScreenshot(dataUrl) {
    const container = document.getElementById('screenshot-container');
    if (!container) return;

    container.innerHTML = `
        <div class="screenshot-wrapper">
            <img src="${dataUrl}" alt="Screenshot" class="screenshot-image">
            <button onclick="downloadScreenshot('${dataUrl}')" class="btn-download-screenshot">
                📥 تحميل الصورة
            </button>
        </div>
    `;
}

function downloadScreenshot(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
}

function displaySearchResults(results) {
    const container = document.getElementById('results-container');
    if (!container) return;

    let html = '<div class="search-results"><h3>🔍 نتائج البحث:</h3>';
    results.forEach((result, index) => {
        html += `
            <div class="search-result-item">
                <span class="result-number">${index + 1}</span>
                <div class="result-content">
                    <h4>${result.title}</h4>
                    <a href="${result.link}" target="_blank">${result.link}</a>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function displayPageContent(content) {
    const container = document.getElementById('content-container');
    if (!container) return;

    let html = `
        <div class="page-content">
            <div class="content-header">
                <h3>📄 ${content.title}</h3>
                <p class="content-url">${content.url}</p>
            </div>
            <div class="content-text">
                <pre>${content.text}</pre>
            </div>
    `;

    if (content.links && content.links.length > 0) {
        html += '<div class="content-links"><h4>🔗 روابط الصفحة:</h4><ul>';
        content.links.forEach(link => {
            if (link.text && link.href) {
                html += `<li><a href="${link.href}" target="_blank">${link.text}</a></li>`;
            }
        });
        html += '</ul></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// Toggle AI Browsing panel
function toggleAIBrowsing() {
    const panel = document.getElementById('ai-browsing-panel');
    if (panel) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active') && !eventSource) {
            initAIBrowsing();
        }
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIBrowsing);
} else {
    initAIBrowsing();
}
