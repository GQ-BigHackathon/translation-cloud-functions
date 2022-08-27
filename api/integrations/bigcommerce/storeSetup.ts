import { http } from '../../../lib/helpers/http';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.FIRE_API_KEY as string,
  authDomain: process.env.FIRE_DOMAIN as string,
  projectId: process.env.FIRE_PROJECT_ID as string,
});
const db = getFirestore(app);

const storeSetupFn = http(['POST'], async (req, res) => {
  try {
    const storeHash = req.headers.storehash as string;
    console.log('storeHash', storeHash);
    console.log('req.body', req.body);
    const { storeSetupData } = JSON.parse(req.body);
    console.log('storeSetupData', storeSetupData);
    if (!storeSetupData) {
      res.status(400).send('Not allowed');
      return;
    }

    const { hostname, status } = storeSetupData;
    console.log('status', status);
    console.log('hostname', hostname);
    const ref = doc(db, 'store', storeHash);
    await updateDoc(ref, { hostname, status });

    res
      .status(200)
      .json({ meta: { status: 'success', message: 'Store setup' } });
  } catch (error) {
    res.status(500).json({ meta: { status: 'error' } });
  }
});

export default storeSetupFn;
