import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const app = initializeApp({
  apiKey: process.env.FIRE_API_KEY as string,
  authDomain: process.env.FIRE_DOMAIN as string,
  projectId: process.env.FIRE_PROJECT_ID as string,
});
const db = getFirestore(app);

export const http = (
  allowedMethods: string[],
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) => {
  const methods = allowedMethods
    .map((method) => method.toUpperCase())
    .includes('OPTIONS')
    ? allowedMethods
    : allowedMethods.concat('OPTIONS');
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      methods.map((method) => method.toUpperCase()).join(','),
    );

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Content, StoreHash, Referer',
    );
    res.setHeader('Access-Control-Max-Age', '3600');
    if (req.method!.toLocaleUpperCase() === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (
      !methods
        .map((method) => method.toUpperCase())
        .includes(req.method!.toUpperCase())
    ) {
      res
        .status(400)
        .json({ meta: { status: 'error', message: 'Method not allowed' } });
      return;
    }

    const storehash = req.headers.storehash as string;
    if (!storehash) {
      res
        .status(400)
        .json({ meta: { status: 'error', message: 'StoreHash required' } });
      return;
    }

    const ref = doc(db, 'store', storehash);
    const storeRef = await getDoc(ref);

    if (!storeRef.exists) {
      res
        .status(400)
        .json({ meta: { status: 'error', message: 'StoreHash not found' } });
      return;
    }

    const storeData = storeRef.data();
    req.body.storeData = storeData;

    await handler(req, res);
  };
};
