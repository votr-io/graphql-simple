import { Handler, useHandler } from '../../lib/handler';
import { UserInputError } from 'apollo-server';
import { Context } from '../context';
import { getElection } from '../../stores/election';
import { createBallot } from '../../stores/ballot';

const handler: Handler<
  Context,
  {
    electionId: string;
    candidateIds: string[];
  },
  Promise<void>
> = {
  validate,
  handleRequest: async (ctx, { electionId, candidateIds }) => {
    const election = await getElection(electionId);

    if (election.status === 'PENDING') {
      throw new UserInputError(`can't vote in an election that hasn't started yet`);
    } else if (election.status !== 'OPEN') {
      throw new UserInputError(`can't vote in an election that is closed`);
    }

    const bogusCandidates = candidateIds.filter(
      id => !election.candidates.map(candidate => candidate.id).includes(id)
    );
    if (bogusCandidates.length !== 0) {
      throw new UserInputError(
        `the following candidates are not in this election: ${bogusCandidates.join(', ')}`
      );
    }

    await createBallot({
      electionId,
      candidateIds,
    });
  },
};

function validate(input: { electionId: string; candidateIds: string[] }): string {
  const errors = [];
  const { candidateIds } = input;
  if (candidateIds.length === 0) {
    errors.push(`why don't you try standing for something`);
  }
  if (errors.length > 0) {
    return errors.join(', ');
  }
  return null;
}

export default useHandler(handler);
