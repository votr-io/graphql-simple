import { updateElection } from './../../stores/election';
import { Context } from '../../api/context';
import { Election } from '../../types';
import { Handler, useHandler } from '../../lib/handler';
import { getElectionAndCheckPermissionsToUpdate, authenticate } from './common';
import { UserInputError } from 'apollo-server';

const handler: Handler<
  Context,
  {
    id: string;
  },
  Promise<Election>
> = {
  authenticate,
  validate,
  handleRequest: async (ctx, { id }) => {
    const election = await getElectionAndCheckPermissionsToUpdate(ctx, id);

    if (election.status === 'OPEN') {
      return election;
    }

    if (election.status !== 'PENDING') {
      //TODO: replace with your own typed error - apollo shouldn't be here
      throw new UserInputError(`can't start an election that is ${election.status}`);
    }

    const now = new Date().toISOString();
    election.status = 'OPEN';
    election.dateUpdated = now;
    election.statusTransitions = [
      ...election.statusTransitions,
      { on: now, status: 'OPEN' },
    ];

    return updateElection(election);
  },
};

function validate(input: { id: string }): string {
  const errors = [];
  const { id } = input;
  if (!id || id === '') {
    errors.push('id is required');
  }

  if (errors.length > 0) {
    return errors.join(', ');
  }
  return null;
}

export default useHandler(handler);
