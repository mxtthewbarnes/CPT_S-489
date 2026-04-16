import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const databaseDirectory = path.resolve(backendRoot, '..', 'database');

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

export const config = {
  port: Number(process.env.PORT || 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'campus-closet-local-secret',
  dbStorage: process.env.DB_STORAGE
    ? path.resolve(backendRoot, process.env.DB_STORAGE)
    : path.join(databaseDirectory, 'campus_closet.sqlite'),
};
