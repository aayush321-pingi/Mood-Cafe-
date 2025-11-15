// Live monitoring system for Mood Cafe
class MoodCafeMonitor {
    constructor() {
        this.metrics = {
            activeUsers: new Set(),
            pageViews: 0,
            peakHours: Array(24).fill(0),
            popularItems: new Map(),
            errors: []
        };
        this.startMonitoring();
    }

    startMonitoring() {
        // Listen for admin system updates
        window.addEventListener('moodCafeAdminUpdate', (event) => {
            const { type, payload } = event.detail;
            this.handleAdminUpdate(type, payload);
        });

        // Monitor page views
        this.metrics.pageViews++;
        this.broadcastMetrics();

        // Set up error monitoring
        window.addEventListener('error', (event) => {
            this.logError(event.error);
        });
    }

    handleAdminUpdate(type, payload) {
        switch (type) {
            case 'menuUpdate':
            case 'menuAdd':
            case 'menuRemove':
                this.updateMenuMetrics();
                break;
            case 'orderAdd':
                this.updateOrderMetrics(payload);
                break;
            case 'userActivity':
                this.trackUserActivity(payload);
                break;
        }
    }

    updateMenuMetrics() {
        const data = window.moodCafeAdmin.getData();
        // Update popular items based on orders
        data.orders?.forEach(order => {
            order.items?.forEach(item => {
                const count = this.metrics.popularItems.get(item.name) || 0;
                this.metrics.popularItems.set(item.name, count + 1);
            });
        });
        this.broadcastMetrics();
    }

    updateOrderMetrics(payload) {
        const hour = new Date().getHours();
        this.metrics.peakHours[hour]++;
        this.broadcastMetrics();
    }

    trackUserActivity(payload) {
        if (payload.type === 'login') {
            this.metrics.activeUsers.add(payload.userId);
        } else if (payload.type === 'logout') {
            this.metrics.activeUsers.delete(payload.userId);
        }
        this.broadcastMetrics();
    }

    logError(error) {
        this.metrics.errors.push({
            timestamp: new Date(),
            message: error.message,
            stack: error.stack
        });
        this.broadcastMetrics();
    }

    getMetrics() {
        return {
            activeUsers: this.metrics.activeUsers.size,
            pageViews: this.metrics.pageViews,
            peakHours: [...this.metrics.peakHours],
            popularItems: Object.fromEntries(this.metrics.popularItems),
            recentErrors: this.metrics.errors.slice(-5)
        };
    }

    broadcastMetrics() {
        const event = new CustomEvent('moodCafeMetricsUpdate', {
            detail: this.getMetrics()
        });
        window.dispatchEvent(event);
    }
}

// Create global instance
window.moodCafeMonitor = new MoodCafeMonitor();