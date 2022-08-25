import { http } from '../lib/helpers/http';

const helloWorld = http(['POST', 'GET'], async (req, res) => {
  res.json({ message: 'Hello World!' });
  return;
});

export default helloWorld;
