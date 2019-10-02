import 'core-js/stable';
import 'regenerator-runtime/runtime';
import server from './server';

server.start({
    port: process.env.PORT || 4000
}, () => console.log(`Server is running at http://localhost:${process.env.PORT || 4000}`));
