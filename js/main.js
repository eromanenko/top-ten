import { signal, computed } from './signal.js';
import { loadTasksFromGoogleSheet } from './loaders.js';
import { ROUND_MAX } from './constants.js';
import { sheetId, apiKey } from './ids.js';
import { shuffleComparatorFactory, colorizeLastFromTo, loadPlayerNames, savePlayerName } from './utils.js';
import { DEFAULT_LANG, LANGS, SPLITTERS } from './i18n.js';

const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const startGameBtn = document.getElementById('start-game-btn');
const showTaskBtn = document.getElementById('show-task-btn');
const newGameBtn = document.getElementById('new-game-btn');

const playersModeBtn = document.getElementById('players-mode-btn');
const tasksModeBtn = document.getElementById('tasks-mode-btn');
const rankingModeBtn = document.getElementById('rank-mode-btn');
const nextBtn = document.getElementById('next-btn');

const prevTaskBtn = document.getElementById('prev-task-btn');
const nextTaskBtn = document.getElementById('next-task-btn');
const homeTaskBtn = document.getElementById('home-task-btn');

const baseVerBtn = document.getElementById('base-ver-btn');
const adultVerBtn = document.getElementById('adult-ver-btn');
const langVerEn = document.getElementById('lang-ver-en');
const langVerUa = document.getElementById('lang-ver-ua');
const langVerRu = document.getElementById('lang-ver-ru');

const footer = document.getElementById('footer');

// Screen reactivity
// 'settings-screen', 'players-screen', 'ranking-screen', 'task-screen', 'task-only-screen'
const currentScreen = signal('settings-screen');
const isSettingsScreen = computed(() => currentScreen.get() === 'settings-screen', [currentScreen]);
const isGameScreen = computed(() => ['players-screen', 'ranking-screen', 'task-screen', 'task-only-screen'].includes(currentScreen.get()), [currentScreen]);
const isPlayersScreen = computed(() => currentScreen.get() === 'players-screen', [currentScreen]);
const isRankingScreen = computed(() => currentScreen.get() === 'ranking-screen', [currentScreen]);
const isTaskScreen = computed(() => ['task-screen', 'task-only-screen'].includes(currentScreen.get()), [currentScreen]);
const isTaskOnlyScreen = computed(() => currentScreen.get() === 'task-only-screen', [currentScreen]);
isSettingsScreen.bindToClass('#settings-screen', 'active');
isGameScreen.bindToClass('#game-screen', 'active');
isPlayersScreen.bindToClass('#players-wrap', 'active');
isRankingScreen.bindToClass('#ranking-wrap', 'active');
isTaskScreen.bindToClass('#task-content', 'active');
isTaskOnlyScreen.bindToClass(['#top-bar', '#bottom-bar'], 'hidden');
isPlayersScreen.bindTo('#players-mode-btn', { attribute: 'disabled', booleanAttr: true });
isRankingScreen.bindTo('#rank-mode-btn', { attribute: 'disabled', booleanAttr: true });
isTaskScreen.bindTo('#tasks-mode-btn', { attribute: 'disabled', booleanAttr: true });

// Tasks reactivity
const tasks = signal([]);
const currentVersion = signal(null); // 1 - base, 2 - adult
const currentLang = signal(DEFAULT_LANG); // 'en', 'ua', 'ru'
const tasksRange = computed(() => `${ currentLang.get() }${ currentVersion.get() }!A1:A1000`, [currentVersion, currentLang]);
tasksRange.subscribe((range) => {
  loadTasksFromGoogleSheet({sheetId, apiKey, range}).then((tasksArr) => {tasks.set(tasksArr.toSorted(shuffleComparatorFactory()))});
})
// const tasksBase = fromPromise(() => loadTasks(sheetUrl).then(tasks => tasks.toSorted(shuffleComparatorFactory())), {
//   loading: ['Loading tasks...'],
//   error: ['Failed to load tasks. Please try again.'],
// });
// const tasksAdult = fromPromise(() => loadTasksFromGoogleSheet({sheetId, apiKey, range: 'sh2!A2:A1000'}).then(tasks => tasks.toSorted(shuffleComparatorFactory())), {
//   loading: ['Loading tasks...'],
//   error: ['Failed to load tasks. Please try again.'],
// });
//const tasks = computed(() => currentVersion.get() === 1 ? tasksBase.get() : tasksAdult.get(), [currentVersion, tasksBase, tasksAdult])
const currentTaskIndex = signal(0);
const currentTask = computed(() => tasks.get()[currentTaskIndex.get()] || 'No tasks available.', [tasks, currentTaskIndex]);
const formattedTask = computed(() => colorizeLastFromTo(currentTask.get(), SPLITTERS[currentLang.get()]), [currentTask, currentLang]);
formattedTask.bindTo('#speech-bubble', {property: 'innerHTML'});
currentVersion.bindTo('#base-ver-btn', {attribute: 'disabled', booleanAttr: true, fn: (val) => val === 1});
currentVersion.bindTo('#adult-ver-btn', {attribute: 'disabled', booleanAttr: true, fn: (val) => val === 2});
currentVersion.bindToClass('body', 'adult', (val) => val === 2);

