export interface Context {
  token: string;
}

export function context({ req }): Context {
  const token = req.headers['x-token'] || '';
  return {
    token,
  };
}
