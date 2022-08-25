import { http } from '../../../lib/helpers/http';
import { readFileSync } from 'fs';
import path from 'path';
import { mongooseConnect } from '../../../config';
import Store from '../../../models/store';

mongooseConnect();

const translateFn = http(['GET'], async (req, res) => {
  console.log('req.headers', req.headers);
  const storeData = await Store.findOne({
    hostname: req.headers.origin,
  });
  if (!storeData) {
    res.status(400).send('Not allowed');
    return;
  }
  const file = path.join(process.cwd(), 'files', 'translateApp.js');
  const strigified = readFileSync(file, 'utf8');
  res.setHeader('Content-Type', 'application/javascript');
  res.end(strigified);
});

export default translateFn;
