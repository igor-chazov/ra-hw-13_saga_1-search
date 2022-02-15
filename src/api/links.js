const url = new URL(window.location.href);

if (url.hostname === 'localhost') {
  url.port = '7070';
}

if (url.hostname === 'igor-chazov.github.io') {
  url.hostname = 'ra-12-1-backend1.herokuapp.com';
  url.protocol = 'https';
}

const root = url;
root.pathname = '';

const links = {
  root: root.origin,
  search: new URL('api/search', url.href).href,
};

export default links;
