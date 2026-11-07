require('dotenv').config();
const { createApp } = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set — copy server/.env.example to server/.env and fill it in');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set — copy server/.env.example to server/.env and fill it in');
  }

  await connectDb(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const app = createApp();
  app.listen(PORT, () => console.log(`Dueline server listening on port ${PORT}`));
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
