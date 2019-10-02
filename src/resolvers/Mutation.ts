import * as bcrypt from 'bcryptjs';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import hashPassword from '../utils/hashPassword';

const Mutation = {
    async createUser(parent: any, { data }: any, { prisma }: any, info: any): Promise<any> {
        const emailTaken = await prisma.exists.User({ email: data.email });
        if (emailTaken) throw new Error('Email taken');

        const password = await hashPassword(data.password);

        const user = await prisma.mutation.createUser({
            data: {
                ...data,
                password

            }
        }, info.user);

        return {
            user,
            token: generateToken(user.id)
        };
    },
    async login(parent: any, { data }: any, { prisma }: any, info: any): Promise<any> {
        const { email, password }: { email: string, password: string } = data;
        const user = await prisma.query.user({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) throw new Error('Invalid credentials');

        return {
            user,
            token: generateToken(user.id)
        };
    },
    async updateUser(parent: any, { data }: any, { prisma, ctxParams }: any, info: any): Promise<any> {
        const userId = getUserId(ctxParams);
        const userExists = await prisma.exists.User({ id: userId });
        if (!userExists) throw new Error('User not found');

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        return prisma.mutation.updateUser({ data, where: { id: userId } }, info);
    },
    async deleteUser(parent: any, args: any, { prisma, ctxParams }: any, info: any): Promise<any> {
        const userId = getUserId(ctxParams);
        const userExists = await prisma.exists.User({ id: userId });
        if (!userExists) throw new Error('User not found');

        return prisma.mutation.deleteUser({ where: { id: userId } }, info);
    },
};

export { Mutation as default };
