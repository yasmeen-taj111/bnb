class AIChatbot {
    constructor() {
        this.config = null;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.conversationHistory = [];
        this.isProcessing = false;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('Initializing AI chatbot...');
            const response = await fetch('/api/ai-config');
            if (response.ok) {
                this.config = await response.json();
                console.log('AI chatbot configured from server:', {
                    model: this.config.model,
                    useMockResponses: this.config.useMockResponses,
                    hasApiKey: !!this.config.apiKey && !this.config.apiKey.includes('your-openai-api-key')
                });
            } else {
                throw new Error('Failed to fetch AI configuration');
            }
        } catch (error) {
            console.error('Failed to initialize AI chatbot:', error);

            this.config = {
                apiKey: '',
                model: 'gpt-3.5-turbo',
                maxTokens: 500,
                temperature: 0.7,
                useMockResponses: true
            };
        }

        this.initialized = true;
    }

    async sendMessage(message) {
        if (this.isProcessing) {
            return { error: 'AI is processing a previous request. Please wait...' };
        }


        await this.initialize();

        this.isProcessing = true;

        try {

            if (this.config.useMockResponses || !this.config.apiKey || this.config.apiKey.includes('your-openai-api-key')) {
                console.log('Using mock responses (API key not configured)');
                this.isProcessing = false;
                return this.getMockResponse(message);
            }


            this.conversationHistory.push({
                role: 'user',
                content: message
            });


            const requestBody = {
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: this.config.systemPrompt || `You are an AI assistant for FundRadar, a financial transparency platform. 
                        You help users understand budget allocations, department spending, transactions, and projects
                        Available data context:
                        - Total Budget: ₹5,00,00,000 (5 crores)
                        - Total Spent: ₹3,50,00,000 (3.5 crores)
                        - Remaining: ₹1,50,00,000 (1.5 crores)
                        - Departments: Education, Healthcare, Infrastructure, Technology, Agriculture.
                        Always provide helpful, accurate responses about financial data.
                        Use Indian Rupee (₹) currency format.
                        Be conversational and helpful.`
                    },
                    ...this.conversationHistory
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;


            this.conversationHistory.push({
                role: 'assistant',
                content: aiMessage
            });

            this.isProcessing = false;
            return { success: true, message: aiMessage };

        } catch (error) {
            this.isProcessing = false;
            console.error('AI Chatbot Error:', error);


            return this.getMockResponse(message);
        }
    }

    getMockResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('budget') || lowerMessage.includes('allocation')) {
            return {
                success: true,
                message: `# 📊 FundRadar Budget Analysis

## **Current Financial Overview**
- **Total Allocated:** ₹5,00,00,000 (5 crores)
- **Total Spent:** ₹3,50,00,000 (3.5 crores)
- **Remaining:** ₹1,50,00,000 (1.5 crores)
- **Overall Utilization:** 70%

## **Department Performance Analysis**

| Department | Allocated | Spent | Remaining | Utilization | Status |
|------------|-----------|-------|-----------|-------------|---------|
| **Education** | ₹1,50,00,000 | ₹1,20,00,000 | ₹30,00,000 | 80% | ⚠️ High |
| **Healthcare** | ₹1,20,00,000 | ₹80,00,000 | ₹40,00,000 | 67% | ✅ Good |
| **Infrastructure** | ₹1,00,00,000 | ₹90,00,000 | ₹10,00,000 | 90% | 🚨 Critical |
| **Technology** | ₹80,00,000 | ₹40,00,000 | ₹40,00,000 | 50% | ✅ Under-utilized |
| **Agriculture** | ₹50,00,000 | ₹20,00,000 | ₹30,00,000 | 40% | ✅ Under-utilized |

## **Key Insights & Recommendations**

### ⚠️ **Areas of Concern:**
- **Infrastructure** is at 90% utilization - may need additional funding
- **Education** is at 80% utilization - monitor closely

### 💡 **Optimization Opportunities:**
- **Technology** and **Agriculture** have significant unused funds
- Consider reallocating ₹70,00,000 from under-utilized departments
- Focus on completing pending projects before year-end

### 📈 **Next Steps:**
1. Review Infrastructure department's remaining projects
2. Consider transferring funds from Technology to Infrastructure
3. Accelerate Agriculture department's project implementation`
            };
        }

        if (lowerMessage.includes('department') || lowerMessage.includes('spending')) {
            return {
                success: true,
                message: `# 🏢 Department Spending Analysis

## **Spending Performance by Department**

### 🚨 **Critical Status (90%+ utilization)**
- **Infrastructure Department**: ₹90,00,000 spent (90% of ₹1,00,00,000)
  - Status: **Critical** - Only ₹10,00,000 remaining
  - Action Required: Immediate budget review or reallocation

### ⚠️ **High Utilization (70-89%)**
- **Education Department**: ₹1,20,00,000 spent (80% of ₹1,50,00,000)
  - Status: **High** - ₹30,00,000 remaining
  - Recommendation: Monitor closely, prepare for potential overrun

### ✅ **Optimal Range (50-69%)**
- **Healthcare Department**: ₹80,00,000 spent (67% of ₹1,20,00,000)
  - Status: **Good** - ₹40,00,000 remaining
  - Performance: On track for year-end completion

### 📉 **Under-utilized (Below 50%)**
- **Technology Department**: ₹40,00,000 spent (50% of ₹80,00,000)
  - Status: **Under-utilized** - ₹40,00,000 remaining
  - Opportunity: Accelerate project implementation

- **Agriculture Department**: ₹20,00,000 spent (40% of ₹50,00,000)
  - Status: **Under-utilized** - ₹30,00,000 remaining
  - Opportunity: Increase project scope or reallocate funds

## **Strategic Recommendations**

### 💰 **Fund Reallocation Opportunities**
- **Total Under-utilized Funds**: ₹70,00,000
- **Recommended Transfer**: ₹30,00,000 from Technology to Infrastructure
- **Potential Impact**: Prevents Infrastructure budget shortfall

### 📊 **Department Efficiency Score**
1. **Healthcare**: 67% - Optimal utilization
2. **Education**: 80% - High but manageable
3. **Technology**: 50% - Needs acceleration
4. **Agriculture**: 40% - Requires intervention
5. **Infrastructure**: 90% - Critical attention needed`
            };
        }

        if (lowerMessage.includes('transaction') || lowerMessage.includes('recent')) {
            return {
                success: true,
                message: `# 💳 Recent Transaction Analysis

## **Latest Transactions (Last 30 Days)**

| Date | Description | Department | Amount | Status | Priority |
|------|-------------|------------|--------|--------|----------|
| 2024-01-15 | Lab Equipment Purchase | Education | ₹1,20,000 | ✅ Approved | High |
| 2024-01-14 | Hospital Supplies | Healthcare | ₹85,000 | ⏳ Pending | Medium |
| 2024-01-13 | Road Maintenance | Infrastructure | ₹2,50,000 | ✅ Approved | Critical |
| 2024-01-12 | Software Licenses | Technology | ₹45,000 | ✅ Approved | Low |
| 2024-01-11 | Farming Equipment | Agriculture | ₹75,000 | ⏳ Pending | Medium |

## **Transaction Summary**
- **Total Value**: ₹5,75,000
- **Approved Transactions**: 3 (₹4,15,000)
- **Pending Transactions**: 2 (₹1,60,000)
- **Approval Rate**: 60%

## **Status Analysis**

### ✅ **Approved Transactions**
- **Education**: Lab equipment for digital learning initiative
- **Infrastructure**: Critical road maintenance (highest value)
- **Technology**: Essential software licenses

### ⏳ **Pending Transactions**
- **Healthcare**: Hospital supplies awaiting budget confirmation
- **Agriculture**: Farming equipment pending vendor approval

## **Recommendations**
1. **Expedite Pending Approvals**: ₹1,60,000 in pending transactions
2. **Monitor Infrastructure**: High-value transactions need close tracking
3. **Review Approval Process**: 40% pending rate suggests process bottlenecks`
            };
        }

        if (lowerMessage.includes('project') || lowerMessage.includes('progress')) {
            return {
                success: true,
                message: `# 🚀 Project Portfolio Analysis

## **Active Projects Overview**

| Project Name | Department | Budget | Spent | Progress | Status | Timeline |
|--------------|------------|--------|-------|----------|--------|----------|
| **Digital Education Initiative** | Education | ₹50,00,000 | ₹37,50,000 | 75% | 🟢 On Track | Q2 2024 |
| **Smart City Infrastructure** | Infrastructure | ₹80,00,000 | ₹48,00,000 | 60% | 🟡 Delayed | Q3 2024 |
| **Healthcare Modernization** | Healthcare | ₹60,00,000 | ₹27,00,000 | 45% | 🟢 On Track | Q4 2024 |
| **Green Energy Project** | Technology | ₹40,00,000 | ₹12,00,000 | 30% | 🔴 Behind | Q1 2025 |

## **Project Performance Metrics**
- **Total Project Budget**: ₹2,30,00,000
- **Total Spent**: ₹1,24,50,000
- **Average Progress**: 52.5%
- **On-Track Projects**: 2 out of 4

## **Project Status Analysis**

### 🟢 **On Track Projects**
- **Digital Education Initiative**: 75% complete, ahead of schedule
- **Healthcare Modernization**: 45% complete, steady progress

### 🟡 **Delayed Projects**
- **Smart City Infrastructure**: 60% complete, 2 weeks behind schedule
  - Issue: Weather delays affecting road construction
  - Action: Accelerate indoor infrastructure work

### 🔴 **Behind Schedule**
- **Green Energy Project**: 30% complete, 1 month behind
  - Issue: Equipment procurement delays
  - Action: Expedite vendor contracts

## **Budget Utilization by Project**
- **Education**: 75% of budget utilized (optimal)
- **Infrastructure**: 60% of budget utilized (good)
- **Healthcare**: 45% of budget utilized (on track)
- **Technology**: 30% of budget utilized (needs acceleration)

## **Recommendations**
1. **Accelerate Green Energy Project**: Expedite procurement process
2. **Monitor Smart City Project**: Implement catch-up plan
3. **Maintain Education Momentum**: Continue current pace
4. **Review Healthcare Timeline**: Ensure Q4 delivery`
            };
        }

        return {
            success: true,
            message: `# 🤖 FundRadar AI Assistant

Welcome! I'm your specialized AI assistant for **FundRadar**, the comprehensive financial transparency platform. I can help you analyze and understand your financial data with detailed insights and recommendations.

## **What I Can Help You With:**

### 📊 **Budget Analysis**
- "Show me budget allocation"
- "What's our total budget utilization?"
- "Which department is over budget?"
- "Compare department spending"

### 🏢 **Department Insights**
- "Which department spent the most?"
- "Show me Education department budget"
- "Analyze Healthcare spending patterns"
- "Department performance comparison"

### 💳 **Transaction Analysis**
- "Show me recent transactions"
- "What transactions are pending?"
- "Analyze transaction patterns"
- "Transaction approval rates"

### 🚀 **Project Management**
- "Show me active projects"
- "Project progress analysis"
- "Which projects are behind schedule?"
- "Project budget utilization"

### 🔍 **Advanced Analytics**
- "Identify spending anomalies"
- "Budget optimization recommendations"
- "Risk assessment analysis"
- "Performance trends"

## **Sample Queries to Try:**
- "Give me a comprehensive budget overview"
- "Which department needs immediate attention?"
- "Show me all pending transactions"
- "Analyze project performance"

**What would you like to explore about your financial data?**`
        };
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getHistory() {
        return this.conversationHistory;
    }
}

window.aiChatbot = new AIChatbot();
