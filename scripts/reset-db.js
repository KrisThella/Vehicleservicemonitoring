import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const files = ['tsmpc.db', 'tsmpc.db-shm', 'tsmpc.db-wal'].map((f) => path.join(dataDir, f));
let removed = 0;
for (const file of files) {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed ${file}`);
      removed++;
    }
  } catch (e) {
    console.error(`Error removing ${file}:`, e.message);
  }
}
if (removed === 0) console.log('No DB files removed.');
else console.log(`Removed ${removed} DB files. Rebuild to recreate defaults.`);
