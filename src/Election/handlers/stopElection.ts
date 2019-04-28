import { Context } from '../../api/context';
import { Election } from '../../types';
import { Handler, useHandler } from '../../lib/handler';
import { getElectionAndCheckPermissionsToUpdate, authenticate } from './common';
import { UserInputError } from 'apollo-server';
import { updateElection } from '../../stores/election';
import { tallyElection } from '../tallyElection';

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

    if (election.status === 'CLOSED') {
      return election;
    }

    if (election.status !== 'OPEN') {
      //TODO: replace with your own typed error - apollo shouldn't be here
      throw new UserInputError(`can't stop an election that is ${election.status}`);
    }

    //the election has stopped
    const now = new Date().toISOString();
    election.status = 'CLOSED';
    election.dateUpdated = now;
    election.statusTransitions = [
      ...election.statusTransitions,
      { on: now, status: 'CLOSED' },
    ];

    await updateElection(election);

    //now that the election is stopped, we need to calculate results
    try {
      election.results = await tallyElection(election.id);
    } catch (e) {
      console.log(e);
    }

    //return the full election, now with results
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
