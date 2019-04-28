import { Claims } from '../lib/tokens';

export interface Context {
  token: string;
  claims?: Claims;
}

export function context({ req }): Context {
  const token = req.headers['x-token'] || '';
  return {
    token,
  };
}
