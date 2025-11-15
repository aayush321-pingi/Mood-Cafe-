// Admin Control System
const AdminSystem = {
    // Store admin data
    data: {
        menuItems: [],
        users: [],
        orders: [],
        stats: {
            totalUsers: 0,
            totalOrders: 0,
            revenue: 0,
            activeUsers: 0
        }
    },

    // Initialize admin system
    init() {
        this.loadInitialData();
        this.setupEventListeners();
        this.updateDashboard();
    },

    // Load mock data (in real app, this would come from a database)
    loadInitialData() {
        // Mock menu items
        this.data.menuItems = [
            {
                id: 1,
                name: "Butter Chicken",
                category: "Main Course",
                price: 350,
                description: "Tender chicken in rich tomato gravy",
                image: "https://source.unsplash.com/320x240/?butter-chicken",
                status: "available"
            },
            {
                id: 2,
                name: "Masala Dosa",
                category: "Breakfast",
                price: 120,
                description: "Crispy crepe with spiced potato filling",
                image: "https://source.unsplash.com/320x240/?dosa",
                status: "available"
            }
        ];

        // Mock users
        this.data.users = [
            {
                id: 1,
                name: "Rahul Singh",
                email: "rahul@example.com",
                orders: 15,
                status: "active"
            },
            {
                id: 2,
                name: "Priya Sharma",
                email: "priya@example.com",
                orders: 8,
                status: "active"
            }
        ];

        // Mock stats
        this.data.stats = {
            totalUsers: 45,
            totalOrders: 128,
            revenue: 45620,
            activeUsers: 12
        };
    },

    // Setup event listeners for all interactive elements
    setupEventListeners() {
        // Login form handler
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Section navigation
        document.querySelectorAll('[data-section]').forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                this.showSection(sectionId);
            });
        });

        // Logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    },

    // Handle admin login
    handleLogin(e) {
        e.preventDefault();
        const adminId = document.getElementById('adminId').value;
        const password = document.getElementById('adminPassword').value;

        // Simple mock authentication (In real app, this would be server-side)
        if (adminId === 'admin' && password === 'admin123') {
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('adminInterface').classList.remove('hidden');
            this.updateDashboard();
        } else {
            alert('Invalid credentials');
        }
    },

    // Handle admin logout
    handleLogout() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('adminInterface').classList.add('hidden');
    },

    // Show selected section
    showSection(sectionId) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            this.updateSectionContent(sectionId);
        }
    },

    // Update section content
    updateSectionContent(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'users':
                this.updateUsersTable();
                break;
            case 'menu':
                this.updateMenuGrid();
                break;
            case 'orders':
                this.updateOrdersTable();
                break;
        }
    },

    // Update dashboard stats
    updateDashboard() {
        // Update stats cards
        document.getElementById('totalUsersCount').textContent = this.data.stats.totalUsers;
        document.getElementById('totalOrdersCount').textContent = this.data.stats.totalOrders;
        document.getElementById('totalRevenue').textContent = '₹' + this.data.stats.revenue.toLocaleString();
        document.getElementById('activeUsersCount').textContent = this.data.stats.activeUsers;
    },

    // Update users table
    updateUsersTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (tbody) {
            tbody.innerHTML = this.data.users.map(user => `
                <tr class="hover:bg-gray-700">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <span class="text-sm">${user.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <span>${user.name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">${user.email}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                            ${user.status}
                        </span>
                    </td>
                    <td class="px-6 py-4">${user.orders} orders</td>
                    <td class="px-6 py-4">
                        <button class="text-gray-400 hover:text-white mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    },

    // Update menu grid
    updateMenuGrid() {
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            // Group items by category
            const categories = {};
            this.data.menuItems.forEach(item => {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            });

            menuGrid.innerHTML = Object.entries(categories).map(([category, items]) => `
                <div class="bg-gray-800 p-6 rounded-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold">${category}</h3>
                        <button class="text-purple-500 hover:text-purple-400">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        ${items.map(item => `
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <img src="${item.image}" class="w-10 h-10 rounded-lg object-cover" alt="${item.name}">
                                    <div>
                                        <h4 class="font-medium">${item.name}</h4>
                                        <p class="text-sm text-gray-400">₹${item.price}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="AdminSystem.editMenuItem(${item.id})" class="text-gray-400 hover:text-white">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="AdminSystem.deleteMenuItem(${item.id})" class="text-gray-400 hover:text-red-500">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    },

    // Update orders table
    updateOrdersTable() {
        // Implementation for orders table update
    }
};

// Initialize admin system when document is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminSystem.init();
});