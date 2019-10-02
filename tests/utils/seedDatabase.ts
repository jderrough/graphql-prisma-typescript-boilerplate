import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../../src/prisma';

const userOne: { input: any, unhashedPassword: string, user?: any, jwt?: string } = {
    input: {
        name: 'Test 1',
        email: 'test1@example.com',
        password: bcrypt.hashSync('thisisatest1')
    },
    unhashedPassword: 'thisisatest1'
};

const userTwo: { input: any, user?: any, jwt?: string } = {
    input: {
        name: 'Test 2',
        email: 'test2@example.com',
        password: bcrypt.hashSync('thisisatest2')
    }
};

const seedDatabase = async (): Promise<void> => {
    // Delete test database
    await prisma.mutation.deleteManyUsers();

    // Create user one
    userOne.user = await prisma.mutation.createUser({ data: userOne.input });
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, <string>process.env.JWT_SECRET);

    // Create user two
    userTwo.user = await prisma.mutation.createUser({ data: userTwo.input });
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, <string>process.env.JWT_SECRET);
};

export { seedDatabase as default, userOne, userTwo };
