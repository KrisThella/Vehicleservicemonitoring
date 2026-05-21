import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const files = ['tsmpc.db', 'tsmpc.db-shm', 'tsmpc.db-wal'].map((name) => path.join(dataDir, name));

let removed = 0;
for (const filePath of files) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed ${filePath}`);
    removed += 1;
  }
}

if (removed === 0) {
  console.log('No DB files found to remove.');
} else {
  console.log('Database files removed. The app will recreate and seed defaults on next launch.');
}
