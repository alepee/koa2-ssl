// @flow
import type { Middleware, Context } from 'koa';

export type ForceHttpsOptions = {
    disabled?: boolean,
    trustProxy?: boolean,
    disallow?: (ctx: Context) => any,
};

const createForceHttps = (opts: ?ForceHttpsOptions = {}): Middleware => {
    const DEFAULT_OPTIONS: ForceHttpsOptions = {
        disabled: process.env.NODE_ENV !== 'production',
        trustProxy: false,
    };

    return (ctx: Context, next: () => Promise<void>): Promise<void> | void => {
        const options = Object.assign({}, DEFAULT_OPTIONS, opts);

        if (options.disabled === true) {
            return next();
        }

        const secured = ctx.request.secure;
        const trusted =
            options.trustProxy && ctx.get('x-forwarded-proto') === 'https';

        if (secured || trusted) {
            return next();
        }

        if (typeof options.disallow === 'function') {
            ctx.status = 403;
            options.disallow(ctx);
            return next();
        }

        ctx.status = 403;
        ctx.type = 'text/plain';
        ctx.body = 'Please use HTTPS when communicating with this server.';
    };
};

module.exports = createForceHttps;
