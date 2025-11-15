// Admin Control System for Mood Cafe
class MoodCafeAdmin {
    constructor() {
        this.storageKey = 'moodCafeAdminData';
        this.initializeData();
        this.syncWithBookings();
        this.setupStorageListener();
    }

    syncWithBookings(){
        // Listen for booking updates and add them to orders
        window.addEventListener('bookingManagerUpdate', (e) => {
            if(e.detail.type === 'bookingDataUpdate'){
                const bookings = e.detail.payload.bookings || [];
                const data = this.getData();
                // sync bookings as orders
                data.orders = bookings.map(b => ({
                    id: b.id,
                    user: b.userName,
                    total: b.total,
                    date: b.date || new Date().toISOString().split('T')[0],
                    status: b.status
                }));
                this.saveData(data);
            }
        });
    }

    // Listen for cross-tab localStorage changes so admin UI stays live across tabs
    setupStorageListener(){
        window.addEventListener('storage', (e)=>{
            if(!e.key) return;
            if(e.key === this.storageKey){
                try{
                    const newData = JSON.parse(e.newValue || '{}');
                    // replace local storage copy and broadcast
                    localStorage.setItem(this.storageKey, JSON.stringify(newData));
                    this.broadcastChange('dataUpdate', { data: newData });
                }catch(err){
                    console.warn('Failed to parse admin storage event', err);
                }
            }
        });
    }

    async initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            // If running from file:// or fetch fails, use default data
            const isFile = window.location.protocol === 'file:';
            if (isFile) {
                this.saveData(this.getDefaultData());
                return;
            }
            try {
                const response = await fetch('assets/data/initialData.json');
                if (!response.ok) throw new Error('Fetch failed');
                const initialData = await response.json();
                initialData.settings = {
                    isMaintenanceMode: false,
                    allowNewRegistrations: true,
                    featuredItems: []
                };
                this.saveData(initialData);
            } catch (error) {
                console.error('Failed to load initial data:', error);
                this.saveData(this.getDefaultData());
            }
        }
    }

    getDefaultData() {
        return {
            menuItems: [],
            users: [],
            orders: [],
            events: [],
            settings: {
                isMaintenanceMode: false,
                allowNewRegistrations: true,
                featuredItems: []
            },
            stats: {
                totalUsers: 0,
                totalOrders: 0,
                revenue: 0
            }
        };
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || this.getDefaultData();
    }

    saveData(data) {
        // Recalculate derived stats before saving
        data.stats = this.recalculateStats(data);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.broadcastChange('dataUpdate', { data });
    }

    // Recalculate summary statistics from stored data
    recalculateStats(data) {
        const totalUsers = (data.users || []).length;
        const totalOrders = (data.orders || []).length;
        const revenue = (data.orders || []).reduce((s, o) => s + (Number(o.total) || 0), 0);
        return {
            totalUsers,
            totalOrders,
            revenue,
            activeUsers: Math.min(totalUsers, Math.floor(totalUsers * 0.12))
        };
    }

    // Add user (frontend-friendly)
    addUser(user) {
        const data = this.getData();
        const id = Date.now();
        data.users.push({ ...user, id });
        this.saveData(data);
        this.broadcastChange('userAdd', { user: { ...user, id } });
        return id;
    }

    // Add order / transaction
    addOrder(order) {
        const data = this.getData();
        const id = Date.now();
        data.orders.push({ ...order, id });
        this.saveData(data);
        this.broadcastChange('orderAdd', { order: { ...order, id } });
        return id;
    }

    // Menu Management
    updateMenuItem(itemId, updates) {
        const data = this.getData();
        const index = data.menuItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            data.menuItems[index] = { ...data.menuItems[index], ...updates };
            this.saveData(data);
            this.broadcastChange('menuUpdate', { itemId, updates });
        }
    }

    addMenuItem(item) {
        const data = this.getData();
        data.menuItems.push({ ...item, id: Date.now() });
        this.saveData(data);
        this.broadcastChange('menuAdd', { item });
    }

    removeMenuItem(itemId) {
        const data = this.getData();
        data.menuItems = data.menuItems.filter(item => item.id !== itemId);
        this.saveData(data);
        this.broadcastChange('menuRemove', { itemId });
    }

    // User Management
    updateUser(userId, updates) {
        const data = this.getData();
        const index = data.users.findIndex(user => user.id === userId);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates };
            this.saveData(data);
            this.broadcastChange('userUpdate', { userId, updates });
        }
    }

    // Broadcast changes
    broadcastChange(type, payload) {
        const event = new CustomEvent('moodCafeAdminUpdate', {
            detail: { type, payload }
        });
        window.dispatchEvent(event);
    }
}

// Create global instance
window.moodCafeAdmin = new MoodCafeAdmin();