export function ok<T>(data: T, message = 'ok') {
  return { code: 0, data, message };
}

export function fail(message: string, code = 1, data: null | Record<string, never> = null) {
  return { code, data, message };
}
