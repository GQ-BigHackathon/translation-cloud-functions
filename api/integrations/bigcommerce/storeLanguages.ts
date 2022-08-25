import { http } from '../../../lib/helpers/http';
import { mongooseConnect } from '../../../config';
import Store from '../../../models/store';

mongooseConnect();

const storeLanguages = http(['POST', 'GET'], async (req, res) => {
  try {
    if (req.method === 'GET') {
      const storeData = await Store.findOne({
        hostname: req.headers.origin,
      });
      if (!storeData) {
        res.status(400).send('Not allowed');
        return;
      }

      const languagesEnabled = storeData.languagesEnabled;

      const response = {
        languagesEnabled,
        meta: {
          status: 'success',
        },
      };
      res.status(200).json(response);
    }
  } catch (error: any) {
    console.error('error', error);
    res.status(500).send({ Error: error.message });
    return;
  }
});

export default storeLanguages;
