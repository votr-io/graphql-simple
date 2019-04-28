CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_type AS ENUM ('WEAK');

CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL,
    email VARCHAR (256) UNIQUE NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT(now() at time zone 'utc'),
    type user_type NOT NULL
);

CREATE TYPE election_status AS ENUM ('PENDING', 'OPEN', 'CLOSED');

CREATE TABLE elections (
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR (200) NOT NULL,
    description VARCHAR (800) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT(now() at time zone 'utc'),
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT(now() at time zone 'utc'),
    candidates jsonb NOT NULL,
    status election_status NOT NULL,
    status_transitions jsonb NOT NULL,
    results jsonb
);

CREATE TABLE ballots (
    election_id UUID NOT NULL REFERENCES elections(id),
    ballot VARCHAR (800) NOT NULL
);