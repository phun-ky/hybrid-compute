/** What a value is, for error messages: null, an array, or its typeof. */
export const describeValue = (value: unknown) => {
  if (value === null) return 'null';

  if (Array.isArray(value)) return 'an array';

  if (value === '') return 'an empty string';

  return typeof value;
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The message for an `error` value: a string, or an object's message. */
export const messageOf = (error: unknown) => {
  if (typeof error === 'string') return error;

  if (isPlainObject(error) && typeof error.message === 'string') {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
