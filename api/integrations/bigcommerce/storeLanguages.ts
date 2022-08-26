import { http } from '../../../lib/helpers/http';
import { mongooseConnect } from '../../../config';
import Store from '../../../models/store';

mongooseConnect();

const storeLanguages = http(['POST', 'GET'], async (req, res) => {
  try {
    if (req.method === 'GET') {
      const storeData =
        (await Store.findOne({
          hostname: req.headers.origin,
        })) ||
        (await Store.findOne({
          hash: req.headers.storehash,
        }));
      if (!storeData) {
        res.status(400).send('Not allowed');
        return;
      }

      const languagesEnabled = storeData.languagesEnabled;
      const defaultLanguage = storeData.defaultLanguage;
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
      console.log('req.body', req.body);
      const response = Store.updateOne(
        {
          hash: req.headers.storehash,
        },
        {
          languagesEnabled: req.body.languagesEnabled,
          defaultLanguage: req.body.defaultLanguage,
        },
      );
      console.log('response', response);

      res.status(200).json({ response: 'success' });
    }
  } catch (error: any) {
    console.error('error', error);
    res.status(500).send({ Error: error.message });
    return;
  }
});

export default storeLanguages;
