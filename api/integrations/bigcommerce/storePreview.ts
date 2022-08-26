import { http } from '../../../lib/helpers/http';
import axios from 'axios';

const storePreview = http(['POST'], async (req, res) => {
  const { url } = JSON.parse(req.body);
  if (!url) {
    res.status(400).send('No url specified');
    return;
  }
  const response = await axios.get(url);
  const html = await response.data;

  res.status(200).send(html);
  return;
});

export default storePreview;
