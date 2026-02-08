/**
 * API Client - Core Module
 * Micro Frontend: Shared Service Layer
 * Follows resume-like structure: Clean, professional, modular
 */

class APIClient {
    constructor(baseURL = '/api/kafka') {
        this.baseURL = baseURL;
        this.subscribers = {};
    }

    /**
     * HTTP Request Helper
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return { success: true, data };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Producer API - Send Message
     */
    async produceMessage(message, key = null) {
        const payload = { message };
        if (key) payload.key = key;
        
        return await this.request('/produce', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    /**
     * Consumer API - Get Messages (Simple)
     */
    async getMessages() {
        return await this.request('/consume', {
            method: 'GET'
        });
    }

    /**
     * Consumer API - Get Messages with Metadata
     */
    async getMessagesWithMetadata() {
        return await this.request('/messages', {
            method: 'GET'
        });
    }

    /**
     * Admin API - Clear All Messages
     */
    async clearMessages() {
        return await this.request('/consume', {
            method: 'DELETE'
        });
    }

    /**
     * Health Check
     */
    async checkHealth() {
        try {
            const response = await fetch('/actuator/health');
            const data = await response.json();
            return { 
                success: response.ok && data.status === 'UP',
                data 
            };
        } catch (error) {
            return { 
                success: false, 
                data: { status: 'DOWN', error: error.message } 
            };
        }
    }

    /**
     * Event Bus - Publish/Subscribe Pattern
     * Enables micro frontend communication
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    publish(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback(data));
        }
    }

    /**
     * Unsubscribe from events
     */
    unsubscribe(event, callback) {
        if (this.subscribers[event]) {
            this.subscribers[event] = this.subscribers[event].filter(
                cb => cb !== callback
            );
        }
    }
}

// Create singleton instance
window.apiClient = new APIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
