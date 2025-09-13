let currentUser = null;
let currentPage = 'login';
let institutions = [];
let departments = [];
let projects = [];
let transactions = [];
let charts = {};


const API_BASE_URL = '/api';


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const budgetData = [
    { department: "Education", allocated: "₹1.5 Cr", spent: "₹95 L", remaining: "₹55 L", utilization: "63%" },
    { department: "Healthcare", allocated: "₹1.2 Cr", spent: "₹78 L", remaining: "₹42 L", utilization: "65%" },
    { department: "Infrastructure", allocated: "₹1.0 Cr", spent: "₹65 L", remaining: "₹35 L", utilization: "65%" },
    { department: "Agriculture", allocated: "₹80 L", spent: "₹52 L", remaining: "₹28 L", utilization: "65%" },
    { department: "Technology", allocated: "₹50 L", spent: "₹30 L", remaining: "₹20 L", utilization: "60%" },
];

const tbody = document.getElementById("budgetTableBody");

budgetData.forEach((row) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.department}</td>
      <td>${row.allocated}</td>
      <td>${row.spent}</td>
      <td>${row.remaining}</td>
      <td>${row.utilization}</td>
      <td><button onclick="viewDetails('${row.department}')">View</button></td>
    `;

    tbody.appendChild(tr);
});

function viewDetails(department) {
    alert("Viewing details for: " + department);

}


const spendingData = [
    {
        department: "Health",
        category: "Medical Supplies",
        transactionId: "TXN1001",
        description: "Purchase of medicines for govt hospitals",
        amount: "₹2,50,000",
        date: "2025-09-01",
        status: "Approved",
        approvedBy: "Dr. A. Sharma"
    },
    {
        department: "Education",
        category: "Infrastructure",
        transactionId: "TXN1002",
        description: "Smart classroom equipment",
        amount: "₹5,00,000",
        date: "2025-09-03",
        status: "Pending",
        approvedBy: "-"
    },
    {
        department: "Transport",
        category: "Road Maintenance",
        transactionId: "TXN1003",
        description: "Repair of NH-44 section",
        amount: "₹10,00,000",
        date: "2025-09-05",
        status: "Approved",
        approvedBy: "Mr. R. Kumar"
    },
    {
        department: "Water Supply",
        category: "Pipeline Upgrade",
        transactionId: "TXN1004",
        description: "New water pipelines in rural areas",
        amount: "₹3,75,000",
        date: "2025-09-08",
        status: "Rejected",
        approvedBy: "-"
    }
];


const tableBody = document.getElementById("detailedSpendingTableBody");

spendingData.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${item.department}</td>
        <td>${item.category}</td>
        <td>${item.transactionId}</td>
        <td>${item.description}</td>
        <td>${item.amount}</td>
        <td>${item.date}</td>
        <td>${item.status}</td>
        <td>${item.approvedBy}</td>
    `;

    tableBody.appendChild(row);
});






const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};


