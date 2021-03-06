const Hapi = require("hapi");
const Inert = require("inert");
const { assert } = require("@brillout/assert");

module.exports = startServer;

async function startServer({
  __INTERNAL_wildcardServer_middleware,
  httpPort,
  staticDir,
}) {
  const server = Hapi.Server({
    port: httpPort,
    debug: { request: ["internal"] },
  });

  server.route({
    method: "POST",
    path: "/hey/after",
    handler: () => {
      return "Hello again";
    },
  });

  server.ext("onPreResponse", wildcardHandler);

  await server.register(Inert);
  server.route({
    method: "*",
    path: "/{param*}",
    handler: {
      directory: {
        path: staticDir,
      },
    },
  });

  server.route({
    method: "GET",
    path: "/hey-before",
    handler: () => {
      return "Hello darling";
    },
  });

  await server.start();

  return async () => {
    await server.stop();
  };

  async function wildcardHandler(request, h) {
    const requestProps = {
      url: request.url,
      method: request.method,
      body: request.payload,
    };
    const context = {
      headers: request.headers,
    };
    const responseProps = await __INTERNAL_wildcardServer_middleware.wildcardServer.getApiHttpResponse(
      requestProps,
      context
    );
    if (responseProps === null) {
      return h.continue;
    }
    {
      const { body, statusCode, contentType } = responseProps;
      assert(body);
      assert(statusCode);
      assert(contentType);
      const response = h.response(body);
      response.code(statusCode);
      response.type(contentType);
      return response;
    }
  }
}
