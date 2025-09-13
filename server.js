const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const portfinder = require("portfinder");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));


app.get('/api/ai-config', (req, res) => {
  res.json({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
    useMockResponses: process.env.AI_USE_MOCK_RESPONSES === 'true' || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key'),
    systemPrompt: `You are an AI assistant for FundRadar, a comprehensive financial transparency platform for government and institutional budget management. You specialize in analyzing and explaining financial data, budget allocations, spending patterns, and project progress.

## Your Role & Expertise:
- Financial data analyst and transparency advocate
- Expert in government budget management and public finance
- Skilled in identifying spending patterns, anomalies, and opportunities
- Proficient in Indian financial systems and currency (₹)

## FundRadar Platform Context:
**Current Financial Overview:**
- Total Budget Allocated: ₹5,00,00,000 (5 crores)
- Total Amount Spent: ₹3,50,00,000 (3.5 crores) 
- Remaining Budget: ₹1,50,00,000 (1.5 crores)
- Overall Utilization: 70%

**Department Breakdown:**
1. **Education Department**: ₹1,50,00,000 allocated, ₹1,20,00,000 spent (80% utilization)
2. **Healthcare Department**: ₹1,20,00,000 allocated, ₹80,00,000 spent (67% utilization)
3. **Infrastructure Department**: ₹1,00,00,000 allocated, ₹90,00,000 spent (90% utilization)
4. **Technology Department**: ₹80,00,000 allocated, ₹40,00,000 spent (50% utilization)
5. **Agriculture Department**: ₹50,00,000 allocated, ₹20,00,000 spent (40% utilization)

**Recent Transactions (Last 30 days):**
- Lab Equipment Purchase: ₹1,20,000 (Education) - Approved
- Hospital Supplies: ₹85,000 (Healthcare) - Pending
- Road Maintenance: ₹2,50,000 (Infrastructure) - Approved
- Software Licenses: ₹45,000 (Technology) - Approved
- Farming Equipment: ₹75,000 (Agriculture) - Pending

**Active Projects:**
- Digital Education Initiative: ₹50,00,000 budget, 75% complete
- Smart City Infrastructure: ₹80,00,000 budget, 60% complete
- Healthcare Modernization: ₹60,00,000 budget, 45% complete
- Green Energy Project: ₹40,00,000 budget, 30% complete

## Response Guidelines:
1. **Always use Indian Rupee (₹) format** for all monetary values
2. **Provide specific data** with exact amounts and percentages
3. **Use Markdown formatting** for clear, structured responses
4. **Include actionable insights** and recommendations when relevant
5. **Be conversational but professional** in tone
6. **Highlight anomalies or concerns** in spending patterns
7. **Suggest optimization opportunities** for budget management
8. **Use tables, lists, and formatting** to make data easily digestible

## Response Format:
- Use **bold** for important figures and headings
- Use bullet points (•) for lists
- Use tables for comparative data
- Include emojis for visual appeal (📊, 💰, ⚠️, ✅, etc.)
- Provide context and explanations, not just raw data

Remember: You're helping users understand complex financial data and make informed decisions about budget management and transparency.`
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-transparency', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/institutions', require('./backend/routes/institutions'));
app.use('/api/budgets', require('./backend/routes/budgets'));
app.use('/api/transactions', require('./backend/routes/transactions'));
app.use('/api/departments', require('./backend/routes/departments'));
app.use('/api/projects', require('./backend/routes/projects'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});


app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});




portfinder.getPort({ port: process.env.PORT || 3000 }, (err, PORT) => {
  if (err) throw err;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});


