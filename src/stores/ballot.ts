import { Observable } from 'rxjs';
import * as QueryStream from 'pg-query-stream';
import { db } from './db';

export async function createBallot({ electionId, candidateIds }) {
  await db.none(`INSERT INTO ballots VALUES($1, $2)`, [
    electionId,
    JSON.stringify(candidateIds),
  ]);
}

export function streamBallots(electionId: string) {
  return new Observable<string[]>(o => {
    //now that we have the election, set up our stream of ballots out of the db
    //this library should handle back pressure and keep our memory use low
    const qs = new QueryStream(`SELECT * FROM ballots where election_id = $1`, [
      electionId,
    ]);

    //stream rows out of the db, and next the value onto the observable
    db.stream(qs, stream => {
      stream.on('error', o.error);
      stream.on('data', ({ ballot }) => {
        o.next(JSON.parse(ballot));
      });
      stream.on('end', () => o.complete());
    });
  });
}
