const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat')

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`LexAI server running on port ${port}`);
});
