export function shuffleComparatorFactory() {
  const sortKeys = new Map();

  return (a, b) => {
    if (!sortKeys.has(a)) sortKeys.set(a, Math.random());
    if (!sortKeys.has(b)) sortKeys.set(b, Math.random());

    return sortKeys.get(a) - sortKeys.get(b);
  };
}

export function colorizeLastFromTo(text) {
  const pattern = /от\s+(.+?)\s+(?:до|к)\s+(.+)/gi;

  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return text;

  const last = matches[matches.length - 1];

  const [full, from, to] = last;
  const start = last.index;
  const end = start + full.length;

  return (
    text.slice(0, start) +
    `от <span class="from-color">${from}</span> до <span class="to-color">${to}</span>` +
    text.slice(end)
  );
}