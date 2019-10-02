import * as jwt from 'jsonwebtoken';

const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, <string>process.env.JWT_SECRET, { expiresIn: '7 days' });
};

export { generateToken as default };
