import { onRequest as newsHandler } from './api/news.js';
import { onRequest as rssHandler } from './api/rss.js';
import { onRequest as paymentConfirmHandler } from './api/payment-confirm.js';
import { onRequest as recallsHandler } from './api/recalls.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/news') {
      return newsHandler({ request, env });
    }
    if (url.pathname === '/api/recalls') {
      return recallsHandler({ request, env });
    }
    if (url.pathname === '/api/payment/confirm') {
      return paymentConfirmHandler({ request, env });
    }
    if (url.pathname === '/rss.xml') {
      return rssHandler({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
