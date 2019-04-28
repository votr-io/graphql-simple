export interface Election {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  dateCreated: string;
  dateUpdated: string;
  candidates: Candidate[];
  status: ElectionStatus;
  statusTransitions: { on: string; status: ElectionStatus }[];
  results?: Results;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
}

export interface Results {
  winner: string;
  replay: {
    candidateTotals: CandidateVotes[];
    redistribution: CandidateVotes[];
  }[];
}

export type ElectionStatus = 'PENDING' | 'OPEN' | 'CLOSED';

export interface CandidateVotes {
  candidateId: string;
  votes: number;
}

export interface User {
  id: string;
  email: string;
  type: UserType;
}

export type UserType = 'WEAK';
