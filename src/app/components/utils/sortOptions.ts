export function sortAlphaNumeric(values: string[]) {
  return values
    .slice()
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));
}