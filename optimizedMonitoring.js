// Optimized Live monitoring system for Mood Cafe
class MoodCafeMonitor {
    constructor() {
        this.metrics = {
            activeUsers: new Set(),
            pageViews: 0,
            peakHours: Array(24).fill(0),
            popularItems: new Map(),
            errors: []
        };
        this.updateQueue = new Set(); // For batching updates
        this.isUpdating = false;
        this.debounceTimeout = null;
        this.startMonitoring();
    }

    startMonitoring() {
        // Use RequestAnimationFrame for smooth UI updates
        this.rafCallback = () => {
            this.processUpdateQueue();
            requestAnimationFrame(this.rafCallback);
        };
        requestAnimationFrame(this.rafCallback);

        // Listen for admin system updates with debouncing
        window.addEventListener('moodCafeAdminUpdate', this.debouncedHandleUpdate.bind(this));

        // Monitor page views with throttling
        this.throttledUpdatePageViews();

        // Set up error monitoring with rate limiting
        window.addEventListener('error', this.rateLimitedErrorHandler.bind(this));

        // Setup WebSocket connection for real server
        this.setupWebSocket();
    }

    // Debounced update handler (prevents rapid-fire updates)
    debouncedHandleUpdate(event) {
        const { type, payload } = event.detail;
        clearTimeout(this.debounceTimeout);
        
        this.debounceTimeout = setTimeout(() => {
            this.handleAdminUpdate(type, payload);
        }, 250); // Debounce time of 250ms
    }

    // Throttled page view updates
    throttledUpdatePageViews() {
        if (!this.pageViewThrottle) {
            this.metrics.pageViews++;
            this.pageViewThrottle = true;
            
            setTimeout(() => {
                this.pageViewThrottle = false;
            }, 1000); // Throttle to max 1 update per second
            
            this.queueUpdate('pageViews');
        }
    }

    // Rate-limited error handler
    rateLimitedErrorHandler(event) {
        if (!this.errorRateLimit) {
            this.errorRateLimit = 0;
        }

        const now = Date.now();
        if (now - this.errorRateLimit > 5000) { // Reset rate limit after 5 seconds
            this.errorRateLimit = now;
            this.logError(event.error);
        }
    }

    // Batched update processing
    processUpdateQueue() {
        if (this.updateQueue.size > 0 && !this.isUpdating) {
            this.isUpdating = true;
            const updates = Array.from(this.updateQueue);
            this.updateQueue.clear();

            // Process all queued updates in one batch
            const batchedMetrics = updates.reduce((acc, updateType) => {
                switch (updateType) {
                    case 'menuMetrics':
                        return { ...acc, ...this.calculateMenuMetrics() };
                    case 'orderMetrics':
                        return { ...acc, ...this.calculateOrderMetrics() };
                    case 'userMetrics':
                        return { ...acc, ...this.calculateUserMetrics() };
                    default:
                        return acc;
                }
            }, {});

            // Single broadcast for all updates
            this.broadcastMetrics(batchedMetrics);
            this.isUpdating = false;
        }
    }

    queueUpdate(updateType) {
        this.updateQueue.add(updateType);
    }

    // Optimized metrics calculations
    calculateMenuMetrics() {
        const data = window.moodCafeAdmin.getData();
        const popularItems = new Map();
        
        // Use more efficient array methods
        const itemCounts = data.orders?.reduce((acc, order) => {
            order.items?.forEach(item => {
                acc.set(item.name, (acc.get(item.name) || 0) + 1);
            });
            return acc;
        }, new Map());

        // Keep only top 10 items for performance
        Array.from(itemCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([name, count]) => popularItems.set(name, count));

        return { popularItems };
    }

    // WebSocket setup for real server implementation
    setupWebSocket() {
        // In production, replace with actual WebSocket server URL
        const wsUrl = location.protocol === 'https:' 
            ? 'wss://' + location.host + '/admin/ws'
            : 'ws://' + location.host + '/admin/ws';

        this.ws = new WebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketUpdate(data);
        };

        // Automatic reconnection
        this.ws.onclose = () => {
            setTimeout(() => this.setupWebSocket(), 3000);
        };
    }

    handleWebSocketUpdate(data) {
        switch (data.type) {
            case 'metrics':
                this.queueUpdate('metrics');
                break;
            case 'orders':
                this.queueUpdate('orderMetrics');
                break;
            case 'users':
                this.queueUpdate('userMetrics');
                break;
        }
    }

    // Memory management
    clearOldData() {
        const ONE_HOUR = 3600000;
        const now = Date.now();
        
        // Clear errors older than 1 hour
        this.metrics.errors = this.metrics.errors.filter(
            error => now - error.timestamp < ONE_HOUR
        );

        // Limit array sizes
        if (this.metrics.errors.length > 100) {
            this.metrics.errors = this.metrics.errors.slice(-100);
        }
    }

    // Optimized broadcast with memory cleanup
    broadcastMetrics(metrics = this.getMetrics()) {
        // Clean up old data periodically
        if (!this.lastCleanup || Date.now() - this.lastCleanup > 300000) {
            this.clearOldData();
            this.lastCleanup = Date.now();
        }

        const event = new CustomEvent('moodCafeMetricsUpdate', {
            detail: metrics
        });
        window.dispatchEvent(event);
    }
}

// Initialize with error handling
try {
    window.moodCafeMonitor = new MoodCafeMonitor();
} catch (error) {
    console.error('Failed to initialize monitoring:', error);
    // Implement fallback monitoring if needed
}