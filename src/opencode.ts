import plugin from './index';

// Dedicated opencode runtime entrypoint.
//
// opencode attempts to load callable exports from a plugin module. The package
// root also exposes public API helpers (createPlugin, WikiManager), so the
// runtime entrypoint must export only the plugin default to avoid opencode
// treating public API classes/functions as additional plugins.
export default plugin;
