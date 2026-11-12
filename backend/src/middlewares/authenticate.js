import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/env.js';
import User from '../modules/users/user.model.js';

const cookieNamesByRole = {
  citizen: 'citizenAccessToken',
  cmo: 'cmoAccessToken',
  department_officer: 'departmentAccessToken'
};

async function authenticate(req, res, next) {
  const portalRole = req.get('X-Portal-Role');
  if (portalRole && !cookieNamesByRole[portalRole]) {
    return res.status(400).json({ success: false, message: 'Invalid portal role.' });
  }

  const bearerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = portalRole
    ? req.cookies?.[cookieNamesByRole[portalRole]] || bearerToken
    : req.cookies?.accessToken
      || req.cookies?.citizenAccessToken
      || req.cookies?.cmoAccessToken
      || req.cookies?.departmentAccessToken
      || bearerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub).select('_id fullName email mobile role department isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is unavailable' });
    }
    if (portalRole && user.role !== portalRole) {
      return res.status(403).json({ success: false, message: 'This account does not belong to the selected portal.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    return next(error);
  }
}

export default authenticate;
