import { GraphQLServer, PubSub } from 'graphql-yoga';
import { ContextParameters, Context } from 'graphql-yoga/dist/types';
import { resolvers } from './resolvers';
import prisma from './prisma';

const pubsub = new PubSub();

const server = new GraphQLServer({
    resolvers,
    typeDefs: './src/schema.graphql',
    context(ctxParams: ContextParameters): Context {
        return {
            pubsub,
            prisma,
            ctxParams
        };
    }
});

export { server as default };
