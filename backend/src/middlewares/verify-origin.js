import { clientOrigin } from '../config/env.js';

function verifyOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  if (origin && origin !== clientOrigin) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
  }
  return next();
}

export default verifyOrigin;
