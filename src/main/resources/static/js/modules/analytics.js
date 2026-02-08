/**
 * Analytics Module - Micro Frontend
 * Independent module for metrics and monitoring
 * Like a "Skills & Achievements" section in a resume
 */

(function() {
    'use strict';

    class AnalyticsModule {
        constructor() {
            this.metrics = {
                totalMessages: 0,
                messagesPerMinute: 0,
                averageLatency: 0,
                successRate: 100,
                recentLatencies: [],
                messageTimes: []
            };
            this.init();
        }

        init() {
            // Subscribe to events
            apiClient.subscribe('message-sent', (data) => this.recordMessageSent(data));
            apiClient.subscribe('messages-updated', (data) => this.updateFromMessages(data));
            apiClient.subscribe('messages-cleared', () => this.resetMetrics());
            
            // Initial render
            this.renderStats();
            
            // Update messages per minute every 10 seconds
            setInterval(() => this.calculateMessagesPerMinute(), 10000);
            
            console.log('📊 Analytics Module: Initialized');
        }

        /**
         * Record Message Sent Event
         */
        recordMessageSent(data) {
            this.metrics.totalMessages++;
            
            // Record latency
            if (data.latency) {
                this.metrics.recentLatencies.push(data.latency);
                // Keep only last 100 latencies
                if (this.metrics.recentLatencies.length > 100) {
                    this.metrics.recentLatencies.shift();
                }
                this.calculateAverageLatency();
            }
            
            // Record timestamp for rate calculation
            this.metrics.messageTimes.push(Date.now());
            // Keep only last 5 minutes of timestamps
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            this.metrics.messageTimes = this.metrics.messageTimes.filter(
                time => time > fiveMinutesAgo
            );
            
            this.renderStats();
        }

        /**
         * Update from Consumer Messages
         */
        updateFromMessages(data) {
            if (data.count !== undefined) {
                this.metrics.totalMessages = data.count;
            }
            this.calculateMessagesPerMinute();
            this.renderStats();
        }

        /**
         * Calculate Average Latency
         */
        calculateAverageLatency() {
            if (this.metrics.recentLatencies.length === 0) {
                this.metrics.averageLatency = 0;
                return;
            }
            
            const sum = this.metrics.recentLatencies.reduce((a, b) => a + b, 0);
            this.metrics.averageLatency = Math.round(sum / this.metrics.recentLatencies.length);
        }

        /**
         * Calculate Messages Per Minute
         */
        calculateMessagesPerMinute() {
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            
            const messagesInLastMinute = this.metrics.messageTimes.filter(
                time => time > oneMinuteAgo
            ).length;
            
            this.metrics.messagesPerMinute = messagesInLastMinute;
            this.renderStats();
        }

        /**
         * Reset Metrics
         */
        resetMetrics() {
            this.metrics = {
                totalMessages: 0,
                messagesPerMinute: 0,
                averageLatency: 0,
                successRate: 100,
                recentLatencies: [],
                messageTimes: []
            };
            this.renderStats();
        }

        /**
         * Render Statistics  
         */
        renderStats() {
            this.updateStatCard('totalMessages', this.formatNumber(this.metrics.totalMessages));
            this.updateStatCard('messagesPerMinute', this.formatNumber(this.metrics.messagesPerMinute));
            this.updateStatCard('avgLatency', `${this.metrics.averageLatency}ms`);
            this.updateStatCard('successRate', `${this.metrics.successRate}%`);
        }

        /**
         * Update Individual Stat Card
         */
        updateStatCard(id, value) {
            const el = document.getElementById(id);
            if (el) {
                // Animate change
                el.style.transform = 'scale(1.1)';
                el.textContent = value;
                
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }
        }

        /**
         * Format Number with Commas
         */
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        /**
         * Get Current Metrics
         */
        getMetrics() {
            return { ...this.metrics };
        }

        /**
         * Export Metrics (for reporting)
         */
        exportMetrics() {
            const report = {
                timestamp: new Date().toISOString(),
                metrics: this.getMetrics(),
                summary: {
                    totalMessages: this.metrics.totalMessages,
                    currentRate: `${this.metrics.messagesPerMinute} msg/min`,
                    performance: `${this.metrics.averageLatency}ms avg latency`,
                    reliability: `${this.metrics.successRate}% success rate`
                }
            };
            
            console.log('📊 Analytics Report:', report);
            return report;
        }
    }

    // Create global instance
    window.analyticsModule = new AnalyticsModule();

    // Add stats transition CSS if not already present
    const style = document.createElement('style');
    style.textContent = `
        .stat-value {
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);

})();
