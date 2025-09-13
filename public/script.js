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




const institutionData = {
    "Govt College A": ["Education", "Healthcare", "Infrastructure"],
    "Govt Hospital B": ["Healthcare", "Technology"],
    "City Municipality": ["Infrastructure", "Agriculture", "Technology"]
};


const institution = document.getElementById("institutionFilter");
const department = document.getElementById("departmentFilter");


Object.keys(institutionData).forEach(inst => {
    const option = document.createElement("option");
    option.value = inst;
    option.textContent = inst;
    institution.appendChild(option);
});


institution.addEventListener("change", function () {
    department.innerHTML = `<option value="">All Departments</option>`;

    if (this.value && institutionData[this.value]) {
        institutionData[this.value].forEach(dep => {
            const option = document.createElement("option");
            option.value = dep;
            option.textContent = dep;
            department.appendChild(option);
        });
    }
});


[institution, department].forEach(select => {
    select.addEventListener("change", function () {
        console.log("Institution:", institution.value || "All");
        console.log("Department:", department.value || "All");

    });
});






const transaction = [
    {
        id: "TXN12345",
        department: "Education",
        description: "Purchase of lab equipment",
        amount: 120000,
        date: "2025-09-10",
        status: "Approved"
    },
    {
        id: "TXN12346",
        department: "Health",
        description: "Hospital supplies",
        amount: 85000,
        date: "2025-09-09",
        status: "Pending"
    },
    {
        id: "TXN12347",
        department: "Transport",
        description: "Road maintenance",
        amount: 250000,
        date: "2025-09-08",
        status: "Rejected"
    }
];


const recentTransactionsContainer = document.getElementById("recentTransactions");