// Players reactivity
const players = signal([]);
const chosenPlayers = signal([]);
const playersSuggestions = signal([]);
const playersCount = computed(() => players.get().length, [players]);
const isHiddenPlayers = computed(() => playersCount.get() === 0, [playersCount]);
const isDisabledStartGame = computed(() => playersCount.get() < 3, [playersCount]);
players.bindTo('#player-input', { property: 'value', fn: (players) => {
  const name = `player ${players.length + 1}`
  return name;
} });
isHiddenPlayers.bindToClass('#players', 'hidden');
isDisabledStartGame.bindTo('#start-game-btn', { attribute: 'disabled', booleanAttr: true });
players.bindList('#player-template', '#player-list', (el, player, i) => {
  el.querySelector('.player-name').textContent = `${player.name}`;
  el.addEventListener('click', () => {
    const arr = players.get();
    const updated = [...arr.slice(0, i), ...arr.slice(i + 1)];
    players.set(updated);
  });
});
players.bindList('#player-template', '#players-content', (el, player, i) => {
  el.querySelector('.player-name').textContent = `${player.name}`;
  el.addEventListener('click', () => {
    el.querySelector('.player-name').textContent = `${player.name} (${ player.level })`;
    setTimeout(() => { el.querySelector('.player-name').textContent = `${player.name}` }, 1000);
  });
  if (player.isActive) {
    el.classList.add('active');
  }
});
players.bindList('#player-template', '#ranking-content', (el, player, i, players) => {
  el.querySelector('.player-name').textContent = `${player.name}`;
  if (player.isActive) {
    el.classList.add('active');
  }
  el.addEventListener('click', () => {
    const chosen = chosenPlayers.get();
    el.querySelector('.player-name').textContent = `${chosen.length + 1}. ${player.name} (${ player.level })`;
    const prev = chosen.at(-1);
    if (prev && player.level < prev.level) {
      const newCount = tokensLeft.get() - 1;
      tokensLeft.set(newCount);
    }

    chosenPlayers.set([...chosen, player]);
    el.disabled = true;

    if (chosen.length === players.length) {

    }
  });
});

playersSuggestions.bindList('#player-suggestion', '#saved-player-names', (el, name) => {
  el.value = name;
})

// Tokens reactivity
const round = signal(1);
const tokensLeft = signal(0);
const resultClass = computed(() => {
  const playersCount = players.get().length;
  const tokensCount = tokensLeft.get();
  if (!playersCount || !isGameScreen.get()) return 'result-0';
  const tokensSpent = playersCount - tokensCount;
  if (playersCount === tokensCount) return 'result-1';
  if (tokensSpent <= tokensCount) return 'result-2';
  if (!!tokensCount) return 'result-3';
  return 'result-4';
}, [tokensLeft, players, isGameScreen]);
resultClass.bindToClass('#app')
round.bindTo('#round-count', {fn: (round) => `${round}/${ROUND_MAX}`});
tokensLeft.bindTo('#token-count');

const isAllPlayersChosen = computed(() => chosenPlayers.get().length === players.get().length, [chosenPlayers, players]);
const isGameOverFailed = computed(() => players.get().length && tokensLeft.get() === 0, [tokensLeft, players]);
const isGameOverSuccess = computed(() => round.get() === ROUND_MAX && isAllPlayersChosen.get(), [round, isAllPlayersChosen]);
const isGameOver = computed(() => isGameOverFailed.get() || isGameOverSuccess.get(), [isGameOverFailed, isGameOverSuccess]);
const canNextRound = computed(() => isAllPlayersChosen.get() && !isGameOver.get(), [isAllPlayersChosen, isGameOver]);
canNextRound.bindTo('#next-btn', { attribute: 'hidden', booleanAttr: true, fn: (canNext) => !canNext });
isGameOver.bindTo('#new-game-btn', { attribute: 'hidden', booleanAttr: true, fn: (canNext) => !canNext });
isGameOver.bindTo('#result', { attribute: 'hidden', booleanAttr: true, fn: (canNext) => !canNext });
tokensLeft.bindTo('#result', {fn: (count) => count ? 'Success! )' : 'Failed ('});
tokensLeft.bindToClass('#result', 'success');

