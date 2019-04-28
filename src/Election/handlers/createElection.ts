import { Context } from '../../api/context';
import { Election, Candidate } from '../../types';
import lodash = require('lodash');
import { Handler, useHandler } from '../../lib/handler';
import { sendNewElectionEmail } from '../../Email/emailer';
import { getUsersByEmail, createUser } from '../../stores/user';
import { createElection } from '../../stores/election';

const uuid = require('uuid/v4');

interface ElectionForm {
  name: string;
  description?: string;
  candidates: CandidateForm[];
}

interface CandidateForm {
  id?: string;
  name: string;
  description?: string;
}

const createElectionHandler: Handler<
  Context,
  {
    electionForm: ElectionForm;
    email: string;
  },
  Promise<Election>,
  {
    name: string;
    description: string;
    candidates: Candidate[];
    email: string;
  }
> = {
  defaults,
  validate,
  handleRequest: async (ctx, input) => {
    const { name, description, candidates, email } = input;

    //get user, create if they don't exist yet
    let [user] = await getUsersByEmail([email]);
    if (!user) {
      user = await createUser({ id: uuid(), email, type: 'WEAK' });
    }

    //create the election
    const id = uuid();
    const now = new Date().toISOString();
    const election: Election = {
      id,
      dateCreated: now,
      dateUpdated: now,
      createdBy: user.id,
      name,
      description,
      candidates,
      status: 'PENDING',
      statusTransitions: [{ on: now, status: 'PENDING' }],
    };

    //save election to the store
    await createElection(election);

    //email out a link to the election so they can get back to the admin page
    sendNewElectionEmail(email, election);

    return election;
  },
};

function defaults(input: {
  electionForm: {
    name: string;
    description?: string;
    candidates: CandidateForm[];
  };
  email: string;
}) {
  const { description, candidates } = input.electionForm;

  return {
    ...input.electionForm,
    description: description ? description : '',
    candidates: candidates.map(({ id, name, description }) => ({
      id: id ? id : uuid(),
      name,
      description: description ? description : '',
    })),
    email: input.email,
  };
}

function validate(input: {
  name: string;
  description: string;
  candidates: Candidate[];
  email: string;
}) {
  const { name, description, candidates, email } = input;

  const errors: string[] = [];
  if (name === '') {
    errors.push('name is required');
  }
  if (name.length > 200) {
    errors.push('name cannot be longer than 200 characters');
  }

  if (description.length > 800) {
    errors.push('description cannot be longer than 800 characters');
  }

  if (email == null || email === '') {
    errors.push('email is required if you do not have an account');
  }
  if (candidates.length < 2) {
    errors.push('at least two candidates are required');
  }
  if (candidates.filter(({ name }) => name === '').length !== 0) {
    errors.push('candidate.name is required');
  }
  if (
    lodash(candidates)
      .filter(({ id }) => id != null)
      .uniqBy(({ id }) => id.toLowerCase())
      .value().length !=
    lodash(candidates)
      .filter(({ id }) => id != null)
      .value().length
  ) {
    errors.push('candidates cannot have duplicate ids');
  }
  if (
    lodash.uniqBy(candidates, ({ name }) => name.toLowerCase()).length !=
    candidates.length
  ) {
    errors.push('candidates cannot have duplicate names');
  }
  if (errors.length > 0) {
    return errors.join(', ');
  }
  return null;
}

export default useHandler(createElectionHandler);
