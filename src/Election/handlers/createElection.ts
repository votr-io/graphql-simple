import { Context } from '../../context';
import { Election } from '../types';
import lodash = require('lodash');
import { ElectionCreated } from '../events';
import { WithoutId } from '../EventStore';
import { Handler, useHandler } from '../../lib/handler';
import { sendNewElectionEmail } from '../../Email/emailer';

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
  Promise<Election>
> = {
  validate,
  handleRequest: async ({ userStore, eventStore }, input) => {
    const { name, description, candidates } = input.electionForm;
    const { email } = input;

    //TODO: go through users service
    let [user] = await userStore.getUsersByEmail([email]);

    if (!user) {
      user = await userStore.createUser({ id: uuid(), email, type: 'WEAK' });
    }

    const id = uuid();
    const now = new Date().toISOString();
    const event: WithoutId<ElectionCreated> = {
      event_type: 'election_created',
      aggregate_type: 'election',
      aggregate_id: id,
      date_created: now,
      actor: user.id,
      data: {
        id,
        name,
        description,
        candidates: candidates.map(({ id, name, description }) => ({
          id: id ? id : uuid(),
          name,
          description: description ? description : '',
        })),
      },
    };

    await eventStore.create(event);

    const election = await eventStore.getElection(id);

    //does it make sense to send the email here? probably should be based off the event stream
    sendNewElectionEmail(email, election);

    return election;
  },
};

function validate(input: { electionForm: ElectionForm; email: string }) {
  const { name, description, candidates } = input.electionForm;
  const { email } = input;

  const errors: string[] = [];
  if (name === '') {
    errors.push('name is required');
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
