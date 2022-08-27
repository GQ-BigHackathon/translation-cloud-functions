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
    if (req.method?.toUpperCase() === 'GET') {
      const storehash = req.headers.storehash as string;
      console.log('storehash', storehash);
      const ref = doc(db, 'store', storehash);
      const storeRef = await getDoc(ref);
      console.log('storeRef', storeRef);
      if (!storeRef.exists) {
        res
          .status(400)
          .json({ meta: { status: 'error', message: 'Store not found' } });
        return;
      }
      const storeData = storeRef.data();
      console.log('storeData', storeData);

      const languagesEnabled = storeData!.languagesEnabled || [];
      const defaultLanguage = storeData!.defaultLanguage || {
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
    if (req.method?.toUpperCase() === 'POST') {
      const {
        languagesEnabled,
        defaultLanguage,
      }: { languagesEnabled: []; defaultLanguage: {} } = req.body;

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
