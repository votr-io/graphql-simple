import { makePublicElection } from './createElection.test';

test(`results - simple one round`, async () => {
  const { election, service } = await makePublicElection();
  const { id } = election;
  const candidateIds = election.candidates.map(({ id }) => id);

  await service.StartElection({ id });
  const pendingCalls: Promise<any>[] = [];
  const ballotNumber = 100;
  for (let i = 0; i < ballotNumber; i++) {
    pendingCalls.push(service.CastBallot({ electionId: id, candidateIds }));
  }
  await Promise.all(pendingCalls);

  await service.StopElection({ id });
  const electionWithResults = await service.GetElections({ ids: [id] });
  const results = electionWithResults.data.getElections.elections[0].results;
  expect(results.winner.id).toBe(candidateIds[0]);
  expect(results.replay.length).toBe(1);
  expect(results.replay[0].candidateTotals[0].candidate.id).toBe(candidateIds[0]);
  expect(results.replay[0].candidateTotals[0].votes).toBe(ballotNumber);
});
