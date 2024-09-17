function append<T>(initialValue: T[] = []) {
  return {
    reducer: (a: T[], b: T[]) => a.concat(b),
    default: () => initialValue,
  };
}

function overwrite<T>(initialValue: T) {
  return {
    reducer: (a: T, b: T): T => b || a,
    default: () => initialValue,
  };
}
export { append, overwrite };
