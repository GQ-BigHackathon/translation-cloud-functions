import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
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

    // if no storehash or referer is provided, return error
    if (!req.headers.storehash && !req.headers.referer) {
      res.status(400).json({
        meta: {
          status: 'error',
          message: 'StoreHash or Referer not provided',
        },
      });
      return;
    }

    if (req.headers.storehash) {
      const storehash = req.headers.storehash as string;
      const ref = doc(db, 'store', storehash);
      const storeRef = await getDoc(ref);

      if (!storeRef.exists()) {
        res.status(400).json({
          meta: {
            status: 'error',
            message: 'StoreHash not found',
          },
        });
        return;
      } else {
        const storeData = storeRef.data();
        console.log('storeData', storeData);
        if (req.method!.toLocaleUpperCase() !== 'GET') {
          req.body.storeData = storeData;
        }
      }
    }

    console.log('got here');

    if (req.headers.referer) {
      const referer = req.headers.referer as string;
      const hostname = referer.replace(/\/$/, '');
      const storesRef = collection(db, 'store');
      const q = query(storesRef, where('hostname', '==', hostname));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        res
          .status(400)
          .json({ meta: { status: 'error', message: 'StoreHash not found' } });
        return;
      } else {
        const storeData = querySnapshot.docs[0].data();
        if (req.method!.toLocaleUpperCase() !== 'GET') {
          req.body.storeData = storeData;
        }
      }
    }

    await handler(req, res);
  };
};
