// Polyfill for process in browser environment
if (typeof globalThis !== "undefined" && !globalThis.process) {
  (globalThis as any).process = {
    env: {},
    version: "",
    versions: {},
    platform: "browser",
    arch: "browser",
  };
}

export {};
