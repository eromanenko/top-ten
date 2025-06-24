import {publicSheetId, sheetId, apiKey} from './ids.js';
const sheetUrl = `https://docs.google.com/spreadsheets/d/e/${publicSheetId}/pubhtml`;
const gsJsonUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/sh1!A2:A1000?key=${apiKey}`;


export async function loadTasksFromGoogleSheet() {
  const response = await fetch(gsJsonUrl);
  const data = await response.json();

  if (data.values) {
    const loadedTasks = data.values.flat();
    return loadedTasks;
  }

  console.warn('Could not load tasks');
  return [];
}

export async function loadTasks() {
  const response = await fetch(`https://gs.jasonaa.me/?url=${sheetUrl}`);
  const data = await response.json();

  if (data) {
    const loadedTasks = data.map(({task}) => task);
    return loadedTasks;
  }

  console.warn('Could not load tasks');
  return [];
}