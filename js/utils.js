export function shuffleComparatorFactory() {
  const sortKeys = new Map();

  return (a, b) => {
    if (!sortKeys.has(a)) sortKeys.set(a, Math.random());
    if (!sortKeys.has(b)) sortKeys.set(b, Math.random());

    return sortKeys.get(a) - sortKeys.get(b);
  };
}

export function colorizeLastFromTo(text, {toWords, fromWord}) {
  let toWord = '';
  let lastToIndex = -1;
  for (const toWrd of toWords) {
    const newLastToIndex = text.toLowerCase().lastIndexOf(toWrd);
    if (newLastToIndex > lastToIndex) {
      toWord = toWrd;
      lastToIndex = newLastToIndex;
    }
  }
  const toText = text.slice(lastToIndex + toWord.length);
  const beforeTo = text.slice(0, lastToIndex);

  const lastFromIndex = beforeTo.toLowerCase().lastIndexOf(fromWord);
  if (lastFromIndex === -1) return text;

  const beforeFrom = text.slice(0, lastFromIndex);
  const fromText = text.slice(lastFromIndex + fromWord.length, lastToIndex).trim();

  return (
    `${ beforeFrom }${ fromWord }<span class="from-color">${ fromText }</span>${ toWord }<span class="to-color">${ toText }</span>`
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