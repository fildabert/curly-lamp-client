/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import jwt from 'jsonwebtoken';

const SECRET = 'RAHASIA';

export function checkLogin(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (error) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      localStorage.removeItem('token');
    }
    return null;
  }
}
