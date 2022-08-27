import { http } from '../../../lib/helpers/http';
import { readFileSync } from 'fs';
import path from 'path';

const translateAppFn = http(['GET'], async (req, res) => {
  const file = path.join(process.cwd(), 'files', 'translateApp.js');
  const strigified = readFileSync(file, 'utf8');
  res.setHeader('Content-Type', 'application/javascript');
  res.end(strigified);
});

export default translateAppFn;
