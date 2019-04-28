import { User } from '../types';
import { db } from './db';

export async function createUser(user: User): Promise<User> {
  await db.none(
    'INSERT INTO users (id, email, type) VALUES($(id), $(email), $(type));',
    user
  );
  return user;
}

export async function getUsers(ids: string[]): Promise<User[]> {
  return await db.any('SELECT * FROM users WHERE id IN ($1:csv);', ids);
}

export async function getUsersByEmail(emails: string[]): Promise<User[]> {
  return await db.any('SELECT * FROM users WHERE email IN ($1:csv);', emails);
}

export async function deleteUsers(ids: string[]) {
  await db.none('delete FROM users WHERE id IN ($1:csv);', ids);
}