const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },


    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getCurrentUser() {
        return this.request('/auth/me');
    },


    async getInstitutions() {
        return this.request('/institutions');
    },

    async getInstitution(id) {
        return this.request(`/institutions/${id}`);
    },

    async createInstitution(data) {
        return this.request('/institutions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateInstitution(id, data) {
        return this.request(`/institutions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteInstitution(id) {
        return this.request(`/institutions/${id}`, {
            method: 'DELETE'
        });
    },


    async getDepartments() {
        return this.request('/departments');
    },

    async getDepartment(id) {
        return this.request(`/departments/${id}`);
    },

    async createDepartment(data) {
        return this.request('/departments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateDepartment(id, data) {
        return this.request(`/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async getProjects() {
        return this.request('/projects');
    },

    async getProject(id) {
        return this.request(`/projects/${id}`);
    },

    async createProject(data) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateProject(id, data) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },


    async getTransactions(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/transactions${queryParams ? `?${queryParams}` : ''}`);
    },

    async getTransaction(id) {
        return this.request(`/transactions/${id}`);
    },

    async createTransaction(data) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateTransaction(id, data) {
        return this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async approveTransaction(id) {
        return this.request(`/transactions/${id}/approve`, {
            method: 'PUT'
        });
    },

    async rejectTransaction(id) {
        return this.request(`/transactions/${id}/reject`, {
            method: 'PUT'
        });
    },


    async getBudgetSummary(institutionId) {
        return this.request(`/budgets/summary/${institutionId}`);
    },

    async getDepartmentBudget(departmentId) {
        return this.request(`/budgets/department/${departmentId}`);
    },

    async getProjectBudget(projectId) {
        return this.request(`/budgets/project/${projectId}`);
    }
};


const ui = {
    showLoading() {
        document.getElementById('loading').classList.add('show');
    },

    hideLoading() {
        document.getElementById('loading').classList.remove('show');
    },

    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type]}"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    },

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('show');
    },

    hideModal() {
        document.getElementById('modal').classList.remove('show');
    },

    showPage(pageId) {

        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });


        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            currentPage = pageId;
        }


        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');


        this.loadPageData(pageId);
    },

    async loadPageData(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'institutions':
                    await this.loadInstitutions();
                    break;
                case 'budgets':
                    await this.loadBudgets();
                    break;
                case 'transactions':
                    await this.loadTransactions();
                    break;
                case 'projects':
                    await this.loadProjects();
                    break;
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async loadDashboard() {
        this.showLoading();

        try {
            console.log('Loading dashboard...');

            const sampleData = this.getSampleDashboardData();
            console.log('Sample data loaded:', sampleData);


            document.getElementById('totalInstitutions').textContent = sampleData.institutions;
            document.getElementById('totalBudget').textContent = formatCurrency(sampleData.totalBudget);
            document.getElementById('totalSpent').textContent = formatCurrency(sampleData.totalSpent);
            document.getElementById('totalTransactions').textContent = sampleData.totalTransactions;


            const remainingBalance = sampleData.totalBudget - sampleData.totalSpent;
            const utilizationPercentage = Math.round((sampleData.totalSpent / sampleData.totalBudget) * 100);

            document.getElementById('remainingBalance').textContent = formatCurrency(remainingBalance);
            document.getElementById('utilizationPercentage').textContent = `${utilizationPercentage}%`;


            console.log('Loading dashboard charts...');
            this.loadDashboardCharts(sampleData);


            console.log('Loading recent transactions...');
            await this.loadRecentTransactions();

            console.log('Dashboard loaded successfully!');

        } catch (error) {
            console.error('Dashboard loading error:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    },

    getSampleDashboardData() {
        return {
            institutions: 5,
            totalBudget: 50000000, // 5 crores
            totalSpent: 32000000,  // 3.2 crores
            totalTransactions: 1247,
            departmentData: [
                { name: 'Education', allocated: 15000000, spent: 9500000, remaining: 5500000 },
                { name: 'Healthcare', allocated: 12000000, spent: 7800000, remaining: 4200000 },
                { name: 'Infrastructure', allocated: 10000000, spent: 6500000, remaining: 3500000 },
                { name: 'Agriculture', allocated: 8000000, spent: 5200000, remaining: 2800000 },
                { name: 'Technology', allocated: 5000000, spent: 3000000, remaining: 2000000 }
            ],
            categoryData: [
                { name: 'Personnel', amount: 15000000 },
                { name: 'Equipment', amount: 8000000 },
                { name: 'Maintenance', amount: 5000000 },
                { name: 'Utilities', amount: 3000000 },
                { name: 'Other', amount: 1000000 }
            ],
            monthlySpending: [2500000, 3200000, 2800000, 3500000, 4200000, 3800000]
        };
    },

    loadDashboardCharts(sampleData) {
        console.log('Loading dashboard charts with data:', sampleData);


        const deptCtx = document.getElementById('departmentChart').getContext('2d');
        if (charts.department) charts.department.destroy();

        charts.department = new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: sampleData.departmentData.map(dept => dept.name),
                datasets: [
                    {
                        label: 'Allocated',
                        data: sampleData.departmentData.map(dept => dept.allocated),
                        backgroundColor: '#667eea',
                        borderRadius: 4
                    },
                    {
                        label: 'Spent',
                        data: sampleData.departmentData.map(dept => dept.spent),
                        backgroundColor: '#28a745',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Department Budget Allocation vs Spending'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });


        const spendingCtx = document.getElementById('spendingChart').getContext('2d');
        if (charts.spending) charts.spending.destroy();

        charts.spending = new Chart(spendingCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Spending',
                    data: sampleData.monthlySpending,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Spending Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });


        const categoryPieCtx = document.getElementById('categoryPieChart').getContext('2d');
        if (charts.categoryPie) charts.categoryPie.destroy();

        charts.categoryPie = new Chart(categoryPieCtx, {
            type: 'pie',
            data: {
                labels: sampleData.categoryData.map(cat => cat.name),
                datasets: [{
                    data: sampleData.categoryData.map(cat => cat.amount),
                    backgroundColor: [
                        '#667eea', '#28a745', '#dc3545', '#ffc107',
                        '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Budget Allocation by Category'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    async loadRecentTransactions() {
        try {
            const container = document.getElementById('recentTransactions');


            const sampleTransactions = [
                { type: 'expense', description: 'Office Equipment Purchase', amount: 150000, date: new Date() },
                { type: 'expense', description: 'Monthly Utilities Payment', amount: 45000, date: new Date(Date.now() - 86400000) },
                { type: 'income', description: 'Government Grant Received', amount: 500000, date: new Date(Date.now() - 172800000) },
                { type: 'expense', description: 'Staff Training Program', amount: 75000, date: new Date(Date.now() - 259200000) },
                { type: 'expense', description: 'Infrastructure Maintenance', amount: 200000, date: new Date(Date.now() - 345600000) }
            ];

            container.innerHTML = sampleTransactions.map(transaction => `
                <div class="activity-item">
                    <div class="activity-icon" style="background: ${this.getTransactionColor(transaction.type)}">
                        <i class="fas ${this.getTransactionIcon(transaction.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${transaction.description}</div>
                        <div class="activity-meta">
                            ${formatCurrency(transaction.amount)} • ${formatDateTime(transaction.date)}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent transactions:', error);
            const container = document.getElementById('recentTransactions');
            container.innerHTML = '<p class="text-muted">Error loading transactions</p>';
        }
    },

    getTransactionColor(type) {
        const colors = {
            expense: '#dc3545',
            income: '#28a745',
            transfer: '#17a2b8',
            adjustment: '#ffc107'
        };
        return colors[type] || '#6c757d';
    },

    getTransactionIcon(type) {
        const icons = {
            expense: 'fa-arrow-down',
            income: 'fa-arrow-up',
            transfer: 'fa-exchange-alt',
            adjustment: 'fa-edit'
        };
        return icons[type] || 'fa-question';
    },

    async loadInstitutions() {
        this.showLoading();

        try {

            const sampleInstitutions = this.getSampleInstitutions();
            institutions = sampleInstitutions;

            const container = document.getElementById('institutionsGrid');
            container.innerHTML = institutions.map(institution => `
                <div class="institution-card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">${institution.name}</h3>
                            <span class="card-type">${institution.type}</span>
                        </div>
                    </div>
                    <div class="card-description">
                        ${institution.description || 'No description available'}
                    </div>
                    <div class="card-stats">
                        <div class="stat">
                            <span class="stat-value">${institution.departmentCount || 0}</span>
                            <span class="stat-label">Departments</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${institution.projectCount || 0}</span>
                            <span class="stat-label">Projects</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-small" onclick="ui.viewInstitution('${institution._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="ui.editInstitution('${institution._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `).join('');


            this.setupAddInstitutionButton();

        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    },

    getSampleInstitutions() {
        return [
            {
                _id: '1',
                name: 'Ministry of Education',
                type: 'Government',
                description: 'Responsible for educational policies and programs across the state',
                departmentCount: 5,
                projectCount: 12,
                totalBudget: 15000000,
                contact: { email: 'education@gov.in', phone: '+91-11-23456789' }
            },
            {
                _id: '2',
                name: 'Health Department',
                type: 'Government',
                description: 'Oversees public health initiatives and healthcare facilities',
                departmentCount: 8,
                projectCount: 15,
                totalBudget: 12000000,
                contact: { email: 'health@gov.in', phone: '+91-11-23456790' }
            },
            {
                _id: '3',
                name: 'Infrastructure Development Authority',
                type: 'Government',
                description: 'Manages infrastructure projects and urban development',
                departmentCount: 6,
                projectCount: 20,
                totalBudget: 10000000,
                contact: { email: 'infra@gov.in', phone: '+91-11-23456791' }
            },
            {
                _id: '4',
                name: 'Agricultural Research Institute',
                type: 'Research',
                description: 'Conducts agricultural research and development programs',
                departmentCount: 4,
                projectCount: 8,
                totalBudget: 8000000,
                contact: { email: 'agriculture@gov.in', phone: '+91-11-23456792' }
            },
            {
                _id: '5',
                name: 'Technology Innovation Hub',
                type: 'Technology',
                description: 'Promotes technological innovation and digital transformation',
                departmentCount: 3,
                projectCount: 10,
                totalBudget: 5000000,
                contact: { email: 'tech@gov.in', phone: '+91-11-23456793' }
            }
        ];
    },

    setupAddInstitutionButton() {
        const addInstitutionBtn = document.getElementById('addInstitutionBtn');
        if (addInstitutionBtn) {
            addInstitutionBtn.addEventListener('click', () => {
                this.showAddInstitutionModal();
            });
        }
    },

    showAddInstitutionModal() {
        const content = `
            <form id="addInstitutionForm" class="institution-form">
                <div class="form-group">
                    <label for="institutionName">Institution Name</label>
                    <input type="text" id="institutionName" required>
                </div>
                <div class="form-group">
                    <label for="institutionType">Type</label>
                    <select id="institutionType" required>
                        <option value="">Select Type</option>
                        <option value="Government">Government</option>
                        <option value="Research">Research</option>
                        <option value="Technology">Technology</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="institutionDescription">Description</label>
                    <textarea id="institutionDescription" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="institutionEmail">Contact Email</label>
                    <input type="email" id="institutionEmail">
                </div>
                <div class="form-group">
                    <label for="institutionPhone">Contact Phone</label>
                    <input type="tel" id="institutionPhone">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ui.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Institution</button>
                </div>
            </form>
        `;

        this.showModal('Add New Institution', content);

        // Setup form submission
        const form = document.getElementById('addInstitutionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addInstitution();
            });
        }
    },

    addInstitution() {
        const name = document.getElementById('institutionName').value;
        const type = document.getElementById('institutionType').value;
        const description = document.getElementById('institutionDescription').value;
        const email = document.getElementById('institutionEmail').value;
        const phone = document.getElementById('institutionPhone').value;

        if (!name || !type) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const newInstitution = {
            _id: Date.now().toString(),
            name,
            type,
            description,
            departmentCount: 0,
            projectCount: 0,
            totalBudget: 0,
            contact: { email, phone }
        };

        institutions.unshift(newInstitution);
        this.hideModal();
        this.showToast('Institution added successfully!', 'success');
        this.loadInstitutions(); // Refresh the institutions list
    },

    async loadBudgets() {
        this.showLoading();

        try {
            console.log('Loading budgets...');

            const sampleBudgetData = this.getSampleBudgetData();
            console.log('Budget data loaded:', sampleBudgetData);
            this.displayBudgetSummary(sampleBudgetData);


            this.setupBudgetFilters();
            console.log('Budgets loaded successfully!');

        } catch (error) {
            console.error('Budget loading error:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    },

    setupBudgetFilters() {

        const institutionFilter = document.getElementById('institutionFilter');
        if (institutionFilter) {
            institutionFilter.innerHTML = '<option value="">All Institutions</option>' +
                institutions.map(inst => `<option value="${inst._id}">${inst.name}</option>`).join('');
        }


        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            const departments = ['Education', 'Healthcare', 'Infrastructure', 'Agriculture', 'Technology'];
            departmentFilter.innerHTML = '<option value="">All Departments</option>' +
                departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
        }


        if (institutionFilter) {
            institutionFilter.addEventListener('change', () => {
                this.applyBudgetFilters();
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => {
                this.applyBudgetFilters();
            });
        }
    },

    applyBudgetFilters() {
        const institutionFilter = document.getElementById('institutionFilter')?.value;
        const departmentFilter = document.getElementById('departmentFilter')?.value;


        this.loadBudgets();
    },

    getSampleBudgetData() {
        return {
            summary: {
                totalAllocated: 50000000,
                totalSpent: 32000000,
                totalRemaining: 18000000,
                utilization: 64
            },
            departmentBreakdown: [
                { id: '1', name: 'Education', allocated: 15000000, spent: 9500000, remaining: 5500000, utilization: 63.3 },
                { id: '2', name: 'Healthcare', allocated: 12000000, spent: 7800000, remaining: 4200000, utilization: 65.0 },
                { id: '3', name: 'Infrastructure', allocated: 10000000, spent: 6500000, remaining: 3500000, utilization: 65.0 },
                { id: '4', name: 'Agriculture', allocated: 8000000, spent: 5200000, remaining: 2800000, utilization: 65.0 },
                { id: '5', name: 'Technology', allocated: 5000000, spent: 3000000, remaining: 2000000, utilization: 60.0 }
            ],
            categoryBreakdown: [
                { _id: 'Personnel', totalAmount: 15000000 },
                { _id: 'Equipment', totalAmount: 8000000 },
                { _id: 'Maintenance', totalAmount: 5000000 },
                { _id: 'Utilities', totalAmount: 3000000 },
                { _id: 'Other', totalAmount: 1000000 }
            ],
            detailedSpending: [
                { department: 'Education', category: 'Personnel', transactionId: 'EDU-001', description: 'Teacher Salaries - January', amount: 2500000, date: '2024-01-15', status: 'Approved', approvedBy: 'Dr. Rajesh Kumar' },
                { department: 'Education', category: 'Equipment', transactionId: 'EDU-002', description: 'Computer Lab Setup', amount: 1800000, date: '2024-01-20', status: 'Approved', approvedBy: 'Dr. Rajesh Kumar' },
                { department: 'Healthcare', category: 'Equipment', transactionId: 'HLT-001', description: 'Medical Equipment Purchase', amount: 3200000, date: '2024-01-10', status: 'Approved', approvedBy: 'Dr. Priya Sharma' },
                { department: 'Healthcare', category: 'Personnel', transactionId: 'HLT-002', description: 'Doctor Salaries - January', amount: 2800000, date: '2024-01-15', status: 'Approved', approvedBy: 'Dr. Priya Sharma' },
                { department: 'Infrastructure', category: 'Maintenance', transactionId: 'INF-001', description: 'Road Repair Project', amount: 2500000, date: '2024-01-05', status: 'Approved', approvedBy: 'Eng. Amit Singh' },
                { department: 'Infrastructure', category: 'Equipment', transactionId: 'INF-002', description: 'Construction Machinery', amount: 2000000, date: '2024-01-12', status: 'Approved', approvedBy: 'Eng. Amit Singh' },
                { department: 'Agriculture', category: 'Equipment', transactionId: 'AGR-001', description: 'Farming Equipment', amount: 1800000, date: '2024-01-08', status: 'Approved', approvedBy: 'Dr. Sunil Patel' },
                { department: 'Agriculture', category: 'Personnel', transactionId: 'AGR-002', description: 'Research Staff Salaries', amount: 1500000, date: '2024-01-15', status: 'Approved', approvedBy: 'Dr. Sunil Patel' },
                { department: 'Technology', category: 'Equipment', transactionId: 'TEC-001', description: 'Server Infrastructure', amount: 1200000, date: '2024-01-18', status: 'Approved', approvedBy: 'Mr. Vikram Joshi' },
                { department: 'Technology', category: 'Personnel', transactionId: 'TEC-002', description: 'IT Staff Salaries', amount: 900000, date: '2024-01-15', status: 'Approved', approvedBy: 'Mr. Vikram Joshi' }
            ]
        };
    },

    displayBudgetSummary(data) {

        document.getElementById('budgetAllocated').textContent = formatCurrency(data.summary.totalAllocated);
        document.getElementById('budgetSpent').textContent = formatCurrency(data.summary.totalSpent);
        document.getElementById('budgetRemaining').textContent = formatCurrency(data.summary.totalRemaining);
        document.getElementById('budgetUtilization').textContent = `${Math.round(data.summary.utilization)}%`;


        this.loadBudgetCharts(data);


        this.updateBudgetTable(data.departmentBreakdown);


        this.updateDetailedSpendingTable(data.detailedSpending);
    },

    loadBudgetCharts(data) {

        const deptCtx = document.getElementById('departmentBudgetChart').getContext('2d');
        if (charts.departmentBudget) charts.departmentBudget.destroy();

        charts.departmentBudget = new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: data.departmentBreakdown.map(dept => dept.name),
                datasets: [
                    {
                        label: 'Allocated',
                        data: data.departmentBreakdown.map(dept => dept.allocated),
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Spent',
                        data: data.departmentBreakdown.map(dept => dept.spent),
                        backgroundColor: '#28a745'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        const catCtx = document.getElementById('categoryChart').getContext('2d');
        if (charts.category) charts.category.destroy();

        charts.category = new Chart(catCtx, {
            type: 'pie',
            data: {
                labels: data.categoryBreakdown.map(cat => cat._id),
                datasets: [{
                    data: data.categoryBreakdown.map(cat => cat.totalAmount),
                    backgroundColor: [
                        '#667eea', '#28a745', '#dc3545', '#ffc107',
                        '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    updateBudgetTable(departments) {
        const tbody = document.getElementById('budgetTableBody');
        tbody.innerHTML = departments.map(dept => `
            <tr>
                <td>${dept.name}</td>
                <td>${formatCurrency(dept.allocated)}</td>
                <td>${formatCurrency(dept.spent)}</td>
                <td>${formatCurrency(dept.remaining)}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${dept.utilization}%"></div>
                    </div>
                    ${Math.round(dept.utilization)}%
                </td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="ui.viewDepartmentBudget('${dept.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },

    updateDetailedSpendingTable(detailedSpending) {
        const tbody = document.getElementById('detailedSpendingTableBody');
        tbody.innerHTML = detailedSpending.map(spending => `
            <tr>
                <td>${spending.department}</td>
                <td>${spending.category}</td>
                <td><code>${spending.transactionId}</code></td>
                <td>${spending.description}</td>
                <td>${formatCurrency(spending.amount)}</td>
                <td>${formatDate(spending.date)}</td>
                <td>
                    <span class="status-badge status-approved">${spending.status}</span>
                </td>
                <td>${spending.approvedBy}</td>
            </tr>
        `).join('');
    },

    async loadTransactions() {
        this.showLoading();

        try {

            const sampleTransactions = this.getSampleTransactions();
            transactions = sampleTransactions;

            this.displayTransactions(transactions);
            this.setupTransactionFilters();

        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    },

    getSampleTransactions() {
        return [
            {
                _id: '1',
                createdAt: new Date(),
                type: 'expense',
                amount: 150000,
                category: 'Equipment',
                description: 'Office Equipment Purchase',
                department: { name: 'Technology' },
                project: { name: 'Digital Infrastructure' },
                status: 'approved'
            },
            {
                _id: '2',
                createdAt: new Date(Date.now() - 86400000),
                type: 'expense',
                amount: 45000,
                category: 'Utilities',
                description: 'Monthly Utilities Payment',
                department: { name: 'Infrastructure' },
                project: { name: 'Facility Management' },
                status: 'completed'
            },
            {
                _id: '3',
                createdAt: new Date(Date.now() - 172800000),
                type: 'income',
                amount: 500000,
                category: 'Grant',
                description: 'Government Grant Received',
                department: { name: 'Education' },
                project: { name: 'Educational Development' },
                status: 'completed'
            },
            {
                _id: '4',
                createdAt: new Date(Date.now() - 259200000),
                type: 'expense',
                amount: 75000,
                category: 'Personnel',
                description: 'Staff Training Program',
                department: { name: 'Healthcare' },
                project: { name: 'Staff Development' },
                status: 'pending'
            },
            {
                _id: '5',
                createdAt: new Date(Date.now() - 345600000),
                type: 'expense',
                amount: 200000,
                category: 'Maintenance',
                description: 'Infrastructure Maintenance',
                department: { name: 'Infrastructure' },
                project: { name: 'Facility Management' },
                status: 'approved'
            },
            {
                _id: '6',
                createdAt: new Date(Date.now() - 432000000),
                type: 'expense',
                amount: 120000,
                category: 'Equipment',
                description: 'Medical Equipment Purchase',
                department: { name: 'Healthcare' },
                project: { name: 'Medical Infrastructure' },
                status: 'completed'
            },
            {
                _id: '7',
                createdAt: new Date(Date.now() - 518400000),
                type: 'expense',
                amount: 85000,
                category: 'Personnel',
                description: 'Teacher Training Workshop',
                department: { name: 'Education' },
                project: { name: 'Educational Development' },
                status: 'approved'
            },
            {
                _id: '8',
                createdAt: new Date(Date.now() - 604800000),
                type: 'income',
                amount: 300000,
                category: 'Grant',
                description: 'Agricultural Development Grant',
                department: { name: 'Agriculture' },
                project: { name: 'Agricultural Innovation' },
                status: 'completed'
            }
        ];
    },

    setupTransactionFilters() {

        const departments = [...new Set(transactions.map(t => t.department?.name).filter(Boolean))];
        const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];


        const departmentFilter = document.getElementById('transactionTypeFilter');
        if (departmentFilter) {

            const deptFilter = document.querySelector('#transactionsPage select');
            if (deptFilter) {
                deptFilter.innerHTML = '<option value="">All Departments</option>' +
                    departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
            }
        }


        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyTransactionFilters();
            });
        }
    },

    applyTransactionFilters() {
        const typeFilter = document.getElementById('transactionTypeFilter')?.value;
        const departmentFilter = document.getElementById('transactionDepartmentFilter')?.value;
        const categoryFilter = document.getElementById('transactionCategoryFilter')?.value;
        const statusFilter = document.getElementById('transactionStatusFilter')?.value;
        const startDate = document.getElementById('startDateFilter')?.value;
        const endDate = document.getElementById('endDateFilter')?.value;

        let filteredTransactions = [...transactions];

        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        if (departmentFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.department?.name === departmentFilter);
        }

        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }

        if (statusFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
        }

        if (startDate) {
            const start = new Date(startDate);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) <= end);
        }

        this.displayTransactions(filteredTransactions);
    },

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${formatDate(transaction.createdAt)}</td>
                <td>
                    <span class="status-badge status-${transaction.type}">
                        ${transaction.type}
                    </span>
                </td>
                <td>${formatCurrency(transaction.amount)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td>${transaction.department?.name || 'N/A'}</td>
                <td>${transaction.project?.name || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${transaction.status}">
                        ${transaction.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="ui.viewTransaction('${transaction._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${transaction.status === 'pending' && currentUser?.role !== 'viewer' ? `
                        <button class="btn btn-success btn-small" onclick="ui.approveTransaction('${transaction._id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="ui.rejectTransaction('${transaction._id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    async loadProjects() {
        this.showLoading();

        try {

            const sampleProjects = this.getSampleProjects();
            projects = sampleProjects;

            const container = document.getElementById('projectsGrid');
            container.innerHTML = projects.map(project => `
                <div class="project-card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">${project.name}</h3>
                            <span class="card-type status-${project.status}">${project.status}</span>
                        </div>
                    </div>
                    <div class="card-description">
                        ${project.description || 'No description available'}
                    </div>
                    <div class="card-stats">
                        <div class="stat">
                            <span class="stat-value">${formatCurrency(project.budget.allocated)}</span>
                            <span class="stat-label">Budget</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${Math.round((project.budget.spent / project.budget.allocated) * 100)}%</span>
                            <span class="stat-label">Used</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-small" onclick="ui.viewProject('${project._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="ui.viewProjectProgress('${project._id}')">
                            <i class="fas fa-chart-line"></i> Progress
                        </button>
                    </div>
                </div>
            `).join('');


            this.setupAddProjectButton();

        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.hideLoading();
        }
    },

    getSampleProjects() {
        return [
            {
                _id: '1',
                name: 'Digital Infrastructure Upgrade',
                description: 'Modernizing IT infrastructure across all departments',
                status: 'active',
                budget: { allocated: 5000000, spent: 3200000 },
                department: 'Technology',
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            },
            {
                _id: '2',
                name: 'Educational Development Program',
                description: 'Enhancing educational facilities and training programs',
                status: 'active',
                budget: { allocated: 8000000, spent: 4500000 },
                department: 'Education',
                startDate: '2024-02-01',
                endDate: '2024-11-30'
            },
            {
                _id: '3',
                name: 'Healthcare Facility Expansion',
                description: 'Expanding healthcare services and facilities',
                status: 'planning',
                budget: { allocated: 12000000, spent: 0 },
                department: 'Healthcare',
                startDate: '2024-06-01',
                endDate: '2025-05-31'
            },
            {
                _id: '4',
                name: 'Agricultural Innovation Initiative',
                description: 'Implementing modern agricultural techniques and equipment',
                status: 'completed',
                budget: { allocated: 6000000, spent: 6000000 },
                department: 'Agriculture',
                startDate: '2023-09-01',
                endDate: '2024-02-29'
            }
        ];
    },

    setupAddProjectButton() {
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.showAddProjectModal();
            });
        }
    },

    showAddProjectModal() {
        const content = `
            <form id="addProjectForm" class="project-form">
                <div class="form-group">
                    <label for="projectName">Project Name</label>
                    <input type="text" id="projectName" required>
                </div>
                <div class="form-group">
                    <label for="projectDepartment">Department</label>
                    <select id="projectDepartment" required>
                        <option value="">Select Department</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Technology">Technology</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="projectBudget">Budget (₹)</label>
                    <input type="number" id="projectBudget" required min="0">
                </div>
                <div class="form-group">
                    <label for="projectStartDate">Start Date</label>
                    <input type="date" id="projectStartDate" required>
                </div>
                <div class="form-group">
                    <label for="projectEndDate">End Date</label>
                    <input type="date" id="projectEndDate" required>
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description</label>
                    <textarea id="projectDescription" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ui.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Project</button>
                </div>
            </form>
        `;

        this.showModal('Add New Project', content);


        const form = document.getElementById('addProjectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProject();
            });
        }
    },

    addProject() {
        const name = document.getElementById('projectName').value;
        const department = document.getElementById('projectDepartment').value;
        const budget = parseFloat(document.getElementById('projectBudget').value);
        const startDate = document.getElementById('projectStartDate').value;
        const endDate = document.getElementById('projectEndDate').value;
        const description = document.getElementById('projectDescription').value;

        if (!name || !department || !budget || !startDate || !endDate) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            this.showToast('End date must be after start date', 'error');
            return;
        }

        const newProject = {
            _id: Date.now().toString(),
            name,
            description,
            status: 'planning',
            budget: { allocated: budget, spent: 0 },
            department,
            startDate,
            endDate
        };

        projects.unshift(newProject);
        this.hideModal();
        this.showToast('Project added successfully!', 'success');
        this.loadProjects();
    },


    async viewInstitution(id) {
        try {
            const response = await api.getInstitution(id);
            const institution = response.institution;

            const content = `
                <div class="institution-details">
                    <h3>${institution.name}</h3>
                    <p><strong>Type:</strong> ${institution.type}</p>
                    <p><strong>Description:</strong> ${institution.description || 'No description'}</p>
                    <p><strong>Contact:</strong> ${institution.contact?.email || 'N/A'}</p>
                    <div class="mt-3">
                        <h4>Financial Summary</h4>
                        <p>Total Budget: ${formatCurrency(response.summary.totalBudget)}</p>
                        <p>Total Spent: ${formatCurrency(response.summary.totalSpent)}</p>
                        <p>Remaining: ${formatCurrency(response.summary.totalRemaining)}</p>
                    </div>
                </div>
            `;

            this.showModal('Institution Details', content);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async approveTransaction(id) {
        try {
            await api.approveTransaction(id);
            this.showToast('Transaction approved successfully', 'success');
            await this.loadTransactions();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async rejectTransaction(id) {
        try {
            await api.rejectTransaction(id);
            this.showToast('Transaction rejected', 'warning');
            await this.loadTransactions();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
};


const auth = {
    async login(email, password) {
        try {
            ui.showLoading();
            const response = await api.login(email, password);

            localStorage.setItem('token', response.token);
            currentUser = response.user;

            this.updateUI();
            ui.showToast('Login successful!', 'success');
            ui.showPage('dashboard');

        } catch (error) {
            ui.showToast(error.message, 'error');
        } finally {
            ui.hideLoading();
        }
    },

    async register(userData) {
        try {
            ui.showLoading();
            const response = await api.register(userData);

            localStorage.setItem('token', response.token);
            currentUser = response.user;

            this.updateUI();
            ui.showToast('Registration successful!', 'success');
            ui.showPage('dashboard');

        } catch (error) {
            ui.showToast(error.message, 'error');
        } finally {
            ui.hideLoading();
        }
    },

    logout() {
        localStorage.removeItem('token');
        currentUser = null;
        ui.showPage('login');
        ui.showToast('Logged out successfully', 'info');
    },

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {

            currentUser = {
                _id: 'demo-user',
                name: 'Demo User',
                email: 'demo@fundradar.com',
                role: 'admin'
            };
            this.updateUI();
            ui.showPage('dashboard');
            return;
        }

        try {
            const response = await api.getCurrentUser();
            currentUser = response.user;
            this.updateUI();
            ui.showPage('dashboard');
        } catch (error) {
            localStorage.removeItem('token');
            ui.showPage('login');
        }
    },

    updateUI() {
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.name;


            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const page = link.dataset.page;
                if (page === 'institutions' && !['admin', 'institution_admin'].includes(currentUser.role)) {
                    link.style.display = 'none';
                }
            });
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on page load
    auth.checkAuth();


    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            ui.showPage(page);
        });
    });


    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');

    userBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userDropdown.classList.remove('show');
        }
    });

    // Login 
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await auth.login(email, password);
    });

    // Register 
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            role: document.getElementById('registerRole').value
        };
        await auth.register(userData);
    });


    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerCard').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerCard').style.display = 'none';
    });

    // Logout
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });


    document.getElementById('modalClose').addEventListener('click', () => {
        ui.hideModal();
    });


    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            ui.hideModal();
        }
    });


    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('show');
    });
});


console.log('Financial Transparency Platform loaded successfully!');
