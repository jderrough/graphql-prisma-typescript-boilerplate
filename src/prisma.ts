import { Prisma } from 'prisma-binding';
import { fragmentReplacements } from './resolvers';

const prisma = new Prisma({
    fragmentReplacements,
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET
});

export { prisma as default };
