export function errorBoundary<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (error) {
    console.log(`Error ${fn.name}:`, error);
    return null;
  }
}
