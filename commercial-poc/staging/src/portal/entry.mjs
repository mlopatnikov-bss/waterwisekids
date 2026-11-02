// Cloudflare module entrypoint. Keep test/support exports in worker.mjs internal
// so workerd sees only the default ExportedHandler.
import { handlePortal } from './worker.mjs';

export default {
  fetch(request, env, ctx) { return handlePortal(request, env, ctx); },
};
