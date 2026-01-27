import './loadEnv.js';
import next from 'next';
import http from 'http';

const dev = process.env.NODE_ENV !== 'production';

import { connectDb } from './src/configs/connectDb.js';
import { initSocket } from './src/socket/socketServer.js';
import { startNotificationWatcher } from './src/watchers/notificationWatcher.js';

console.log('📦 Initializing Next.js app...');
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('⏳ Preparing Next.js app (this may take a few seconds)...');
await app.prepare();
console.log('✅ Next.js app prepared');

console.log('🔌 Connecting to MongoDB...');
await connectDb(process.env.MONGODB_URL);
console.log('✅ MongoDB connected');

const server = http.createServer((req, res) => {
  handle(req, res);
});

initSocket(server);
startNotificationWatcher();

server.listen(3000, () => {
  console.log('🚀 Next.js + Socket.IO running on http://localhost:3000');
});
