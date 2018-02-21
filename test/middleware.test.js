// @flow
import type { ForceHttpsOptions } from '../src/index';

const fetch = require('node-fetch');
const { createServer, app } = require('./test.helper');
const ssl = require('../src/index');

describe('SSL middleware', () => {
    let uri, server;

    afterEach(() => {
        process.env.NODE_ENV = 'test';
        app.middleware = [];
        server.close();
    });

    const setup = async (sslArgs: ?ForceHttpsOptions) => {
        app.use(ssl(sslArgs));
        app.use(ctx => {
            ctx.body = 'ok';
        });

        server = await createServer();
        const port = server.address().port;

        uri = `http://localhost:${server.address().port}`;
    };

    const get = (headers = {}): Promise<Response> =>
        fetch(uri, {
            headers: headers,
            method: 'GET',
        });

    describe('with no arguments', () => {
        describe('and NODE_ENV is not production', () => {
            it('does not redirect', async () => {
                await setup();
                const res = await get();
                expect(res.status).toEqual(200);
            });
        });

        describe('and NODE_ENV is production', () => {
            it('responds with a 403', async () => {
                process.env.NODE_ENV = 'production';
                await setup();
                const res = await get();
                expect(res.status).toEqual(403);
                expect(await res.text()).toEqual(
                    'Please use HTTPS when communicating with this server.'
                );
            });
        });
    });

    describe('when trustProxy is true', () => {
        describe('and x-forwarded-proto is http', () => {
            describe('and NODE_ENV is not production', () => {
                it('does not redirect', async () => {
                    await setup({ trustProxy: true });
                    const res = await get();
                    expect(res.status).toEqual(200);
                });
            });

            describe('and NODE_ENV is production', () => {
                it('responds with a 403', async () => {
                    process.env.NODE_ENV = 'production';
                    await setup({ trustProxy: true });
                    const res = await get();
                    expect(res.status).toEqual(403);
                    expect(await res.text()).toEqual(
                        'Please use HTTPS when communicating with this server.'
                    );
                });
            });
        });

        describe('and x-forwarded-proto is https', () => {
            describe('and NODE_ENV is not production', () => {
                it('does not redirect', async () => {
                    await setup({ trustProxy: true });
                    const res = await get({ 'x-forwarded-proto': 'https' });
                    expect(res.status).toEqual(200);
                });
            });

            describe('and NODE_ENV is production', () => {
                it('does not redirect', async () => {
                    process.env.NODE_ENV = 'production';
                    await setup({ trustProxy: true });
                    const res = await get({ 'x-forwarded-proto': 'https' });
                    expect(res.status).toEqual(200);
                });
            });
        });
    });

    describe('when disallow is set', () => {
        it('calls the disallow function', async () => {
            const mockCallback = jest.fn();

            await setup({ disallow: mockCallback, disabled: false });
            const res = await get();

            expect(res.status).toEqual(403);
            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });

    describe('when disabled is false', () => {
        it('responds with a 403', async () => {
            await setup({ disabled: false });
            const res = await get();

            expect(res.status).toEqual(403);
            expect(await res.text()).toEqual(
                'Please use HTTPS when communicating with this server.'
            );
        });
    });
});
