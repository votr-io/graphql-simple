import { makePublicElection } from './createElection.test';

test(`results`, async () => {
  const { election, service } = await makePublicElection();
  const { id } = election;
  const candidateIds = election.candidates.map(({ id }) => id);

  await service.StartElection({ id });
  for (let i = 0; i < 10; i++) {
    await service.CastBallot({ electionId: id, candidateIds });
  }
  await service.StopElection({ id });
  const electionWithResults = await service.GetElections({ ids: [id] });
  expect(electionWithResults.data.getElections.elections[0].results.winner.id).toBe(
    candidateIds[0]
  );
});
