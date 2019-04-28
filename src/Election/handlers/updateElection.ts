import { Context } from '../../api/context';
import { Election, Candidate } from '../../types';
import { UserInputError } from 'apollo-server';
import { Handler, useHandler } from '../../lib/handler';
import { getElectionAndCheckPermissionsToUpdate, authenticate } from './common';
import uuid = require('uuid');
import { updateElection } from '../../stores/election';

interface CandidateForm {
  id?: string;
  name: string;
  description?: string;
}

const handler: Handler<
  Context,
  {
    id: string;
    name?: string;
    description?: string;
    candidates?: CandidateForm[];
  },
  Promise<Election>,
  {
    id: string;
    name?: string;
    description?: string;
    candidates?: Candidate[];
  }
> = {
  authenticate,
  defaults,
  validate,
  handleRequest: async (ctx, input) => {
    const { id, name, description, candidates } = input;
    const election = await getElectionAndCheckPermissionsToUpdate(ctx, id);

    if (election.status != 'PENDING') {
      throw new UserInputError('cannot change an election after it has begun');
    }

    if (name) {
      election.name = name;
    }

    if (description) {
      election.description = description;
    }

    if (candidates) {
      election.candidates = candidates;
    }

    election.dateUpdated = new Date().toISOString();
    return updateElection(election);
  },
};

function defaults(input: {
  id: string;
  name?: string;
  description?: string;
  candidates?: Candidate[];
}) {
  const { candidates } = input;
  if (candidates) {
    return {
      ...input,
      candidates: candidates.map(candidate => {
        if (!candidate.id) {
          return { ...candidate, id: uuid() };
        }
        return candidate;
      }),
    };
  }
  return input;
}

function validate(input: {
  id: string;
  name?: string;
  description?: string;
  candidates?: Candidate[];
}): string {
  const errors = [];
  const { id } = input;
  if (!id || id === '') {
    errors.push('id is required');
  }
  //TODO: validate the rest of the properties here (probably add defaults too)

  if (errors.length > 0) {
    return errors.join(', ');
  }
  return null;
}

export default useHandler(handler);
