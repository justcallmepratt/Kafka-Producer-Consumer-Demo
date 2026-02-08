/**
 * Producer Module - Micro Frontend
 * Independent module for message production
 * Like a "Professional Experience" section in a resume
 */

(function() {
    'use strict';

    class ProducerModule {
        constructor() {
            this.messagesSent = 0;
            this.lastSentTime = null;
            this.init();
        }

        init() {
            // Subscribe to global events
            apiClient.subscribe('clear-producer', () => this.clearForm());
            
            console.log('📤 Producer Module: Initialized');
        }

        /**
         * Send Message
         */
        async sendMessage(message, key = null) {
            if (!message || message.trim() === '') {
                this.showStatus('Message cannot be empty', 'error');
                return false;
            }

            const startTime = Date.now();
            
            // Show loading state
            const btn = document.querySelector('.btn-primary-resume');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="btn-icon">⏳</span> Sending...';
            btn.disabled = true;

            // Send via API
            const result = await apiClient.produceMessage(message, key);

            // Calculate latency
            const latency = Date.now() - startTime;

            // Restore button
            btn.innerHTML = originalText;
            btn.disabled = false;

            if (result.success) {
                this.messagesSent++;
                this.lastSentTime = new Date();
                
                this.showStatus(`Message sent successfully in ${latency}ms!`, 'success');
                this.clearForm();

                // Notify other modules
                apiClient.publish('message-sent', {
                    message,
                    key,
                    timestamp: new Date(),
                    latency
                });

                // Trigger consumer refresh
                setTimeout(() => {
                    apiClient.publish('refresh-messages');
                }, 500);

                return true;
            } else {
                this.showStatus(`Failed: ${result.error}`, 'error');
                return false;
            }
        }

        /**
         * Clear Form
         */
        clearForm() {
            const keyInput = document.getElementById('messageKey');
            const contentInput = document.getElementById('messageContent');
            
            if (keyInput) keyInput.value = '';
            if (contentInput) contentInput.value = '';
            
            this.hideStatus();
        }

        /**
         * Show Status Message
         */
        showStatus(message, type = 'success') {
            const statusEl = document.getElementById('producerStatus');
            if (!statusEl) return;

            statusEl.textContent = message;
            statusEl.className = `status-message ${type}`;
            
            setTimeout(() => this.hideStatus(), 5000);
        }

        /**
         * Hide Status
         */
        hideStatus() {
            const statusEl = document.getElementById('producerStatus');
            if (statusEl) {
                statusEl.className = 'status-message';
            }
        }

        /**
         * Get Statistics
         */
        getStats() {
            return {
                totalSent: this.messagesSent,
                lastSent: this.lastSentTime
            };
        }
    }

    // Create global instance
    window.producerModule = new ProducerModule();

    // Global functions for HTML onclick handlers
    window.sendMessage = function() {
        const key = document.getElementById('messageKey')?.value || null;
        const message = document.getElementById('messageContent')?.value || '';
        window.producerModule.sendMessage(message, key);
    };

    window.clearProducer = function() {
        window.producerModule.clearForm();
    };

})();
