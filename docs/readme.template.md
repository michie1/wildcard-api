!MENU_ORDER 1
!MENU_LINK /../../
!OUTPUT ../readme.md
!INLINE ./header.md --hide-source-path

<br/>

 - [What is Wildcard](#what-is-wildcard)
 - [Wildcard VS GraphQL/REST](#wildcard-vs-graphqlrest)
 - Usage
   - [Getting Started](#getting-started)
   - [Authentication](#authentication)
   - [Permissions](#permissions)
   - [Error Handling](#error-handling)
   - [SSR](#ssr)
 - [More Resources](#more-resources)

<br/>

### What is Wildcard

Wildcard is a JavaScript library to create an **API** between your **Node.js** server and the **browser**.

With Wildcard,
creating an API is as easy as creating a JavaScript function:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');

// We define a `hello` function on the server
endpoints.hello = function(name) {
  return {message: 'Welcome '+name};
};
~~~

~~~js
// Browser

import {endpoints} from 'wildcard-api/client';

(async () => {
  // Wildcard makes our `hello` function available in the browser
  const {message} = await endpoints.hello('Alice');
  console.log(message); // Prints `Welcome Alice`
})();
~~~

That's all Wildcard does:
it makes functions,
that are defined on the server,
"callable" in the browser.
Nothing more, nothing less.

How you retrieve/mutate data is up to you;
you can use any SQL/NoSQL/ORM query:

~~~js
// Node.js server

const endpoints = require('wildcard-api');
const getLoggedUser = require('./path/to/your/auth/code');
const Todo = require('./path/to/your/data/model/Todo');

endpoints.createTodoItem = async function(text) {
  const user = await getLoggedUser(this.headers); // We explain `this.headers` later

  // Abort if the user is not logged in
  if( !user ) return;

  // With ORM/ODM:
  const newTodo = new Todo({text, authorId: user.id});
  await newTodo.save();
  /* Or with SQL:
  const db = require('your-favorite-sql-query-builder');
  const [newTodo] = await db.query(
    "INSERT INTO todos VALUES (:text, :authorId);",
    {text, authorId: user.id}
  ); */

  return newTodo;
};
~~~

!INLINE ./snippets/section-footer.md #readme --hide-source-path



### Wildcard VS GraphQL/REST

If all you need is to retrieve/mutate data from within your frontend code,
then Wildcard offers a very easy way.
All you have to do is to create JavaScript functions
and all you need to know is written in this little Readme.

If third parties need to be able to retrieve/mutate your data
then REST and GraphQL are better suited.
A RESTful/GraphQL API has a schema and a rigid structure which is a good thing for third parties who need a stable and long-term contract with your API.

For quickly evolving applications,
the rigid structure of a RESTful/GraphQL API gets in a way and is a handicap.
Wildcard
is schemaless and structureless
which is a wonderful fit for rapid development, prototyping, and MVPs.

!INLINE ./snippets/section-footer.md #readme --hide-source-path



### Getting Started

1. Add Wildcard to your Node.js server.

   With Express:
   ~~~js
   const express = require('express');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const app = express();

   app.all('/wildcard/*' , async (req, res) => {
     const {body, statusCode, contentType} = await getApiResponse(req);
     res.status(statusCode);
     res.type(contentType);
     res.send(body);
   });
   ~~~

   <details>
   <summary>
   With Hapi
   </summary>

   ~~~js
   const Hapi = require('hapi');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const server = Hapi.Server();

   server.route({
     method: '*',
     path: '/wildcard/{param*}',
     handler: async (request, h) => {
       const {body, statusCode, contentType} = await getApiResponse(request.raw.req);
       const resp = h.response(body);
       resp.code(statusCode);
       resp.type(contentType);
       return resp;
     }
   });
   ~~~
   </details>

   <details>
   <summary>
   With Koa
   </summary>

   ~~~js
   const Koa = require('koa');
   const Router = require('koa-router');
   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api

   const app = new Koa();

   const router = new Router();

   router.all('/wildcard/*', async ctx => {
     const {body, statusCode, contentType} = await getApiResponse(ctx);
     ctx.status = apiResponse.statusCode;
     ctx.type = contentType;
     ctx.body = apiResponse.body;
   });

   app.use(router.routes());
   ~~~
   </details>

   <details>
   <summary>
   With other server frameworks
   </summary>

   Wildcard can be used with any server framework.
   All you have to do is to reply all HTTP requests made to `/wildcard/*`
   with the HTTP body, the HTTP status code, and the content type returned by `getApiResponse`:
   ~~~js
   // This is a generic pseudo code for how to integrate Wildcard with any server framework.

   const {getApiResponse} = require('wildcard-api'); // npm install wildcard-api
   const {addRouteHandler, HttpResponse} = require('your-favorite-server-framework');

   // Add a new route `/wildcard/*` to your server
   addRouteHandler(
     '/wildcard/*',
     async ({req}) => {
       // We assume your server framework to provide a request object with all the information we need.

       // We get the HTTP request method (`GET`, `POST`, etc.).
       const {method} = req;
       // We get the HTTP request pathname (e.g. `/wildcard/myEndpoint/["some",{"arg":"val"}]`).
       const {url} = req;
       // We get the HTTP headers.
       const {header} = req;

       // We get the HTTP response body, HTTP status code, and the content type of the HTTP response body.
       const {body, statusCode, contentType} = await getApiResponse({method, url, headers});

       // We assume your server framework to provide a way to create an HTTP response
       // upon `body`, `statusCode`, and `contentType`.
       const response = new HttpResponse({body, statusCode, contentType});

       return response;
     }
   );
   ~~~
   </details>

2. Define functions
   in Node.js.

   ~~~js
   // Node.js

   const {endpoints} = require('wildcard-api');
   const getLoggedUser = require('./path/to/your/auth/code');
   const getData = require('./path/to/your/data/retrieval/code');

   endpoints.myFirstEndpoint = async function () {
     // `this` is the object you pass to `getApiResponse`.
     // In the Express code above we passed `req`. Thus we can
     // access `req.headers.cookie` over `this.headers.cookie`.
     const user = await getLoggedUser(this.headers.cookie);
     const data = await getData(user);
     return data;
   };
   ~~~

3. You can now "call" your enpdoint functions in the browser.

   ~~~js
   // Browser

   import {endpoints} from 'wildcard-api/client'; // npm install wildcard-api

   (async () => {
     const data = await endpoints.myFirstEndpoint();
   })();
   ~~~

!INLINE ./snippets/section-footer.md #readme --hide-source-path




### Authentication

To do authentication you need the HTTP headers such as the `Authorization: Bearer AbCdEf123456` Header or a cookie holding the user's session ID.

For that you pass the request object `req` to `getApiResponse(req)`:
This request object `req` is provided by your server framework (express/koa/hapi)
and holds information about the HTTP request such as the HTTP headers.

For example with Express:

 ~~~js
 app.all('/wildcard/*' , async (req, res) => {
   // We pass `req` to getApiResponse
   const {body, statusCode, contentType} = await getApiResponse(req);
   res.status(statusCode);
   res.type(contentType);
   res.send(body);
 });
~~~

Wildcard then makes `req` available to your endpoint function as `this`.

For example:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');
const getUserFromSessionCookie = require('./path/to/your/session/logic');

endpoints.getLoggedUserInfo = async function() {
  // Since `this===req`, `req.headers` is available as `this.headers`
  const user = await getUserFromSessionCookie(this.headers.cookie);
  return user;
};
~~~

In general, any object `anObject` you pass to `getApiResponse(anObject)`
is made available to your endpoint functions as `this`.
(I.e. `this===anObject`.)
That way,
you can make whatever you want available to your endpoint functions.

!INLINE ./snippets/section-footer.md #readme --hide-source-path




### Permissions

Permissions are defined by code. For example:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');
const getLoggedUser = require('./path/to/your/auth/code');
const db = require('./path/to/your/db/handler');

endpoints.updateTodoText = async function(todoId, newText) {
  if( !user ) {
    // Not logged in user are not authorized to change a to-do item.
    // We abort.
    return;
  }

  const todo = await db.getTodo(todoId);

  if( !todo ) {
    // `todoId` didn't match any todo.
    // We abort.
  }

  if( todo.authorId !== user.id ) {
    // Only the author of the to-do item is allowed to modify it.
    // We abort.
    return;
  }

  // The user is authorized.
  // We commit the new to-do text.
  await db.updateTodoText(todoId, newText);
};
~~~

See the [to-do list app example](/example/) for further permission examples.

!INLINE ./snippets/section-footer.md #readme --hide-source-path





### Error Handling

Calling an endpoint throws an error when:
 - The browser cannot connect to the server. (The user is offline or your server is down.)
 - The endpoint function throws an uncaught error.

If you use a library that is expected to throws errors, then catch them:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');
const validatePhoneNumber = require('some-phone-number-validatation-library');

endpoints.createAccount = async function({email, phoneNumber}) {
  // `validatePhoneNumber` throws an error if `phoneNumber` is not a phone number.
  let err;
  try {
    validatePhoneNumber(phoneNumber);
  } catch(err_) {
    err = err_
  }
  if( err ) {
    return {validationError: {phoneNumber: "Please enter a valid phone number."}};
  }

  /* ... */
};
~~~

You should always catch expected errors: Wildcard regards any uncaught error as a bug in your code.

In particular, don't throw an error upon validation failure:

~~~js
// Node.js server

const {endpoints} = require('wildcard-api');
const isStrongPassword = require('./path/to/isStrongPassword');

endpoints.createAccount = async function({email, password}) {
  /* Don't do this:
  if( !isStrongPassword(password) ){
    throw new Error("Password is too weak.");
  }
  */

  // Instead, return a JavaScript value, e.g. a JavaScript object:
  if( !isStrongPassword(password) ){
    return {validationError: "Password is too weak."};
  }

  /* ... */
};
~~~

You can use `isServerError` and `isNetworkError` to handle errors more precisely:

~~~js
// Browser

import {endpoints} from 'wildcard-api/client';

async function() {
  let data;
  let err;
  try {
    data = await endpoints.getData();
  } catch(err_) {
    err = err_;
  }

  if( err.isServerError ){
    // Your endpoint function throwed an uncaught error: there is a bug in your server code.
    alert(
      'Something went wrong on our side. We have been notified and we are working on a fix.' +
      'Sorry... Please try again later.'
    );
  }
  if( err.isNetworkError ){
    // The browser couldn't connect to the server.
    // The user is offline or your server is down.
    alert("We couldn't perform your request. Please try again.");
  }

  if( err ) {
    return {success: false};
  } else {
    return {success: true, data};
  }
}
~~~

You can also use [Handli](https://github.com/brillout/handli) which will automatically handle errors for you:

~~~js
// Browser

import 'handli'; // npm install handli
// That's it: Handli automatically installs itslef.
// Errors are now handled by Handli.
~~~

!INLINE ./snippets/section-footer.md #readme --hide-source-path





### SSR

The Wildcard client is isomorphic (aka universal) and works in both the browser and Node.js.

If you don't need Authentication, then SSR works out of the box.

If you need Authentication, then read [SSR & Authentication](/docs/ssr-auth.md#readme).

!INLINE ./snippets/section-footer.md #readme --hide-source-path





### More Resources

This section collects further information about Wildcard.

 - [SSR & Authentication](/docs/ssr-auth.md#readme)
   <br/>
   How to use Wildcard with SSR and Authentication.

 - [How it work](/docs/how-it-work.md#readme)
   <br/>
   Explains how Wildcard works.

 - [Conceptual FAQ](/docs/conceptual-faq.md#readme)
   <br/>
   High level discussion about Wildcard, RPC-like APIs, GraphQL, and REST.

 - [To-do List Example](/example#readme)
   <br/>
   An example of a to-do list app implemented with Wildcard.

 - [Custom VS Generic](/docs/custom-vs-generic.md#readme)
   <br/>
   Goes into depth of whether you should implement a generic API (REST/GraphQL) or a custom API (Wildcard).
   (Or both.)
   In general, the rule of thumb for deciding which one to use is simple:
   if third parties need to access your data,
   then implement a generic API,
   otherwise implement a custom API.
   But in some cases it's not that easy and this document goes into more depth.

!INLINE ./snippets/section-footer.md #readme --hide-source-path


