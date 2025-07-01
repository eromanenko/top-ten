export function shuffleComparatorFactory() {
  const sortKeys = new Map();

  return (a, b) => {
    if (!sortKeys.has(a)) sortKeys.set(a, Math.random());
    if (!sortKeys.has(b)) sortKeys.set(b, Math.random());

    return sortKeys.get(a) - sortKeys.get(b);
  };
}

export function colorizeLastFromTo(text) {
  const indexDo = text.toLowerCase().lastIndexOf(' до ');
  const indexK = text.toLowerCase().lastIndexOf(' к ');
  let toWord = '';
  let lastToIndex = -1;
  if (indexK > indexDo) {
    toWord = ' к ';
    lastToIndex = indexK;
  } else {
    toWord = ' до '
    lastToIndex = indexDo;
  }
  const afterTo = text.slice(lastToIndex + toWord.length);
  const beforeTo = text.slice(0, lastToIndex);

  const lastFromIndex = beforeTo.toLowerCase().lastIndexOf('от ');
  if (lastFromIndex === -1) return text;

  const beforeFrom = text.slice(0, lastFromIndex);
  const fromText = text.slice(lastFromIndex + 3, lastToIndex).trim(); // +3 = 'от '.length

  return (
    `${beforeFrom}от <span class="from-color">${fromText}</span>${toWord}<span class="to-color">${afterTo}</span>`
  );
}

export function loadPlayerNames() {
  return JSON.parse(localStorage.getItem('saved-players') || '[]');
}

export function savePlayerName(name) {
  const saved = JSON.parse(localStorage.getItem('saved-players') || '[]');
  if (!saved.includes(name)) {
    saved.push(name);
    localStorage.setItem('saved-players', JSON.stringify(saved));
  }
}