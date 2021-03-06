import { db } from './db';
import { Election } from '../types';

export const createElection = async (election: Election): Promise<Election> => {
  const dbElection = toDbElection(election);

  const query = `INSERT INTO 
    elections (id, name, description, created_by, date_created, date_updated, candidates, status, status_transitions)
    VALUES($(id), $(name), $(description), $(created_by), $(date_created), $(date_updated), $(candidates), $(status), $(status_transitions));`;
  await db.none(query, dbElection);
  return election;
};

export const updateElection = async (election: Election): Promise<Election> => {
  const dbElection = toDbElection(election);
  const query = `UPDATE elections SET name = $(name), description = $(description), date_updated = $(date_updated), status = $(status), status_transitions=$(status_transitions), results = $(results), candidates = $(candidates) WHERE id = $(id)`;
  await db.none(query, dbElection);
  return election;
};

export const listElections = async (): Promise<Election[]> => {
  const dbElections = await db.any('SELECT * FROM elections');
  return dbElections.map(fromDbElection);
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
  await db.none('DELETE FROM elections WHERE id IN ($1:csv);', ids);
  return;
};

function toDbElection(election: Election) {
  return {
    ...election,
    created_by: election.createdBy,
    date_created: election.dateCreated,
    date_updated: election.dateUpdated,
    status_transitions: JSON.stringify(election.statusTransitions),
    candidates: JSON.stringify(election.candidates),
    results: JSON.stringify(election.results),
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
