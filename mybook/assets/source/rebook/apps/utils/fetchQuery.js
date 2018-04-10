import 'whatwg-fetch';
import Cookies from 'js-cookie';


const prepareFetchUrl = (url) => {
  const serverSideApiHost = SSR_API_HOST || API_HOST || BASE_HOST;
  const clientSideApiHost = API_HOST;
  const apiHost = __RENDER__ === 'server' ? serverSideApiHost : clientSideApiHost;
  return apiHost ? `https://${apiHost}${url}` : url;
};

const prepareCustomHeaders = (customHeaders) => {
  let headers = {};

  if (!customHeaders) {
    return headers;
  }

  const goodHeaderNames = [
    'user-agent', 'accept-encoding',
    'accept-language', 'cookie', 'cache-control', 'if-none-match', 'if-modified-since',
  ];
  // grab custom headers that do not clash with the fetchQuery's own headers
  Object.keys(customHeaders).forEach((name) => {
    const lowerName = name.toLowerCase();
    if (goodHeaderNames.indexOf(lowerName) >= 0) {
      headers[lowerName] = customHeaders[name];
    }
  });

  return headers;
};

const prepareFetchParams = (params) => {
  // CSRF_COOKIE_NAME is obtained from settings using the webpack DefinePlugin
  const apiVersion = params.apiVersion;
  const csrfCookieName = CSRF_COOKIE_NAME;
  const proxyApiHost = PROXY_API_HOST;

  const headers = prepareCustomHeaders(params.headers);
  delete params.headers;
  // add api version header
  const acceptHeaderValue = apiVersion
    ? `application/json; version=${apiVersion}`
    : 'application/json';

  let defaultHeaders = {
    'content-type': 'application/json; charset=UTF-8',
    'x-csrftoken': Cookies.get(csrfCookieName),
    accept: acceptHeaderValue,
  };
  // let the backend know we're from the prerender server
  if (__RENDER__ === 'server') {
    defaultHeaders['user-agent'] = `SSR/${PROJECT_GIT_VERSION_SHORT}`;
  }
  // provide an extra header name with the api host domain
  // this is required for proxying local request to test branches
  if (proxyApiHost) {
    defaultHeaders['x-proxy-api-host'] = proxyApiHost;
  }
  // json boilerplate wrapper
  if (params.json !== undefined) {
    params.body = JSON.stringify(params.json);
    delete params.json;
  }

  return {
    method: 'get',
    credentials: 'same-origin',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...params,
  };
};

function json(resp) {
  return new Promise((resolve, reject) => resp.text()
    .then(
      (text) => {
        try {
          const json = text ? JSON.parse(text) : {};
          resolve({
            status: resp.status,
            ok: resp.ok,
            json,
          });
        }
        catch (error) {
          Raven.captureException(error);
          reject(error);
        }
      }
    )
  );
}

export default function fetchQuery(url, params = {}) {
  const apiUrl = prepareFetchUrl(url);
  const fetchParams = prepareFetchParams(params);

  if (__RENDER__ === 'server') {
    // eslint-disable-next-line no-console
    console.log(`requesting ${apiUrl} with params ${JSON.stringify(fetchParams)}`);
  }

  return new Promise((resolve, reject) => {
    return fetch(apiUrl, fetchParams)
      .then(json)
      .then((resp) => {
        const result = {
          data: resp.json,
          resp,
        };
        if (resp.ok) {
          if (__RENDER__ === 'server') {
            // eslint-disable-next-line no-console
            console.log(`sucessfully requested ${apiUrl}; status ${resp.status}`);
          }
          return resolve(result);
        }
        else {
          if (__RENDER__ === 'server') {
            // eslint-disable-next-line no-console
            console.log(`failed to request ${apiUrl}; status ${resp.status}`);
          }
          return reject(result);
        }
      })
      .catch(
        (error) => {
          if (__RENDER__ === 'server') {
            // eslint-disable-next-line no-console
            console.log(`caught an error requesting ${apiUrl}; error: ${error}`);
          }
          Raven.captureException(error);
          reject({
            error,
            data: `${error}`,
            resp: {
              status: null,
            },
          });
        }
      );
  });
};
