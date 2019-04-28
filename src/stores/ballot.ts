import { Observable } from 'rxjs';
import * as QueryStream from 'pg-query-stream';
import { db } from './db';
import { getElection } from './election';

export async function createBallot({ electionId, candidateIndexes }) {
  await db.none(`INSERT INTO ballots VALUES($1, $2)`, [
    electionId,
    JSON.stringify(candidateIndexes),
  ]);
}

export function streamBallots(electionId: string) {
  return new Observable<string[]>(o => {
    //start by getting the election so we can do the tranlation of candidate index to candidate id
    getElection(electionId).then(election => {
      if (!election) throw new Error(`404 - could not find election id '${electionId}`);

      const candidates = election.candidates;

      //now that we have the election, set up our stream of ballots out of the db
      //this library should handle back pressure and keep our memory use low
      const qs = new QueryStream(`SELECT * FROM ballots where election_id = $1`, [
        electionId,
      ]);

      //stream rows out of the db, transform the index based ballot to candidate ids, and next the value onto the observable
      db.stream(qs, stream => {
        stream.on('error', o.error);
        stream.on('data', ({ ballot }) => {
          const indexBallot: number[] = JSON.parse(ballot);
          o.next(indexBallot.map(candidateIndex => candidates[candidateIndex].id));
        });
        stream.on('end', () => o.complete());
      });
    });
  });
}
