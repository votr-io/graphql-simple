import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import * as cors from 'cors';
import { ENV } from './env';
import { typeDefs } from './api/typeDefs';
import { resolvers } from './api/resolvers';

import { context } from './api/context';

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
