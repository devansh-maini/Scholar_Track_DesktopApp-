/** Turns anything thrown into a short human message for a toast. */
export const errMsg = (e: unknown, fallback = 'Something went wrong'): string => (e instanceof Error ? e.message : fallback);
