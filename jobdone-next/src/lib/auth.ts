import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function getCurrentUser(req: NextRequest | Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key';
    
    const decoded = jwt.verify(token, secret) as any;
    return decoded; // { id, role, phone, ... }
  } catch (error) {
    return null;
  }
}
