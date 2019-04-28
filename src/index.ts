import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import * as cors from 'cors';
import { ENV } from './env';
import { typeDefs } from './api/typeDefs';
import { resolvers } from './api/resolvers';

import { context } from './context';
import { project } from './Election/ReadModel';
import { postgresEventStore } from './Election/EventStore';

//@ts-ignore
import * as lodash from 'lodash';

console.log('hi');

const someObject = {
  test: '123',
};
console.log(someObject.hasOwnProperty('test'));

const otherObject = Object.create(someObject);
const betterObject = lodash.assign({}, otherObject);
console.log(betterObject.hasOwnProperty());

//project into the in memory read model as soon as we start up
project(postgresEventStore.stream());

const app = express();
app.use(cors());

app.use('/healthy', (req, res) => {
  res.send({ healthy: true });
});

export const server = new ApolloServer({
  typeDefs,
  //@ts-ignore = the types in generated code don't align exactly with apollo server types
  resolvers,
  context,
  introspection: true,
  playground: true,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: ENV.PORT }, () => {
  console.log(`Apollo Server listening at :${ENV.PORT}...`);
});
