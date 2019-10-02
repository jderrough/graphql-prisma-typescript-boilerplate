import getUserId from '../utils/getUserId';

const User = {
    email: {
        fragment: 'fragment userId on User { id }',
        resolve(parent: { id: string | null; email: string | null; }, args: any, { ctxParams }: any, info: any): string | null {
            const userId = getUserId(ctxParams, false);

            if (parent.id === userId) return parent.email;

            return null;
        }
    }
};

export { User as default };
