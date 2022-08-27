import AzureTranslate from './lib/azure/translate';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import dotenv from 'dotenv';
dotenv.config();

export const azureTranslate = new AzureTranslate(
  process.env.AZURE_TRANSLATE_SUBSCRIPTION_KEY as string,
  process.env.AZURE_TRANSLATE_REGION as string,
);

export const firebaseFirestore = () => {
  const app = initializeApp({
    apiKey: process.env.FIRE_API_KEY as string,
    authDomain: process.env.FIRE_DOMAIN as string,
    projectId: process.env.FIRE_PROJECT_ID as string,
  });
  const db = getFirestore(app);
  return db;
};
