/**
 * Extracts a human-readable error message from an axios error.
 * Avoids "[object Object]" when the API returns a structured error body.
 */
export function getApiErrorMessage(err) {
  const data = err.response?.data;
  if (!data) return err.message || 'Error desconocido';
  if (typeof data === 'string') return data;
  // ASP.NET validation problem details
  if (data.title) return data.title;
  if (data.detail) return data.detail;
  // ASP.NET model validation errors
  if (data.errors) {
    return Object.values(data.errors).flat().join(', ');
  }
  return JSON.stringify(data);
}
