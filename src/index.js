import { onRequest as newsHandler } from './api/news.js';
import { onRequest as rssHandler } from './api/rss.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') {
      return newsHandler({ request, env });
    }
    if (url.pathname === '/rss.xml') {
      return rssHandler({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
