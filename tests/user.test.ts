import 'cross-fetch/polyfill';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import * as jwt from 'jsonwebtoken';
import prisma from '../src/prisma';
import seedDatabase, { userOne, userTwo } from './utils/seedDatabase';
import getClient from './utils/getClient';
import { createUser, getUsers, login, getProfile } from './utils/operations';

const client: ApolloClient<NormalizedCacheObject> = getClient();

beforeEach(seedDatabase);

// FIXME: https://github.com/facebook/jest/issues/6937
afterAll(() => new Promise((r: TimerHandler): number => setTimeout(r, 0)));

test('Should create a new user', async () => {
    const variables: any = {
        data: {
            name: 'Jonathan',
            email: 'jonathan@example.com',
            password: 'thisisasecret'
        }
    };

    const response = await client.mutate({
        variables,
        mutation: createUser
    });
    const exists = await prisma.exists.User({ id: response.data.createUser.user.id });

    expect(exists).toBe(true);
});

test('Should not create a user with email that is already in use', async () => {
    const variables = {
        data: {
            name: 'Jonathan',
            email: userOne.input.email,
            password: 'thisisasecret'
        }
    };

    await expect(client.mutate({
        variables,
        mutation: createUser
    })).rejects.toThrow();
});

test('Should expose public author profiles', async () => {
    const response = await client.query({ query: getUsers });

    expect(response.data.users.length).toBe(2);
    expect(response.data.users[0].email).toBeNull();
    expect(response.data.users[0].name).toBe(userOne.input.name);
    expect(response.data.users[1].email).toBeNull();
    expect(response.data.users[1].name).toBe(userTwo.input.name);
});

test('Should login and provide authentication token', async () => {
    const variables = {
        data: {
            email: userOne.input.email,
            password: userOne.unhashedPassword
        }
    };

    const { data }: any = await client.mutate({
        variables,
        mutation: login
    });

    expect(userOne.user).not.toBeUndefined();
    if (userOne.user) {
        const payload: any = jwt.verify(data.login.token, <string>process.env.JWT_SECRET);

        expect(payload.userId).toBe(userOne.user.id);
    }
});

test('Should not login with bad credentials', async () => {
    const variables = {
        data: {
            email: 'toto@alapla.ge',
            password: 'avecsonpwd'
        }
    };

    await expect(
        client.mutate({
            variables,
            mutation: login
        })
    ).rejects.toThrow();
});

test('Should not create user with bad credentials', async () => {
    const variables = {
        data: {
            name: 'Toto',
            email: 'toto@alapla.ge',
            password: ''
        }
    };

    await expect(
        client.mutate({
            variables,
            mutation: createUser
        })
    ).rejects.toThrow();
});

test('Should fetch user profile', async () => {
    const client = getClient(userOne.jwt);
    const { data }: any = await client.query({ query: getProfile });

    expect(userOne.user).not.toBeUndefined();
    if (userOne.user) {
        expect(data.me.id).toBe(userOne.user.id);
        expect(data.me.name).toBe(userOne.user.name);
        expect(data.me.email).toBe(userOne.user.email);
    }
});

test('Should reject me query without authentication', async () => {
    await expect(client.query({ query: getProfile })).rejects.toThrow();
});
