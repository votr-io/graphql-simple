import { getResults, ElectionResults } from 'alt-vote';
import { Results } from '../types';
import { streamBallots } from '../stores/ballot';

export async function tallyElection(electionId: string): Promise<Results> {
  const results = await getResults({
    fetchBallots: () => streamBallots(electionId),
  });

  return transformResults(results);
}

function transformResults({ winner, rounds }: ElectionResults): Results {
  return {
    winner,
    replay: rounds.map(round => {
      return {
        candidateTotals: Object.keys(round).map(candidateId => ({
          candidateId,
          votes: round[candidateId],
        })),
        redistribution: [], //TODO
      };
    }),
  };
}
