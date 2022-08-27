import { http } from '../../../lib/helpers/http';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.FIRE_API_KEY as string,
  authDomain: process.env.FIRE_DOMAIN as string,
  projectId: process.env.FIRE_PROJECT_ID as string,
});
const db = getFirestore(app);

const storeLanguages = http(['POST', 'GET'], async (req, res) => {
  try {
    if (req.method === 'GET') {
      const storeData = req.body.storeData;

      const languagesEnabled = storeData.languagesEnabled || [];
      const defaultLanguage = storeData.defaultLanguage || {
        code: 'en',
        name: 'english',
      };
      const response = {
        defaultLanguage,
        languagesEnabled,
        meta: {
          status: 'success',
        },
      };
      res.status(200).json(response);
    }
    if (req.method === 'POST') {
      const {
        languagesEnabled,
        defaultLanguage,
      }: { languagesEnabled: []; defaultLanguage: {} } = JSON.parse(req.body);

      const storehash = req.headers.storehash as string;

      const ref = doc(db, 'store', storehash);
      await updateDoc(ref, { languagesEnabled, defaultLanguage });

      res.status(200).json({ meta: { status: 'success' } });
    }
  } catch (error: any) {
    console.error('error', error);
    res.status(500).json({ meta: { status: 'error' } });
    return;
  }
});

export default storeLanguages;
