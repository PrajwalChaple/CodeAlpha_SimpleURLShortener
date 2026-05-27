document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements Cache
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Shortener Form elements
    const shortenForm = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url');
    const urlError = document.getElementById('url-error');
    const submitBtn = shortenForm.querySelector('.submit-btn');
    
    // Result elements
    const resultBox = document.getElementById('result-box');
    const shortenedUrlInput = document.getElementById('shortened-url');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');
    const resCodeSpan = document.getElementById('res-code');
    
    // QR Code elements
    const qrAccordion = document.querySelector('.qr-accordion');
    const qrToggle = document.getElementById('qr-toggle');
    const qrLoading = document.getElementById('qr-loading');
    const qrCodeImg = document.getElementById('qr-code-img');
    const qrDownloadBtn = document.getElementById('qr-download-btn');
    
    // Analytics elements
    const fetchAnalyticsBtn = document.getElementById('fetch-analytics-btn');
    const analyticsCodeInput = document.getElementById('analytics-code');
    const analyticsError = document.getElementById('analytics-error');
    const metricsBox = document.getElementById('metrics-box');
    const refreshMetricsBtn = document.getElementById('refresh-metrics-btn');
    
    const metricClicks = document.getElementById('metric-clicks');
    const metricDate = document.getElementById('metric-date');
    const metricAge = document.getElementById('metric-age');
    const metricTarget = document.getElementById('metric-target');
    const metricCode = document.getElementById('metric-code');
    
    // History elements
    const historyGrid = document.getElementById('history-grid');
    const historyEmpty = document.getElementById('history-empty');
    const historyCount = document.getElementById('history-count');
    
    // Toast notification
    const toast = document.getElementById('toast');

    // ==========================================
    // 1. Tab Navigation Routing
    // ==========================================
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active states
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activate current
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Focus input for good UX
            if (targetTab === 'shorten-tab') {
                longUrlInput.focus();
            } else if (targetTab === 'analytics-tab') {
                analyticsCodeInput.focus();
            }
        });
    });

    // ==========================================
    // 2. Helper Functions (UX, Toast, Formatting)
    // ==========================================
    function showToast(message, type = 'success') {
        const icon = toast.querySelector('.toast-icon');
        const text = toast.querySelector('.toast-message');
        
        text.textContent = message;
        if (type === 'error') {
            icon.className = 'fa-solid fa-circle-exclamation text-rose';
            toast.style.borderColor = '#f43f5e';
            toast.style.boxShadow = '0 10px 30px rgba(244, 63, 94, 0.25)';
        } else {
            icon.className = 'fa-solid fa-circle-check text-cyan';
            toast.style.borderColor = '#06b6d4';
            toast.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.25)';
        }
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString.replace(' ', 'T') + 'Z'); // parse SQLite date UTC
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    function formatFullDate(dateString) {
        // Formats "2026-05-27 18:00:00" to "May 27, 2026"
        const date = new Date(dateString.replace(' ', 'T') + 'Z');
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function extractShortCode(input) {
        const cleaned = input.trim();
        if (!cleaned) return '';
        // If it's a URL, get the last token of path
        try {
            if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
                const url = new URL(cleaned);
                return url.pathname.replace(/^\//, ''); // remove leading slash
            }
        } catch(e) {}
        
        // If it contains slashes, grab the last block
        if (cleaned.includes('/')) {
            const parts = cleaned.split('/');
            return parts[parts.length - 1];
        }
        return cleaned;
    }

    // ==========================================
    // 3. LocalStorage Link Registry (History)
    // ==========================================
    function getHistory() {
        const raw = localStorage.getItem('tinypath_history');
        return raw ? JSON.parse(raw) : [];
    }

    function saveHistory(history) {
        localStorage.setItem('tinypath_history', JSON.stringify(history));
    }

    function addToHistory(urlData) {
        let history = getHistory();
        // Remove duplicates if the user shortens the same URL again
        history = history.filter(item => item.short_code !== urlData.short_code);
        history.unshift(urlData); // add to top
        saveHistory(history);
        renderHistory();
    }

    function deleteFromHistory(shortCode) {
        let history = getHistory();
        history = history.filter(item => item.short_code !== shortCode);
        saveHistory(history);
        renderHistory();
        showToast('Link removed from browser registry.');
    }

    function syncItemStats(shortCode, btnElement) {
        if (btnElement) {
            btnElement.classList.add('fa-spin', 'text-cyan');
        }
        
        fetch(`/api/analytics/${shortCode}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    let history = getHistory();
                    const index = history.findIndex(item => item.short_code === shortCode);
                    if (index !== -1) {
                        history[index].clicks = data.clicks;
                        saveHistory(history);
                        renderHistory();
                        showToast(`Stats updated: ${data.clicks} total clicks!`);
                    }
                }
            })
            .catch(() => {
                showToast('Failed to connect to monitoring station.', 'error');
            })
            .finally(() => {
                if (btnElement) {
                    btnElement.classList.remove('fa-spin', 'text-cyan');
                }
            });
    }

    function renderHistory() {
        const history = getHistory();
        historyCount.textContent = `${history.length} Link${history.length !== 1 ? 's' : ''}`;
        
        if (history.length === 0) {
            historyGrid.style.display = 'none';
            historyEmpty.style.display = 'block';
            return;
        }
        
        historyEmpty.style.display = 'none';
        historyGrid.style.display = 'grid';
        historyGrid.innerHTML = '';
        
        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card glass-panel';
            
            // Format nice creation details
            const ageText = item.created_at ? formatTimeAgo(item.created_at) : 'Active';
            
            card.innerHTML = `
                <div class="history-card-top">
                    <div class="history-urls">
                        <a href="${item.short_url}" target="_blank" class="history-short">${item.short_url}</a>
                        <a href="${item.original_url}" target="_blank" class="history-long" title="${item.original_url}">${item.original_url}</a>
                    </div>
                    <div class="history-card-actions">
                        <button class="action-btn card-copy" data-link="${item.short_url}" title="Copy Link">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                        <button class="action-btn card-track" data-code="${item.short_code}" title="Load to Telemetry">
                            <i class="fa-solid fa-gauge-high"></i>
                        </button>
                        <button class="action-btn card-delete" data-code="${item.short_code}" title="Delete Record" style="color: var(--neon-rose);">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="history-card-bottom">
                    <div class="history-stat">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${ageText}</span>
                    </div>
                    <div class="history-stat">
                        <span>Clicks:</span>
                        <span class="history-stat-val">${item.clicks}</span>
                        <button class="history-sync" data-code="${item.short_code}" title="Sync Clicks">
                            <i class="fa-solid fa-arrows-rotate sync-icon"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Wire card event listeners
            card.querySelector('.card-copy').addEventListener('click', (e) => {
                const link = e.currentTarget.getAttribute('data-link');
                navigator.clipboard.writeText(link).then(() => {
                    showToast('Link copied to clipboard!');
                });
            });
            
            card.querySelector('.card-track').addEventListener('click', (e) => {
                const code = e.currentTarget.getAttribute('data-code');
                analyticsCodeInput.value = code;
                // Switch tab programmatically
                document.querySelector('[data-tab="analytics-tab"]').click();
                fetchAnalytics(code);
            });
            
            card.querySelector('.card-delete').addEventListener('click', (e) => {
                const code = e.currentTarget.getAttribute('data-code');
                deleteFromHistory(code);
            });
            
            card.querySelector('.history-sync').addEventListener('click', (e) => {
                const code = e.currentTarget.getAttribute('data-code');
                const icon = e.currentTarget.querySelector('.sync-icon');
                syncItemStats(code, icon);
            });
            
            historyGrid.appendChild(card);
        });
    }

    // ==========================================
    // 4. Shortener Controller (API submission)
    // ==========================================
    shortenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const longUrl = longUrlInput.value.trim();
        
        // Dynamic Frontend Validation
        if (!longUrl) {
            urlError.textContent = 'Please enter a destination URL.';
            urlError.classList.add('active');
            return;
        }
        
        urlError.classList.remove('active');
        
        // Set loading states
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Shortening...';
        submitBtn.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
        
        fetch('/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: longUrl })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Populate Result details
                shortenedUrlInput.value = data.short_url;
                resCodeSpan.textContent = data.short_code;
                openBtn.href = data.short_url;
                
                // Set Copy button states back
                const copyIcon = copyBtn.querySelector('i');
                const copyTooltip = copyBtn.querySelector('.tooltip');
                copyIcon.className = 'fa-regular fa-copy';
                copyTooltip.textContent = 'Copy Link';
                
                // Hide QR Accordion by default
                qrAccordion.classList.remove('open');
                qrCodeImg.style.display = 'none';
                qrDownloadBtn.style.display = 'none';
                qrLoading.style.display = 'block';
                
                // Show Result Box with CSS transition
                resultBox.classList.add('active');
                
                // Add to registry (default click count is 0, fetch current timestamp)
                const newRecord = {
                    short_code: data.short_code,
                    short_url: data.short_url,
                    original_url: data.original_url,
                    clicks: 0,
                    created_at: new Date().toISOString()
                };
                addToHistory(newRecord);
                showToast('Path successfully shortened!');
                
                // Scroll result card into view nicely
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                urlError.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${data.error}`;
                urlError.classList.add('active');
            }
        })
        .catch(err => {
            urlError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> System down. Connection could not be established.';
            urlError.classList.add('active');
        })
        .finally(() => {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Shorten';
            submitBtn.querySelector('i').className = 'fa-solid fa-arrow-right';
        });
    });

    // Copy to Clipboard Action
    copyBtn.addEventListener('click', () => {
        const link = shortenedUrlInput.value;
        const icon = copyBtn.querySelector('i');
        const tooltip = copyBtn.querySelector('.tooltip');
        
        navigator.clipboard.writeText(link).then(() => {
            // Success animation states
            icon.className = 'fa-solid fa-check text-cyan';
            tooltip.textContent = 'Copied!';
            showToast('Short URL copied to clipboard!');
            
            // Revert back
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
                tooltip.textContent = 'Copy Link';
            }, 2000);
        }).catch(() => {
            showToast('Failed to auto-copy link. Please highlight and copy manually.', 'error');
        });
    });

    // QR Code Generation Trigger
    qrToggle.addEventListener('click', () => {
        qrAccordion.classList.toggle('open');
        
        if (qrAccordion.classList.contains('open') && qrCodeImg.style.display === 'none') {
            const shortUrl = shortenedUrlInput.value;
            // Generate clean QR code utilizing the public HTTP API
            const size = '150x150';
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(shortUrl)}`;
            
            qrCodeImg.src = qrApiUrl;
            
            qrCodeImg.onload = () => {
                qrLoading.style.display = 'none';
                qrCodeImg.style.display = 'block';
                qrDownloadBtn.href = qrApiUrl;
                qrDownloadBtn.style.display = 'inline-flex';
            };
            
            qrCodeImg.onerror = () => {
                qrLoading.innerHTML = '<i class="fa-solid fa-circle-xmark text-rose"></i> QR Generation Failed.';
            };
        }
    });

    // ==========================================
    // 5. Analytics Telemetry Controller
    // ==========================================
    function fetchAnalytics(code) {
        if (!code) {
            analyticsError.textContent = 'Please enter a short code or short URL.';
            analyticsError.classList.add('active');
            metricsBox.style.display = 'none';
            return;
        }
        
        analyticsError.classList.remove('active');
        refreshMetricsBtn.classList.add('spinning');
        
        fetch(`/api/analytics/${code}`)
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Link not found'); });
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    // Populate Telemetry Display
                    metricClicks.textContent = data.clicks;
                    metricDate.textContent = formatFullDate(data.created_at);
                    metricAge.textContent = formatTimeAgo(data.created_at);
                    metricCode.textContent = data.short_code;
                    
                    metricTarget.textContent = data.original_url;
                    metricTarget.href = data.original_url;
                    
                    // Show Dashboard card
                    metricsBox.style.display = 'block';
                    metricsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    
                    // Update click stats in localStorage history if present
                    let history = getHistory();
                    const index = history.findIndex(item => item.short_code === data.short_code);
                    if (index !== -1) {
                        history[index].clicks = data.clicks;
                        saveHistory(history);
                        renderHistory();
                    }
                    
                    showToast('Telemetry data synced successfully!');
                }
            })
            .catch(err => {
                analyticsError.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message || 'Verification link does not exist.'}`;
                analyticsError.classList.add('active');
                metricsBox.style.display = 'none';
            })
            .finally(() => {
                refreshMetricsBtn.classList.remove('spinning');
            });
    }

    fetchAnalyticsBtn.addEventListener('click', () => {
        const rawInput = analyticsCodeInput.value.trim();
        const code = extractShortCode(rawInput);
        fetchAnalytics(code);
    });

    analyticsCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const rawInput = analyticsCodeInput.value.trim();
            const code = extractShortCode(rawInput);
            fetchAnalytics(code);
        }
    });

    refreshMetricsBtn.addEventListener('click', () => {
        const code = metricCode.textContent;
        fetchAnalytics(code);
    });

    // ==========================================
    // 6. Init Calls
    // ==========================================
    renderHistory();
    longUrlInput.focus();
});
