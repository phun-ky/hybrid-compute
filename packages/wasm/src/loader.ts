// instantiate-wasm.ts
import type { WasmSource } from './types.js';

export const instantiateWasm = async (
  source: WasmSource,
  imports: WebAssembly.Imports = {}
): Promise<WebAssembly.Instance> => {
  // 1) Already-compiled module
  if (source instanceof WebAssembly.Module) {
    return new WebAssembly.Instance(source, imports);
  }

  // 2) URL/string -> try streaming, then buffer path
  if (typeof source === 'string' || source instanceof URL) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        const res = await fetch(String(source));

        // Works when server serves application/wasm
        return (await WebAssembly.instantiateStreaming(res, imports)).instance;
      } catch {
        // fall through to buffered path
      }
    }

    const res = await fetch(String(source));
    const bytes = await res.arrayBuffer();

    return instantiateFromBytes(bytes, imports);
  }

  // 3) Raw bytes (ArrayBuffer or any ArrayBufferView)
  return instantiateFromBytes(source, imports);
};

// Helper: compile → instance (sidesteps overload ambiguity)
async function instantiateFromBytes(
  bytes: ArrayBuffer | ArrayBufferView,
  imports: WebAssembly.Imports
): Promise<WebAssembly.Instance> {
  // Always pass a *view* to preserve byteOffset/byteLength
  const view: ArrayBufferView = ArrayBuffer.isView(bytes)
    ? bytes
    : new Uint8Array(bytes as ArrayBuffer);
  const module = await WebAssembly.compile(view);

  return new WebAssembly.Instance(module, imports);
}
