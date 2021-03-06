/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ElectionStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetElections
// ====================================================

export interface GetElections_getElections_elections_candidates {
  __typename: "Candidate";
  id: string;
  name: string;
  description: string | null;
}

export interface GetElections_getElections_elections_statusTransitions {
  __typename: "ElectionStatusTransition";
  on: string;
  status: ElectionStatus;
}

export interface GetElections_getElections_elections_results_winner {
  __typename: "Candidate";
  id: string;
  name: string;
}

export interface GetElections_getElections_elections_results_replay_candidateTotals_candidate {
  __typename: "Candidate";
  id: string;
}

export interface GetElections_getElections_elections_results_replay_candidateTotals {
  __typename: "CandidateVotes";
  candidate: GetElections_getElections_elections_results_replay_candidateTotals_candidate | null;
  votes: number;
}

export interface GetElections_getElections_elections_results_replay {
  __typename: "Round";
  candidateTotals: GetElections_getElections_elections_results_replay_candidateTotals[];
}

export interface GetElections_getElections_elections_results {
  __typename: "Results";
  winner: GetElections_getElections_elections_results_winner;
  replay: GetElections_getElections_elections_results_replay[];
}

export interface GetElections_getElections_elections {
  __typename: "Election";
  id: string;
  name: string;
  description: string;
  candidates: GetElections_getElections_elections_candidates[];
  status: ElectionStatus;
  statusTransitions: GetElections_getElections_elections_statusTransitions[];
  results: GetElections_getElections_elections_results | null;
}

export interface GetElections_getElections {
  __typename: "GetElectionsResponse";
  elections: GetElections_getElections_elections[];
}

export interface GetElections {
  getElections: GetElections_getElections;
}

export interface GetElectionsVariables {
  ids: string[];
}
