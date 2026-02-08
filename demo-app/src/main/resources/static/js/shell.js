/**
 * Shell Application - Micro Frontend Container
 * Orchestrates all micro frontend modules
 * Like the "Resume Template" that contains all sections
 */

(function() {
    'use strict';

    class ShellApplication {
        constructor() {
            this.modules = {
                producer: null,
                consumer: null,
                analytics: null
            };
            this.healthCheckInterval = null;
            this.isReady = false;
        }

        async init() {
            console.log('🚀 Shell Application: Starting...');
            
            // Wait for all modules to load
            await this.waitForModules();
            
            // Register modules
            this.registerModules();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            // Add global error handler
            this.setupErrorHandling();
            
            // Mark as ready
            this.isReady = true;
            this.onReady();
            
            console.log('✅ Shell Application: Ready');
        }

        /**
         * Wait for all modules to load
         */
        async waitForModules() {
            const maxWait = 5000; // 5 seconds
            const startTime = Date.now();
            
            while (!window.producerModule || !window.consumerModule || !window.analyticsModule) {
                if (Date.now() - startTime > maxWait) {
                    console.error('⚠️ Timeout waiting for modules to load');
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        /**
         * Register Module References
         */
        registerModules() {
            this.modules.producer = window.producerModule;
            this.modules.consumer = window.consumerModule;
            this.modules.analytics = window.analyticsModule;
            
            console.log('📦 Modules registered:', {
                producer: !!this.modules.producer,
                consumer: !!this.modules.consumer,
                analytics: !!this.modules.analytics
            });
        }

        /**
         * Health Monitoring
         */
        async startHealthMonitoring() {
            // Initial health check
            await this.checkHealth();
            
            // Periodic health checks every 30 seconds
            this.healthCheckInterval = setInterval(async () => {
                await this.checkHealth();
            }, 30000);
        }

        async checkHealth() {
            const result = await apiClient.checkHealth();
            this.updateHealthStatus(result.success);
        }

        /**
         * Update Health Status Display
         */
        updateHealthStatus(isHealthy) {
            const statusEl = document.getElementById('healthStatus');
            const statusIcon = document.getElementById('healthStatusIcon');
            
            if (statusEl && statusIcon) {
                if (isHealthy) {
                    statusEl.textContent = 'Online';
                    statusEl.className = 'status-badge online';
                    statusIcon.textContent = '🟢';
                } else {
                    statusEl.textContent = 'Offline';
                    statusEl.className = 'status-badge offline';
                    statusIcon.textContent = '🔴';
                }
            }
        }

        /**
         * Error Handling
         */
        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.handleError(event.error);
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                this.handleError(event.reason);
            });
        }

        handleError(error) {
            // Could implement toast notifications, error logging, etc.
            console.error('Application error:', error);
        }

        /**
         * On Ready Callback
         */
        onReady() {
            // Add pulsing animation to indicate ready state
            document.body.classList.add('app-ready');
            
            // Log comprehensive status
            console.log('📊 Application Status:', {
                ready: this.isReady,
                modules: Object.keys(this.modules).filter(key => this.modules[key]),
                timestamp: new Date().toISOString()
            });
            
            // Check if there are any query parameters for deep linking
            this.handleDeepLinks();
        }

        /**
         * Handle Deep Links (e.g., ?action=send&message=test)
         */
        handleDeepLinks() {
            const params = new URLSearchParams(window.location.search);
            
            if (params.has('action')) {
                const action = params.get('action');
                
                switch(action) {
                    case 'send':
                        const message = params.get('message') || 'Auto-generated message';
                        if (this.modules.producer) {
                            setTimeout(() => {
                                document.getElementById('messageInput').value = message;
                            }, 100);
                        }
                        break;
                    default:
                        console.log('Unknown action:', action);
                }
            }
        }

        /**
         * Get Application Stats
         */
        getStats() {
            return {
                isReady: this.isReady,
                modules: {
                    producer: this.modules.producer?.getStats() || null,
                    consumer: this.modules.consumer?.getStats() || null,
                    analytics: this.modules.analytics?.getMetrics() || null
                },
                uptime: performance.now()
            };
        }

        /**
         * Cleanup on page unload
         */
        destroy() {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }
            
            // Stop consumer auto-refresh
            if (this.modules.consumer) {
                this.modules.consumer.stopAutoRefresh();
            }
            
            console.log('👋 Shell Application: Destroyed');
        }
    }

    // Create global shell instance
    const shell = new ShellApplication();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => shell.init());
    } else {
        shell.init();
    }

    // Cleanup on unload
    window.addEventListener('beforeunload', () => shell.destroy());

    // Expose shell globally
    window.shellApp = shell;

    // Global utility functions
    window.getAppStats = function() {
        const stats = shell.getStats();
        console.table(stats.modules);
        return stats;
    };

    // Add ready state CSS
    const style = document.createElement('style');
    style.textContent = `
        body {
            opacity: 0.95;
            transition: opacity 0.3s ease;
        }
        body.app-ready {
            opacity: 1;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .status-badge.online {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
        }
        .status-badge.offline {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
        }
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
        }
        .empty-icon {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);

})();
