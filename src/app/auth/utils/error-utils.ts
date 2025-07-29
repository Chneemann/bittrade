export function extractErrorMessage(error: unknown): string {
  const err = (error as any)?.error;

  if (err?.message && typeof err.message === 'string') {
    return err.message;
  }

  if (err && typeof err === 'object') {
    const firstError = Object.values(err).flat()[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  if (typeof err === 'string') return err;
  return 'Unknown error';
}
