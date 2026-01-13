import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import routes from './routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.server.env === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 English Coach Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.env}`);
  console.log(`🎯 LLM Model: ${config.llm.model}`);
});
