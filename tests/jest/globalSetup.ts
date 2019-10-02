require('@babel/register');
const server = require('../../src/server').default;

module.exports = async (): Promise<void> => {
    const httpServer = await server.start({
        port: process.env.PORT || 4000
    }, () => console.log(`Server is running at http://localhost:${process.env.PORT || 4000}`));

    Object.assign(global, { httpServer });
};
