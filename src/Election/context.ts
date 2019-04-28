import { Claims } from '../lib/tokens';

export interface Context {
  token?: string;
  claims?: Claims;
}
