import AzureTranslate from './lib/azure/translate';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

export const azureTranslate = new AzureTranslate(
  process.env.AZURE_TRANSLATE_SUBSCRIPTION_KEY as string,
  process.env.AZURE_TRANSLATE_REGION as string,
);

export const mongooseConnect = () => {
  const connect = () =>
    mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    );
  connect();
  mongoose.connection.on('disconnected', connect);
};
