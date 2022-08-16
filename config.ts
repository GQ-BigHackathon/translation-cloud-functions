import AzureTranslate from './lib/azure/translate';

import dotenv from 'dotenv';
dotenv.config();

export const azureTranslate = new AzureTranslate(
  process.env.AZURE_TRANSLATE_SUBSCRIPTION_KEY as string,
  process.env.AZURE_TRANSLATE_REGION as string,
);
