export const cached = <T>(
  ttlMs: number,
  load: () => Promise<T>,
): () => Promise<T> => {
  let value: T | undefined;
  let loadedAt = 0;
  let inflight: Promise<T> | undefined;

  const refresh = () => (inflight ??= load()
    .then((v) => {
      value = v;
      loadedAt = Date.now();
      return v;
    })
    .finally(() => {
      inflight = undefined;
    }));

  return () => {
    if (value === undefined) return refresh();
    if (Date.now() - loadedAt > ttlMs) refresh().catch(() => {});
    return Promise.resolve(value);
  };
};
