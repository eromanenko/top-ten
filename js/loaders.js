export async function loadApi(language = 'en', version = 1) {
  const request = new URL('https://api.erom.workers.dev/');
  request.searchParams.append('language', language);
  request.searchParams.append('version', version);
  try {
    const response = await fetch(request);
    if (!response.ok) {
      // Handle HTTP errors, e.g., 404, 500
      console.error(`HTTP error! status: ${response.status}`);
      // Consider throwing an error or returning a default value
      return [];
    }
    return response.json();
  } catch (error) {
    console.error('Failed to load API data:', error);
    return []; // Return an empty array or handle as appropriate
  }
}