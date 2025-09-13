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


