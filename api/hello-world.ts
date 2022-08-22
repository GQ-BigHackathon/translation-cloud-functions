import { http } from '../lib/helpers/http';

const helloWorld = http(['POST'], async (req, res) => {
  res.json({ message: 'Hello World!' });
  return;
});

export default helloWorld;
