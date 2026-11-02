// Cloudflare module entrypoint. Keep test/support exports in worker.mjs internal
// so workerd sees only the default ExportedHandler.
import { handleCollector } from './worker.mjs';

export default {
  fetch(request, env, ctx) { return handleCollector(request, env, ctx); },
};
