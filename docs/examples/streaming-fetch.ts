export function runTaskStreamFetch(
  endpoint: string,
  body: object
): ReadableStream<string> {
  const ts = new TransformStream<string, string>();

  (async () => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson'
      },
      body: JSON.stringify(body)
    });
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    const writer = ts.writable.getWriter();

    let buf = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buf += dec.decode(value, { stream: true });

      let nl;

      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();

        buf = buf.slice(nl + 1);

        if (line) await writer.write(line); // each line = one JSON chunk/token
      }
    }
    await writer.close();
  })();

  return ts.readable;
}
