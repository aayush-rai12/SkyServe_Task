import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  logger.info('Authorization header');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Token verification error: ${err.message}`);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default verifyToken;

