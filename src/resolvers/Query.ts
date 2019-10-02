import getUserId from '../utils/getUserId';

const Query = {
    users(parent: any, { query, first, skip, after, orderBy }: any, { prisma }: any, info: any): Promise<any> {
        const opArgs = {
            first,
            skip,
            after,
            orderBy,
            where: { name_contains: '' }
        };

        if (query) {
            opArgs.where = { name_contains: query };
        }

        return prisma.query.users(opArgs, info);
    },
    async me(parent: any, args: any, { prisma, ctxParams }: any, info: any): Promise<any> {
        const userId = getUserId(ctxParams);
        const userExists = await prisma.exists.User({ id: userId });
        if (!userExists) throw new Error('User not found');

        return await prisma.query.user({ where: { id: userId } }, info);
    }
};

export { Query as default };
