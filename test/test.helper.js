// @flow

import type Application from 'koa';
import type { Server } from 'http';

process.env.NODE_ENV = 'test';
process.env.SILENCE_LOGS = 'true';

let http = require('http');
let Koa = require('koa');
let app = new Koa();

const listen = (server: Server) =>
    new Promise((resolve, reject) => {
        server.listen((err: mixed) => (err ? reject(err) : resolve(server)));
    });

const createServer = (): Promise<Server> => {
    const server = http.createServer(app.callback());
    return listen(server);
};

module.exports = {
    app,
    createServer,
};
