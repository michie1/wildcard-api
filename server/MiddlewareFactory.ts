import { autoLoadEndpointFiles } from "./autoLoadEndpointFiles";
import { wildcardServer as wildcardServer_ } from "./global-instance";
import {
  Context,
  HttpRequestProps,
  HttpResponseProps,
  UniversalAdapterName,
  WildcardServer,
} from "./WildcardServer";

export { MiddlewareFactory };

type ServerFrameworkRequestObject = unknown & {
  _brand: "ServerFrameworkRequestObject";
};
type ServerAdapterOptions = any & { _brand: "ServerAdapterOptions" };

type RequestHandlerArg0 = ServerFrameworkRequestObject;
type RequestHandlerArg1 = { requestProps: HttpRequestProps };
type RequestHandlerReturn = Promise<HttpResponseProps | null>;
type RequestHandler = (
  arg0: RequestHandlerArg0,
  arg1: RequestHandlerArg1
) => RequestHandlerReturn;

type SetContext = (arg0: ServerFrameworkRequestObject) => Promise<Context>;

type ServerAdapter<ServerMiddleware> = (
  arg0: RequestHandler[],
  arg1: ServerAdapterOptions
) => ServerMiddleware;

type WildcardServerHolder = {
  wildcardServer: WildcardServer;
};
type WildcardServerOption = {
  __INTERNAL_wildcardServer_middleware?: WildcardServerHolder;
};

function createMiddleware<ServerMiddleware>(
  serverAdapter: ServerAdapter<ServerMiddleware>,
  __INTERNAL_wildcardServer_middleware: WildcardServerHolder | undefined,
  adapterOptions: ServerAdapterOptions,
  setContext: SetContext,
  __INTERNAL_universalAdapter: UniversalAdapterName
): ServerMiddleware {
  const middleware = serverAdapter([requestHandler], adapterOptions);

  return middleware;

  async function requestHandler(
    requestObject: RequestHandlerArg0,
    { requestProps }: RequestHandlerArg1
  ): RequestHandlerReturn {
    const wildcardServer = __INTERNAL_wildcardServer_middleware
      ? __INTERNAL_wildcardServer_middleware.wildcardServer
      : wildcardServer_;

    if (
      !__INTERNAL_wildcardServer_middleware &&
      Object.keys(wildcardServer.endpoints).length === 0
    ) {
      autoLoadEndpointFiles();
    }

    const responseProps = await wildcardServer.getApiHttpResponse(
      requestProps,
      getContext,
      { __INTERNAL_universalAdapter }
    );

    return responseProps;

    async function getContext(): Promise<Context | undefined> {
      let context: Context | undefined;
      if (setContext) {
        context = await setContext(requestObject);
      }
      return context;
    }
  }
}

function MiddlewareFactory<ServerMiddleware>(
  serverAdapter: ServerAdapter<ServerMiddleware>,
  __INTERNAL_universalAdapter: UniversalAdapterName,
  adapterOptions?: ServerAdapterOptions
): (arg0: SetContext) => ServerMiddleware {
  return wildcard;
  function wildcard(
    setContext: SetContext,
    { __INTERNAL_wildcardServer_middleware }: WildcardServerOption = {}
  ): ServerMiddleware {
    const middleware = createMiddleware<ServerMiddleware>(
      serverAdapter,
      __INTERNAL_wildcardServer_middleware,
      adapterOptions,
      setContext,
      __INTERNAL_universalAdapter
    );
    return middleware;
  }
}