// Internationalization
const labels = computed(() => LANGS[currentLang.get()], [currentLang]);
currentLang.bindTo('#lang-ver-en', {attribute: 'disabled', booleanAttr: true, fn: (val) => val === 'en'});
currentLang.bindTo('#lang-ver-ua', {attribute: 'disabled', booleanAttr: true, fn: (val) => val === 'ua'});
currentLang.bindTo('#lang-ver-ru', {attribute: 'disabled', booleanAttr: true, fn: (val) => val === 'ru'});
labels.bindTo('#ver', {fn: ({ver}) => ver});
labels.bindTo('#base-ver-btn', {fn: ({base}) => base});
labels.bindTo('#tasksOnly', {fn: ({tasksOnly}) => tasksOnly});
labels.bindTo('#tasksOnlyDescription', {fn: ({tasksOnlyDescription}) => tasksOnlyDescription});
labels.bindTo('#show-task-btn', {fn: ({taskOnlyButton}) => taskOnlyButton});
labels.bindTo('#orDivider', {fn: ({orDivider}) => orDivider});
labels.bindTo('#fullGame', {fn: ({fullGame}) => fullGame});
labels.bindTo('#fullGameDescription', {fn: ({fullGameDescription}) => fullGameDescription});
labels.bindTo('#start-game-btn', {fn: ({startButton}) => startButton});
labels.bindTo('#player-input', {attribute: 'placeholder', fn: ({inputPlaceholder}) => inputPlaceholder});
labels.bindTo('#add-player-btn', {fn: ({addButton}) => addButton});
labels.bindTo('#players-mode-btn', {fn: ({seePlayers}) => seePlayers});
labels.bindTo('#rank-mode-btn', {fn: ({rankPlayers}) => rankPlayers});
labels.bindTo('#tasks-mode-btn', {fn: ({readTask}) => readTask});
labels.bindTo('#next-btn', {fn: ({nextRound}) => nextRound});
labels.bindTo('#new-game-btn', {fn: ({newGame}) => newGame});
labels.bindTo('#playersDescription', {fn: ({playersDescription}) => playersDescription});
labels.bindTo('#rankingDescription', {fn: ({rankingDescription}) => rankingDescription});
labels.bindTo('#home-task-btn', {fn: ({homeButton}) => homeButton});
labels.bindTo('#prev-task-btn', {fn: ({previousTask}) => previousTask});
labels.bindTo('#next-task-btn', {fn: ({nextTask}) => nextTask});
labels.bindTo('#round', {fn: ({round}) => round});
labels.bindTo('#tokens-label', {fn: ({tokens}) => tokens});

// Buttons
playerInput.addEventListener('focus', function() { this.value = '' });

addPlayerBtn.addEventListener('click', () => {
  const name = playerInput.value.trim();
  if (!name) return;

  players.set([...players.get(), { name }]);
  savePlayerName(name);
});

startGameBtn.addEventListener('click', () => {
  initGame(players.get());
  currentScreen.set('players-screen');
});

showTaskBtn.addEventListener('click', () => {
  players.set([]);
  round.set(1);
  chosenPlayers.set([]);
  currentScreen.set('task-only-screen');
});

newGameBtn.addEventListener('click', () => {
  currentScreen.set('settings-screen');
});

tasksModeBtn.addEventListener('click', () => {
  currentScreen.set('task-screen');
});

prevTaskBtn.addEventListener('click', () => {
  currentTaskIndex.set((currentTaskIndex.get() - 1 + tasks.get().length) % tasks.get().length);
});

nextTaskBtn.addEventListener('click', () => {
  currentTaskIndex.set((currentTaskIndex.get() + 1) % tasks.get().length);
});

homeTaskBtn?.addEventListener('click', () => {
  currentScreen.set('settings-screen');
});

footer.addEventListener('click', () => {
  currentScreen.set('settings-screen');
});

baseVerBtn.addEventListener('click', () => {
  currentVersion.set(1);
  currentTaskIndex.set(0);
});

adultVerBtn.addEventListener('click', () => {
  currentVersion.set(2);
  currentTaskIndex.set(0);
});

langVerEn.addEventListener('click', () => {
  currentLang.set('en');
});

langVerUa.addEventListener('click', () => {
  currentLang.set('ua');
});

langVerRu.addEventListener('click', () => {
  currentLang.set('ru');
});

playersModeBtn.addEventListener('click', () => {
  currentScreen.set('players-screen');
});

rankingModeBtn.addEventListener('click', () => {
  currentScreen.set('ranking-screen');
});

nextBtn.addEventListener('click', () => {
  nextRound();
});

function onAppInit() {
  playersSuggestions.set(loadPlayerNames());
  currentVersion.set(1);
}

function initGame(players) {
  nextCaptain();
  tokensLeft.set(players.length);
  round.set(1);
  chosenPlayers.set([]);
  setRandomIntensities();
}

function nextRound() {
  nextCaptain();
  round.set(round.get() + 1);
  chosenPlayers.set([]);
  currentScreen.set('players-screen');
  setRandomIntensities();
}

function nextCaptain() {
  const playersArr = players.get();
  const currentCaptainIndex = playersArr.findIndex(({isActive}) => isActive); // -1 for first
  const newIndex = (currentCaptainIndex + 1) % playersArr.length;
  players.set(playersArr.map((player, index) => ({...player, isActive: index === newIndex})));
}

function setRandomIntensities() {
  const levels = [...Array(10).keys()].map(n => n + 1).toSorted(shuffleComparatorFactory());
  players.set(players.get().map((p, i) => ({...p, level: levels[i]})));
}

onAppInit();