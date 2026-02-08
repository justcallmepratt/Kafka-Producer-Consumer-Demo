/**
 * Consumer Module - Micro Frontend
 * Independent module for message consumption and display
 * Like a "Project Portfolio" section in a resume
 */

(function() {
    'use strict';

    class ConsumerModule {
        constructor() {
            this.messages = [];
            this.autoRefreshInterval = null;
            this.refreshRate = 3000; // 3 seconds
            this.init();
        }

        init() {
            // Subscribe to events
            apiClient.subscribe('refresh-messages', () => this.refreshMessages());
            apiClient.subscribe('message-sent', (data) => this.onMessageSent(data));
            
            // Initial load
            this.refreshMessages();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            console.log('📥 Consumer Module: Initialized');
        }

        /**
         * Refresh Messages from API
         */
        async refreshMessages() {
            const result = await apiClient.getMessagesWithMetadata();
            
            if (result.success) {
                this.messages = result.data || [];
                this.renderMessages();
                
                // Notify analytics
                apiClient.publish('messages-updated', {
                    count: this.messages.length,
                    messages: this.messages
                });
            } else {
                console.error('Failed to fetch messages:', result.error);
            }
        }

        /**
         * Render Messages in Timeline
         */
        renderMessages() {
            const timeline = document.getElementById('messageTimeline');
            if (!timeline) return;

            if (this.messages.length === 0) {
                timeline.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No messages consumed yet</p>
                        <small>Send a message from the Producer to get started</small>
                    </div>
                `;
                return;
            }

            // Render messages in reverse chronological order
            const html = this.messages.map(msg => this.createMessageItem(msg)).join('');
            timeline.innerHTML = html;

            // Update message count in header
            this.updateMessageCount();
        }

        /**
         * Create Single Message Item (Resume Style)
         */
        createMessageItem(msg) {
            const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
            const formattedTime = this.formatTime(timestamp);
            const formattedDate = this.formatDate(timestamp);
            
            return `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <div>
                                ${msg.key ? `<div class="message-key">🔑 ${this.escapeHtml(msg.key)}</div>` : ''}
                                <div class="message-time">${formattedDate} at ${formattedTime}</div>
                            </div>
                        </div>
                        <div class="message-content">
                            ${this.escapeHtml(msg.content)}
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Clear All Messages
         */
        async clearAllMessages() {
            if (!confirm('Are you sure you want to clear all consumed messages?')) {
                return;
            }

            const result = await apiClient.clearMessages();
            
            if (result.success) {
                this.messages = [];
                this.renderMessages();
                
                // Notify analytics
                apiClient.publish('messages-cleared');
                
                console.log('✅ All messages cleared');
            } else {
                console.error('Failed to clear messages:', result.error);
                alert('Failed to clear messages. Please try again.');
            }
        }

        /**
         * Auto-Refresh Control
         */
        startAutoRefresh() {
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
            }
            
            this.autoRefreshInterval = setInterval(() => {
                this.refreshMessages();
            }, this.refreshRate);
        }

        stopAutoRefresh() {
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
                this.autoRefreshInterval = null;
            }
        }

        /**
         * Event Handler: Message Sent
         */
        onMessageSent(data) {
            // Optionally show optimistic update
            console.log('Message sent notification received', data);
        }

        /**
         * Update Message Count in Header
         */
        updateMessageCount() {
            const countEl = document.getElementById('messageCount');
            if (countEl) {
                const count = this.messages.length;
                countEl.textContent = `${count} Message${count !== 1 ? 's' : ''}`;
            }
        }

        /**
         * Utility: Format Time
         */
        formatTime(date) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        /**
         * Utility: Format Date
         */
        formatDate(date) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        /**
         * Utility: Escape HTML
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Get Statistics
         */
        getStats() {
            return {
                totalMessages: this.messages.length,
                latestMessage: this.messages[0] || null
            };
        }
    }

    // Create global instance
    window.consumerModule = new ConsumerModule();

    // Global functions for HTML onclick handlers
    window.refreshMessages = function() {
        window.consumerModule.refreshMessages();
    };

    window.clearAllMessages = function() {
        window.consumerModule.clearAllMessages();
    };

    // Pause refresh when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.consumerModule.stopAutoRefresh();
        } else {
            window.consumerModule.startAutoRefresh();
        }
    });

})();
