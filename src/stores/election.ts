import { db } from './db';
import { isObject } from 'util';
import { Election } from '../types';

export const createElection = async (election: Election): Promise<Election> => {
  const dbElection = toDbElection(election);
  const [columns, values] = columnsAndValues(dbElection);
  const query = `INSERT INTO elections VALUES(${columns.join(', ')});`;
  await db.none(query, values);
  return election;
};

export const updateElection = async (election: Election): Promise<Election> => {
  const dbElection = toDbElection(election);
  const query = `UPDATE elections SET name = $(name), description = $(description), date_updated = $(date_updated), status = $(status), status_transistions=$(status_transitions), results = $(results), candidates = $(candidates) WHERE id = $(id)`;
  await db.none(query, {
    ...dbElection,
    status_transitions: JSON.stringify(dbElection.status_transitions),
    candidates: JSON.stringify(dbElection.candidates),
    results: JSON.stringify(dbElection.results),
  });
  return election;
};

export const getElections = async (ids: String[]): Promise<Election[]> => {
  const dbElections = await db.any('SELECT * FROM elections WHERE id IN ($1:csv);', ids);
  return dbElections.map(fromDbElection);
};

export const getElection = async (id: string): Promise<Election> => {
  const [election] = await getElections([id]);
  return election;
};

export const deleteElections = async (ids: String[]) => {
  //TODO: make this transactional
  await db.none('DELETE FROM ballots WHERE election_id IN ($1:csv);', ids);
  return await db.none('DELETE FROM elections WHERE id IN ($1:csv);', ids);
};

function columnsAndValues(o: Object): [string[], Object] {
  const keys = Object.keys(o);
  const values = keys.reduce((acc, key) => {
    const value = o[key];
    acc[key] = isObject(value) ? JSON.stringify(value) : value;
    return acc;
  }, {});
  return [keys.map(key => `$(${key})`), values];
}

function toDbElection(election: Election) {
  return {
    ...election,
    created_by: election.createdBy,
    date_created: election.dateCreated,
    date_updated: election.dateUpdated,
    status_transitions: election.statusTransitions,
  };
}

function fromDbElection(dbElection: any): Election {
  return {
    ...dbElection,
    createdBy: dbElection.created_by,
    dateCreated: dbElection.date_created,
    dateUpdated: dbElection.date_updated,
    statusTransitions: dbElection.status_transitions,
  } as Election;
}
