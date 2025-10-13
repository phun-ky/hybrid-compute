/** Utility helpers for string<->memory interop (UTF-8). */
export const writeStringToMemory = (
  str: string,
  mem: WebAssembly.Memory,
  alloc: (n: number) => number
): number => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const ptr = alloc(bytes.length + 1);
  const buf = new Uint8Array(mem.buffer, ptr, bytes.length + 1);

  buf.set(bytes);
  buf[bytes.length] = 0; // null-terminator (C-style)

  return ptr;
};

export const readStringFromMemory = (
  ptr: number,
  mem: WebAssembly.Memory
): string => {
  const view = new Uint8Array(mem.buffer);

  let end = ptr;

  while (view[end] !== 0) end++;

  const bytes = view.subarray(ptr, end);

  return new TextDecoder().decode(bytes);
};
