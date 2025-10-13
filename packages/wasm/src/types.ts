export type WasmSource =
  | URL
  | string
  | ArrayBuffer
  | ArrayBufferView
  | WebAssembly.Module;

export interface WasmComputeOptions {
  /** Where to load the WASM module from (URL/string) or a precompiled source. */
  source: WasmSource;
  /** Imports passed to the module (e.g., env, wasi_snapshot_preview1, etc.). */
  imports?: WebAssembly.Imports;
}
