# FundRadar - Financial Transparency Platform

FundRadar is a comprehensive financial transparency platform built with Node.js, Express, and modern web technologies. It provides real-time budget tracking, transaction monitoring, and AI-powered insights for government and institutional financial management.

---

## 🌟 Features

### Core Functionality
- **Dashboard Analytics**: Real-time budget overview with interactive charts and key metrics.
- **Budget Management**: Track budget allocations and spending across departments.
- **Transaction Monitoring**: Real-time transaction processing with approval workflows.
- **Project Tracking**: Monitor project lifecycle and milestones.
- **Institution Management**: Multi-institution support with role-based access.

### Advanced Features
- **AI-Powered Chatbot**: Ask natural language queries about financial data.
- **Multi-Currency Support**: Real-time currency conversion (INR ↔ USD).
- **Dark/Light Mode**: User-preference-based theme switching.
- **Anomaly Detection**: Automatic alerts for budget overruns.
- **Community Feedback**: Public feedback system for budget transparency.
- **Responsive Design**: Mobile-first design with cross-device compatibility.

### Security & Transparency
- **JWT Authentication**: Secure user authentication.
- **Role-Based Access**: Different permissions for various user types.
- **Audit Trail**: Complete transaction and action logging.
- **Data Encryption**: Secure data transmission and storage.

---

## 🛠 Tech Stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Authentication:** JWT  
**AI & Chatbot:** OpenAI GPT-3.5-turbo  
**Data Visualization:** Chart.js, Font Awesome  

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- npm or yarn

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v14 or higher
- MongoDB v4.4 or higher
- npm or yarn

### Steps

1. **Clone the repository**
git clone https://github.com/yasmeen-taj111/bnb.git

2. **Install dependencies**
npm install
# or using yarn
# yarn install

3. **Set up environment variables**
cp .env.example .env

Edit the `.env` file with your configuration:
PORT=3002
MONGODB_URI=mongodb://localhost:27017/fundradar
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
AI_USE_MOCK_RESPONSES=false

4. **Start MongoDB service**
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb

# Windows
# Start MongoDB service from Services or run `mongod`

5. **Create the database**
mongo
use fundradar

6. **Start the application**
npm start
# or using yarn
# yarn start

7. **Access the application**
Open your browser and navigate to http://localhost:3002

---

### 📁 Project Structure
financial-transparency-platform/
├── backend/
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # MongoDB models
│   └── routes/           # API routes
├── public/               # Frontend files (HTML, CSS, JS)
├── server.js             # Express server
├── package.json          # Dependencies & scripts
└── README.md

---

## 🎯 Usage

### Dashboard
- Real-time budget and transaction monitoring
- Interactive charts and KPIs

### Budget Management
- Allocate budgets to departments
- Track spending vs allocation
- Set budget alerts

### Transaction Processing
- Submit, approve, and monitor transactions
- Export transaction history

### Project Tracking
- Create and manage projects
- Track budgets, milestones, and timelines

### AI Chatbot
- Ask questions in natural language
- Generate reports and insights
- Real-time financial analysis

---

## 👥 Team

**Team Name:** 404 

**Members:**  
- Yasmeen Taj
- Yashashri Muthyala
- Ruhina
- Anagha Parameswar

---

**FundRadar** – Making financial transparency accessible and intelligent.  
