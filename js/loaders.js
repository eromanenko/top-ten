import {publicSheetId} from './ids.js';
export const sheetUrl = `https://docs.google.com/spreadsheets/d/e/${publicSheetId}/pubhtml`;
export const sheetUrlAdult = `https://docs.google.com/spreadsheets/d/e/${publicSheetId}/pubhtml?gid=1523604855&single=true`

export async function loadApi(language = 'en', version = 1) {
  const request = new URL('https://api.erom.workers.dev/');
  request.searchParams.append('language', language);
  request.searchParams.append('version', version);
  const response = await fetch(request);
  return response.json();
}

// export async function loadTasksFromGoogleSheet({sheetId, range = 'en1!A1:A1000', apiKey}) {
//   const gsJsonUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
//   const response = await fetch(gsJsonUrl);
//   const data = await response.json();

//   if (data.values) {
//     const loadedTasks = data.values.flat();
//     return loadedTasks;
//   }

//   console.warn('Could not load tasks');
//   return [];
// }

// export async function loadTasks(url) {
//   const response = await fetch(`https://gs.jasonaa.me/?url=${url}`);
//   const data = await response.json();

//   if (data) {
//     const loadedTasks = data.map(({task}) => task);
//     return loadedTasks;
//   }

//   console.warn('Could not load tasks');
//   return [];
// }