import { onRequest as newsHandler } from './api/news.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') {
      return newsHandler({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