transaction.forEach(txn => {
    const txnDiv = document.createElement("div");
    txnDiv.classList.add("transaction-item");

    txnDiv.innerHTML = `
        <p><strong>${txn.department}</strong> - ${txn.description}</p>
        <p>ID: ${txn.id}</p>
        <p>Amount: ₹${txn.amount.toLocaleString()}</p>
        <p>Date: ${txn.date}</p>
        <p>Status: <span class="status ${txn.status.toLowerCase()}">${txn.status}</span></p>
    `;

    recentTransactionsContainer.appendChild(txnDiv);
});


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

            // Load budget alerts
            console.log('Loading budget alerts...');
            this.loadBudgetAlerts(sampleData);

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
            totalSpent: 34550000,  // 3.455 crores (updated to match department spending)
            totalTransactions: 1247,
            departmentData: [
                { name: 'Education', allocated: 15000000, spent: 14250000, remaining: 750000 }, // 95% - High Alert
                { name: 'Healthcare', allocated: 12000000, spent: 9600000, remaining: 2400000 }, // 80% - Medium Alert
                { name: 'Infrastructure', allocated: 10000000, spent: 6500000, remaining: 3500000 }, // 65% - Normal
                { name: 'Agriculture', allocated: 8000000, spent: 1200000, remaining: 6800000 }, // 15% - Low Alert
                { name: 'Technology', allocated: 5000000, spent: 3000000, remaining: 2000000 } // 60% - Normal
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

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded, retrying...');
            setTimeout(() => this.loadDashboardCharts(sampleData), 100);
            return;
        }

        // Department Chart
        const deptCanvas = document.getElementById('departmentChart');
        if (!deptCanvas) {
            console.error('Department chart canvas not found');
            return;
        }

        const deptCtx = deptCanvas.getContext('2d');
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


        // Spending Chart
        const spendingCanvas = document.getElementById('spendingChart');
        if (!spendingCanvas) {
            console.error('Spending chart canvas not found');
            return;
        }

        const spendingCtx = spendingCanvas.getContext('2d');
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


        // Category Pie Chart
        const categoryPieCanvas = document.getElementById('categoryPieChart');
        if (!categoryPieCanvas) {
            console.error('Category pie chart canvas not found');
            return;
        }

        const categoryPieCtx = categoryPieCanvas.getContext('2d');
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

        console.log('All dashboard charts initialized successfully!');
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

    loadBudgetAlerts(sampleData) {
        const alerts = this.detectBudgetAnomalies(sampleData);
        const container = document.getElementById('budgetAlerts');

        if (alerts.length === 0) {
            container.innerHTML = '<p class="text-muted">No budget alerts at this time</p>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon">
                    <i class="fas ${this.getAlertIcon(alert.severity)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <div class="alert-severity ${alert.severity}">${alert.severity}</div>
            </div>
        `).join('');
    },

    detectBudgetAnomalies(data) {
        const alerts = [];

        // budget overruns
        data.departmentData.forEach(dept => {
            const utilization = (dept.spent / dept.allocated) * 100;

            if (utilization > 90) {
                alerts.push({
                    title: 'Budget Overrun Alert',
                    message: `${dept.name} has utilized ${utilization.toFixed(1)}% of allocated budget (${formatCurrency(dept.spent)} of ${formatCurrency(dept.allocated)})`,
                    severity: 'high',
                    department: dept.name
                });
            } else if (utilization > 75) {
                alerts.push({
                    title: 'Budget Warning',
                    message: `${dept.name} has utilized ${utilization.toFixed(1)}% of allocated budget`,
                    severity: 'medium',
                    department: dept.name
                });
            }
        });


        const totalSpent = data.departmentData.reduce((sum, dept) => sum + dept.spent, 0);
        const totalAllocated = data.departmentData.reduce((sum, dept) => sum + dept.allocated, 0);
        const overallUtilization = (totalSpent / totalAllocated) * 100;

        if (overallUtilization > 80) {
            alerts.push({
                title: 'High Overall Budget Utilization',
                message: `Overall budget utilization is at ${overallUtilization.toFixed(1)}%`,
                severity: 'medium',
                department: 'All Departments'
            });
        }


        data.departmentData.forEach(dept => {
            const utilization = (dept.spent / dept.allocated) * 100;
            if (utilization < 20 && dept.allocated > 1000000) {
                alerts.push({
                    title: 'Low Budget Utilization',
                    message: `${dept.name} has only utilized ${utilization.toFixed(1)}% of allocated budget`,
                    severity: 'low',
                    department: dept.name
                });
            }
        });

        return alerts;
    },

    getAlertIcon(severity) {
        const icons = {
            high: 'fa-exclamation-triangle',
            medium: 'fa-exclamation-circle',
            low: 'fa-info-circle'
        };
        return icons[severity] || 'fa-info-circle';
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
                        <button class="btn btn-primary btn-small" onclick="viewInstitution('${institution._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                            <button class="btn btn-secondary btn-small" onclick="editInstitution('${institution._id}')">
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
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
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

    viewInstitution(institutionId) {
        const institution = institutions.find(inst => inst._id === institutionId);
        if (!institution) {
            this.showToast('Institution not found', 'error');
            return;
        }

        const content = `
            <div class="institution-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${institution.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${institution.type}</span>
                        </div>
                        <div class="detail-item">
                            <label>Location:</label>
                            <span>${institution.location || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Established:</label>
                            <span>${institution.established || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${institution.description || 'No description available'}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${institution.departmentCount || 0}</div>
                            <div class="stat-label">Departments</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${institution.projectCount || 0}</div>
                            <div class="stat-label">Projects</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${institution.budget || 'N/A'}</div>
                            <div class="stat-label">Total Budget</div>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="editInstitution('${institution._id}')">
                        <i class="fas fa-edit"></i> Edit Institution
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalTitle').textContent = `Institution Details - ${institution.name}`;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('show');
    },

    editInstitution(institutionId) {
        const institution = institutions.find(inst => inst._id === institutionId);
        if (!institution) {
            this.showToast('Institution not found', 'error');
            return;
        }

        const content = `
            <div class="institution-form">
                <h4>Edit Institution</h4>
                <div class="form-group">
                    <label for="editInstitutionName">Institution Name</label>
                    <input type="text" id="editInstitutionName" value="${institution.name}" required>
                </div>
                <div class="form-group">
                    <label for="editInstitutionType">Type</label>
                    <select id="editInstitutionType" required>
                        <option value="Ministry" ${institution.type === 'Ministry' ? 'selected' : ''}>Ministry</option>
                        <option value="Department" ${institution.type === 'Department' ? 'selected' : ''}>Department</option>
                        <option value="Agency" ${institution.type === 'Agency' ? 'selected' : ''}>Agency</option>
                        <option value="Board" ${institution.type === 'Board' ? 'selected' : ''}>Board</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editInstitutionLocation">Location</label>
                    <input type="text" id="editInstitutionLocation" value="${institution.location || ''}">
                </div>
                <div class="form-group">
                    <label for="editInstitutionEstablished">Established Year</label>
                    <input type="number" id="editInstitutionEstablished" value="${institution.established || ''}" min="1900" max="2024">
                </div>
                <div class="form-group">
                    <label for="editInstitutionDescription">Description</label>
                    <textarea id="editInstitutionDescription" rows="3">${institution.description || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="saveInstitutionEdit('${institution._id}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalTitle').textContent = `Edit Institution - ${institution.name}`;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('show');
    },

    saveInstitutionEdit(institutionId) {
        const name = document.getElementById('editInstitutionName').value;
        const type = document.getElementById('editInstitutionType').value;
        const location = document.getElementById('editInstitutionLocation').value;
        const established = document.getElementById('editInstitutionEstablished').value;
        const description = document.getElementById('editInstitutionDescription').value;

        if (!name.trim()) {
            this.showToast('Institution name is required', 'error');
            return;
        }

        // Update the institution in the array
        const institutionIndex = institutions.findIndex(inst => inst._id === institutionId);
        if (institutionIndex !== -1) {
            institutions[institutionIndex] = {
                ...institutions[institutionIndex],
                name: name.trim(),
                type: type,
                location: location.trim(),
                established: established,
                description: description.trim()
            };

            this.showToast('Institution updated successfully!', 'success');
            this.hideModal();
            this.loadInstitutions(); // Refresh the institutions list
        } else {
            this.showToast('Institution not found', 'error');
        }
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
        const institutions = this.getSampleInstitutions();
        const departments = ['Education', 'Healthcare', 'Infrastructure', 'Agriculture', 'Technology'];

        const institutionFilter = document.getElementById('institutionFilter');
        if (institutionFilter) {
            // Store current selection
            const currentInstitution = institutionFilter.value;

            institutionFilter.innerHTML = '<option value="">All Institutions</option>' +
                institutions.map(inst => `<option value="${inst._id}">${inst.name}</option>`).join('');

            // Restore selection
            if (currentInstitution) {
                institutionFilter.value = currentInstitution;
            }
        }

        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            // Store current selection
            const currentDepartment = departmentFilter.value;

            departmentFilter.innerHTML = '<option value="">All Departments</option>' +
                departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');

            // Restore selection
            if (currentDepartment) {
                departmentFilter.value = currentDepartment;
            }
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

        console.log('Applying filters:', { institutionFilter, departmentFilter });

        // Get the sample data
        const data = this.getSampleBudgetData();
        let filteredData = { ...data };

        // Apply institution filter
        if (institutionFilter) {
            const institutions = this.getSampleInstitutions();
            const selectedInstitution = institutions.find(inst => inst._id === institutionFilter);
            if (selectedInstitution) {
                // Filter departments by institution
                filteredData.departmentBreakdown = data.departmentBreakdown.filter(dept =>
                    dept.institution === selectedInstitution.name
                );
            }
        }

        // Apply department filter
        if (departmentFilter) {
            filteredData.departmentBreakdown = filteredData.departmentBreakdown.filter(dept =>
                dept.name === departmentFilter
            );
        }

        // Update the display with filtered data
        this.displayBudgetSummary(filteredData);
        this.updateBudgetTable(filteredData.departmentBreakdown);
        this.loadBudgetCharts(filteredData);
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
                { id: '1', name: 'Education', institution: 'Ministry of Education', allocated: 15000000, spent: 9500000, remaining: 5500000, utilization: 63.3 },
                { id: '2', name: 'Healthcare', institution: 'Ministry of Health', allocated: 12000000, spent: 7800000, remaining: 4200000, utilization: 65.0 },
                { id: '3', name: 'Infrastructure', institution: 'Ministry of Infrastructure', allocated: 10000000, spent: 6500000, remaining: 3500000, utilization: 65.0 },
                { id: '4', name: 'Agriculture', institution: 'Ministry of Agriculture', allocated: 8000000, spent: 5200000, remaining: 2800000, utilization: 65.0 },
                { id: '5', name: 'Technology', institution: 'Ministry of Technology', allocated: 5000000, spent: 3000000, remaining: 2000000, utilization: 60.0 }
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
        console.log('Loading budget charts with data:', data);

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded, retrying...');
            setTimeout(() => this.loadBudgetCharts(data), 100);
            return;
        }

        // Department Budget Chart
        const deptCanvas = document.getElementById('departmentBudgetChart');
        if (!deptCanvas) {
            console.error('Department budget chart canvas not found');
            return;
        }

        const deptCtx = deptCanvas.getContext('2d');
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

        // Category Chart
        const catCanvas = document.getElementById('categoryChart');
        if (!catCanvas) {
            console.error('Category chart canvas not found');
            return;
        }

        const catCtx = catCanvas.getContext('2d');
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

        console.log('Budget charts initialized successfully!');
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
                    <button class="btn btn-primary btn-small" onclick="viewDepartmentBudget('${dept.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-info btn-small view-feedback-btn" data-department-name="${dept.name}" data-department-id="${dept.id}" style="margin-left: 5px;">
                        <i class="fas fa-comments"></i> View Feedback
                    </button>
                </td>
                <td>
                    <button class="feedback-button" data-department-name="${dept.name}" data-department-id="${dept.id}">
                        <i class="fas fa-comment"></i> Add Feedback
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

    showFeedbackModal(departmentName, departmentId) {
        const content = `
            <div class="feedback-form">
                <h4>Feedback for ${departmentName}</h4>
                <div class="form-group">
                    <label for="feedbackText">Your Feedback/Suggestion</label>
                    <textarea id="feedbackText" rows="4" placeholder="Share your thoughts, suggestions, or concerns about this department's budget..."></textarea>
                </div>
                <div class="form-group">
                    <label for="feedbackAuthor">Your Name (Optional)</label>
                    <input type="text" id="feedbackAuthor" placeholder="Enter your name">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary">Cancel</button>
                    <button type="button" class="btn btn-primary submit-feedback-btn" data-department-id="${departmentId}" data-department-name="${departmentName}">Submit Feedback</button>
                </div>
            </div>
            <div class="mt-3">
                <h5>Previous Feedback</h5>
                <div id="previousFeedback">
                    ${this.getPreviousFeedback(departmentId)}
                </div>
            </div>
        `;

        document.getElementById('feedbackModalTitle').textContent = `Feedback for ${departmentName}`;
        document.getElementById('feedbackModalBody').innerHTML = content;
        document.getElementById('feedbackModal').classList.add('show');
    },

    hideFeedbackModal() {
        document.getElementById('feedbackModal').classList.remove('show');
    },

    hideProjectModal() {
        document.getElementById('projectModal').classList.remove('show');
    },

    hideTransactionModal() {
        document.getElementById('transactionModal').classList.remove('show');
    },

    submitFeedback(departmentId, departmentName) {
        const feedbackText = document.getElementById('feedbackText').value;
        const feedbackAuthor = document.getElementById('feedbackAuthor').value || 'Anonymous';

        if (!feedbackText.trim()) {
            this.showToast('Please enter your feedback', 'error');
            return;
        }

        // Store feedback in localStorage (in a real app, this would go to a database)
        const feedback = {
            id: Date.now().toString(),
            departmentId,
            departmentName,
            text: feedbackText,
            author: feedbackAuthor,
            date: new Date().toISOString()
        };

        let feedbacks = JSON.parse(localStorage.getItem('budgetFeedbacks') || '[]');
        feedbacks.push(feedback);
        localStorage.setItem('budgetFeedbacks', JSON.stringify(feedbacks));

        this.showToast('Feedback submitted successfully!', 'success');
        this.hideFeedbackModal();

        // Refresh the feedback display
        this.showFeedbackModal(departmentName, departmentId);
    },

    getPreviousFeedback(departmentId) {
        const feedbacks = JSON.parse(localStorage.getItem('budgetFeedbacks') || '[]');
        const departmentFeedbacks = feedbacks.filter(f => f.departmentId === departmentId);

        if (departmentFeedbacks.length === 0) {
            return '<p class="text-muted">No previous feedback for this department.</p>';
        }

        return departmentFeedbacks.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-author">${feedback.author}</div>
                <div class="feedback-date">${formatDateTime(feedback.date)}</div>
                <div class="feedback-text">${feedback.text}</div>
            </div>
        `).join('');
    },

    viewFeedbackDetails(departmentName, departmentId) {
        const feedbacks = JSON.parse(localStorage.getItem('budgetFeedbacks') || '[]');
        const departmentFeedbacks = feedbacks.filter(f => f.departmentId === departmentId);

        const content = `
            <div class="feedback-details">
                <h4>All Feedback for ${departmentName}</h4>
                <div class="feedback-stats">
                    <p><strong>Total Feedback:</strong> ${departmentFeedbacks.length} comments</p>
                </div>
                <div class="feedback-list">
                    ${departmentFeedbacks.length === 0 ?
                '<p class="text-muted">No feedback submitted yet for this department.</p>' :
                departmentFeedbacks.map(feedback => `
                            <div class="feedback-item">
                                <div class="feedback-header">
                                    <span class="feedback-author">${feedback.author}</span>
                                    <span class="feedback-date">${formatDateTime(feedback.date)}</span>
                                </div>
                                <div class="feedback-text">${feedback.text}</div>
                            </div>
                        `).join('')
            }
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" data-department-name="${departmentName}" data-department-id="${departmentId}">
                        <i class="fas fa-plus"></i> Add New Feedback
                    </button>
                    <button type="button" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalTitle').textContent = `Feedback Details - ${departmentName}`;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('show');
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
                    <button class="btn btn-primary btn-small view-transaction-btn" data-transaction-id="${transaction._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${transaction.status === 'Pending' && currentUser?.role !== 'viewer' ? `
                        <button class="btn btn-success btn-small approve-transaction-btn" data-transaction-id="${transaction._id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger btn-small reject-transaction-btn" data-transaction-id="${transaction._id}">
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
                        <button class="btn btn-primary btn-small view-project-btn" data-project-id="${project._id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-small view-progress-btn" data-project-id="${project._id}">
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
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
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

    viewProject(projectId) {
        const project = projects.find(proj => proj._id === projectId);
        if (!project) {
            this.showToast('Project not found', 'error');
            return;
        }

        const progressPercentage = Math.round((project.budget.spent / project.budget.allocated) * 100);
        const daysRemaining = this.calculateDaysRemaining(project.endDate);

        const content = `
            <div class="project-details">
                <div class="detail-section">
                    <h4>Project Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Project Name:</label>
                            <span>${project.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Department:</label>
                            <span>${project.department}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                        <div class="detail-item">
                            <label>Start Date:</label>
                            <span>${formatDate(project.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>End Date:</label>
                            <span>${formatDate(project.endDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Days Remaining:</label>
                            <span>${daysRemaining} days</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${project.description || 'No description available'}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Budget Information</h4>
                    <div class="budget-grid">
                        <div class="budget-item">
                            <label>Total Budget:</label>
                            <span>${formatCurrency(project.budget.allocated)}</span>
                        </div>
                        <div class="budget-item">
                            <label>Amount Spent:</label>
                            <span>${formatCurrency(project.budget.spent)}</span>
                        </div>
                        <div class="budget-item">
                            <label>Remaining:</label>
                            <span>${formatCurrency(project.budget.remaining)}</span>
                        </div>
                        <div class="budget-item">
                            <label>Utilization:</label>
                            <span>${progressPercentage}%</span>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-primary view-progress-btn" data-project-id="${project._id}">
                        <i class="fas fa-chart-line"></i> View Progress
                    </button>
                    <button type="button" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('projectModalTitle').textContent = `Project Details - ${project.name}`;
        document.getElementById('projectModalBody').innerHTML = content;
        document.getElementById('projectModal').classList.add('show');
    },

    viewProjectProgress(projectId) {
        const project = projects.find(proj => proj._id === projectId);
        if (!project) {
            this.showToast('Project not found', 'error');
            return;
        }

        const progressPercentage = Math.round((project.budget.spent / project.budget.allocated) * 100);
        const daysRemaining = this.calculateDaysRemaining(project.endDate);
        const totalDays = this.calculateDaysBetween(project.startDate, project.endDate);
        const daysElapsed = totalDays - daysRemaining;
        const timeProgress = Math.round((daysElapsed / totalDays) * 100);

        const content = `
            <div class="project-progress">
                <div class="progress-section">
                    <h4>Budget Progress</h4>
                    <div class="progress-item">
                        <div class="progress-header">
                            <span>Budget Utilization</span>
                            <span>${progressPercentage}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-details">
                            <span>${formatCurrency(project.budget.spent)} of ${formatCurrency(project.budget.allocated)}</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section">
                    <h4>Timeline Progress</h4>
                    <div class="progress-item">
                        <div class="progress-header">
                            <span>Time Elapsed</span>
                            <span>${timeProgress}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${timeProgress}%"></div>
                        </div>
                        <div class="progress-details">
                            <span>${daysElapsed} of ${totalDays} days</span>
                        </div>
                    </div>
                </div>

                <div class="progress-section">
                    <h4>Project Status</h4>
                    <div class="status-grid">
                        <div class="status-item">
                            <label>Current Status:</label>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                        <div class="status-item">
                            <label>Days Remaining:</label>
                            <span>${daysRemaining} days</span>
                        </div>
                        <div class="status-item">
                            <label>Budget Status:</label>
                            <span class="${progressPercentage > 90 ? 'text-danger' : progressPercentage > 75 ? 'text-warning' : 'text-success'}">
                                ${progressPercentage > 90 ? 'Over Budget Risk' : progressPercentage > 75 ? 'High Usage' : 'On Track'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-primary view-project-btn" data-project-id="${project._id}">
                        <i class="fas fa-eye"></i> View Project Details
                    </button>
                    <button type="button" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('projectModalTitle').textContent = `Project Progress - ${project.name}`;
        document.getElementById('projectModalBody').innerHTML = content;
        document.getElementById('projectModal').classList.add('show');
    },

    calculateDaysRemaining(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },

    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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
            // Find the transaction in the sample data
            const transaction = transactions.find(t => t._id === id);
            if (transaction) {
                transaction.status = 'Approved';
                transaction.approvedBy = currentUser ? currentUser.name : 'Admin';
                transaction.approvedDate = new Date().toISOString();

                this.showToast('Transaction approved successfully', 'success');
                await this.loadTransactions();
            } else {
                this.showToast('Transaction not found', 'error');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async rejectTransaction(id) {
        try {
            // Find the transaction in the sample data
            const transaction = transactions.find(t => t._id === id);
            if (transaction) {
                transaction.status = 'Rejected';
                transaction.rejectedBy = currentUser ? currentUser.name : 'Admin';
                transaction.rejectedDate = new Date().toISOString();

                this.showToast('Transaction rejected', 'warning');
                await this.loadTransactions();
            } else {
                this.showToast('Transaction not found', 'error');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    viewTransactionDetails(transactionId) {
        const transaction = transactions.find(t => t._id === transactionId);
        if (!transaction) {
            this.showToast('Transaction not found', 'error');
            return;
        }

        const content = `
            <div class="transaction-details">
                <div class="detail-section">
                    <h4>Transaction Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Transaction ID:</label>
                            <span><code>${transaction._id}</code></span>
                        </div>
                        <div class="detail-item">
                            <label>Department:</label>
                            <span>${transaction.department}</span>
                        </div>
                        <div class="detail-item">
                            <label>Category:</label>
                            <span>${transaction.category}</span>
                        </div>
                        <div class="detail-item">
                            <label>Amount:</label>
                            <span>${formatCurrency(transaction.amount)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${formatDate(transaction.date)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span>
                        </div>
                        ${transaction.approvedBy ? `
                        <div class="detail-item">
                            <label>Approved By:</label>
                            <span>${transaction.approvedBy}</span>
                        </div>
                        ` : ''}
                        ${transaction.rejectedBy ? `
                        <div class="detail-item">
                            <label>Rejected By:</label>
                            <span>${transaction.rejectedBy}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${transaction.description || 'No description available'}</p>
                </div>
                
                <div class="form-actions">
                    ${transaction.status === 'Pending' ? `
                    <button type="button" class="btn btn-success approve-transaction-btn" data-transaction-id="${transaction._id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button type="button" class="btn btn-danger reject-transaction-btn" data-transaction-id="${transaction._id}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    ` : ''}
                    <button type="button" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('transactionModalTitle').textContent = `Transaction Details - ${transaction._id}`;
        document.getElementById('transactionModalBody').innerHTML = content;
        document.getElementById('transactionModal').classList.add('show');
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


    document.getElementById('feedbackModalClose').addEventListener('click', () => {
        ui.hideFeedbackModal();
    });


    document.getElementById('feedbackModal').addEventListener('click', (e) => {
        if (e.target.id === 'feedbackModal') {
            ui.hideFeedbackModal();
        }
    });


    document.getElementById('projectModalClose').addEventListener('click', () => {
        ui.hideProjectModal();
    });


    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') {
            ui.hideProjectModal();
        }
    });


    document.getElementById('transactionModalClose').addEventListener('click', () => {
        ui.hideTransactionModal();
    });


    document.getElementById('transactionModal').addEventListener('click', (e) => {
        if (e.target.id === 'transactionModal') {
            ui.hideTransactionModal();
        }
    });


    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('show');
    });


    document.addEventListener('click', function (e) {
        console.log('Button clicked:', e.target);

        // Feedback buttons
        if (e.target.closest('.feedback-button')) {
            const button = e.target.closest('.feedback-button');
            const departmentName = button.dataset.departmentName;
            const departmentId = button.dataset.departmentId;
            console.log('Feedback button clicked:', departmentName, departmentId);
            ui.showFeedbackModal(departmentName, departmentId);
        }


        if (e.target.closest('.view-feedback-btn')) {
            const button = e.target.closest('.view-feedback-btn');
            const departmentName = button.dataset.departmentName;
            const departmentId = button.dataset.departmentId;
            console.log('View feedback button clicked:', departmentName, departmentId);
            ui.viewFeedbackDetails(departmentName, departmentId);
        }


        if (e.target.closest('.view-project-btn')) {
            const button = e.target.closest('.view-project-btn');
            const projectId = button.dataset.projectId;
            console.log('View project button clicked:', projectId);
            ui.viewProject(projectId);
        }


        if (e.target.closest('.view-progress-btn')) {
            const button = e.target.closest('.view-progress-btn');
            const projectId = button.dataset.projectId;
            console.log('View progress button clicked:', projectId);
            ui.viewProjectProgress(projectId);
        }


        if (e.target.closest('.view-transaction-btn')) {
            const button = e.target.closest('.view-transaction-btn');
            const transactionId = button.dataset.transactionId;
            console.log('View transaction button clicked:', transactionId);
            ui.viewTransactionDetails(transactionId);
        }


        if (e.target.closest('.approve-transaction-btn')) {
            const button = e.target.closest('.approve-transaction-btn');
            const transactionId = button.dataset.transactionId;
            console.log('Approve transaction button clicked:', transactionId);
            ui.approveTransaction(transactionId);
        }


        if (e.target.closest('.reject-transaction-btn')) {
            const button = e.target.closest('.reject-transaction-btn');
            const transactionId = button.dataset.transactionId;
            console.log('Reject transaction button clicked:', transactionId);
            ui.rejectTransaction(transactionId);
        }

        // Test button
        // if (e.target.closest('.test-button')) {
        //     alert('Button click works!');
        //     console.log('Test button clicked successfully');
        // }


        if (e.target.closest('.modal-close') || e.target.closest('.btn-secondary')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                console.log('Modal closed');
            }
        }


        if (e.target.closest('.submit-feedback-btn')) {
            const button = e.target.closest('.submit-feedback-btn');
            const departmentId = button.dataset.departmentId;
            const departmentName = button.dataset.departmentName;
            console.log('Submit feedback button clicked:', departmentId, departmentName);
            ui.submitFeedback(departmentId, departmentName);
        }
    });

    console.log('Event delegation system set up successfully');

});


console.log('Financial Transparency Platform loaded successfully!');
