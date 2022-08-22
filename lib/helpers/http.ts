import { VercelRequest, VercelResponse } from '@vercel/node';

import Store from '../../models/store';
import { mongooseConnect } from '../../config';
mongooseConnect();

export const http = (
  allowedMethods: string[],
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) => {
  const methods = allowedMethods
    .map((method) => method.toUpperCase())
    .includes('OPTIONS')
    ? allowedMethods
    : allowedMethods.concat('OPTIONS');
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      methods.map((method) => method.toUpperCase()).join(','),
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (
      !methods
        .map((method) => method.toUpperCase())
        .includes(req.method!.toUpperCase())
    ) {
      res.status(400).send('Method not allowed');
      return;
    }

    if (!req.headers.origin) {
      res.status(400).send('Not allowed');
      return;
    }

    const hostnameFind = await Store.findOne({
      hostname: req.headers.origin,
    });
    if (!hostnameFind) {
      res.status(400).send('Not allowed');
      return;
    }
    await handler(req, res);
  };
};
