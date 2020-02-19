const createForceHttps = (opts = {}) => {
  const DEFAULT_OPTIONS = {
    disabled: process.env.NODE_ENV !== 'production',
    trustProxy: false
  };
  return (ctx, next) => {
    const options = Object.assign({}, DEFAULT_OPTIONS, opts);

    if (options.disabled === true) {
      return next();
    }

    const secured = ctx.request.secure;
    const trusted = options.trustProxy && ctx.get('x-forwarded-proto') === 'https';

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