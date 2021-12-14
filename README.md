# koa2-ssl

![NPM build](https://img.shields.io/npm/v/koa2-ssl.svg)
![Test](https://github.com/alepee/koa2-ssl/actions/workflows/npm-test.yml/badge.svg)
![CodeQL](https://github.com/alepee/koa2-ssl/actions/workflows/codeql-analysis.yml/badge.svg)

koa2-ssl enforces SSL for [Koa 2][koa] apps.

## Use

Simply require and use the function exported by this module:

```javascript
const ssl = require('koa2-ssl');
const app = require('koa')();

const handleDisallow = ctx => {
    ctx.status = 403;
    ctx.body = 'HTTPS access only.';
};

const opts = {
    disable: false,
    trustProxy: false,
    disallow: handleDisallow,
};

app.use(ssl(opts));
```

The function takes an optional object of options:

|Option|Type|Default value|Description|
|:-----|:---|:------------|:----------|
|disabled|`boolean`|`false`|If `true`, this middleware will allow all requests through.|
|trustProxy|`boolean`|`false`|If `true`, trust the `x-forwarded-proto` header. If it is "https", requests are allowed through.|
|disallow|`(ctx: Context) => any`|`undefined`|A function called with the Koa context so that the user can handle rejecting non-SSL requests themselves.|

By default, this middleware will only run when `process.env.NODE_ENV` is set to
"production". Unless a `disallow` function is supplied it will respond with the
status code 403 and the body "Please use HTTPS when communicating with this
server."

[koa]: https://github.com/koajs/koa

## Credits

This package is an update of [jclem](https://github.com/jclem)'s [koa-ssl](https://github.com/jclem/koa-ssl) for koa@^2.1
