import { signal, computed, fromPromise } from './signal.js';
import { loadTasks } from './loaders.js';
import { ROUND_MAX } from './constants.js';

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
const tasks = fromPromise(() => loadTasks().then(tasks => tasks.toSorted(shuffleComparatorFactory())), {
  loading: ['Loading tasks...'],
  error: ['Failed to load tasks. Please try again.'],
});
const currentTaskIndex = signal(0);
const currentTask = computed(() => tasks.get()[currentTaskIndex.get()] || 'No tasks available.', [tasks, currentTaskIndex]);
currentTask.bindTo('#speech-bubble');

// Players reactivity
const players = signal([]);
const chosenPlayers = signal([]);
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

// Tokens reactivity
const round = signal(1);
const tokensLeft = signal(0);
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
tokensLeft.bindToClass('#result', 'success')

// Buttons
addPlayerBtn.addEventListener('click', () => {
  const name = playerInput.value.trim();
  if (!name) return;

  players.set([...players.get(), { name }]);
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
})

tasksModeBtn.addEventListener('click', () => {
  currentScreen.set('task-screen');
});

prevTaskBtn.addEventListener('click', () => {
  currentTaskIndex.set((currentTaskIndex.get() - 1 + tasks.get().length) % tasks.get().length);
})

nextTaskBtn.addEventListener('click', () => {
  currentTaskIndex.set((currentTaskIndex.get() + 1) % tasks.get().length);
})

homeTaskBtn.addEventListener('click', () => {
  currentScreen.set('settings-screen');
})
footer.addEventListener('click', () => {
  currentScreen.set('settings-screen');
})

playersModeBtn.addEventListener('click', () => {
  currentScreen.set('players-screen');
});

rankingModeBtn.addEventListener('click', () => {
  currentScreen.set('ranking-screen');
});

nextBtn.addEventListener('click', () => {
  nextRound();
});

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

function shuffleComparatorFactory() {
  const sortKeys = new Map();

  return (a, b) => {
    if (!sortKeys.has(a)) sortKeys.set(a, Math.random());
    if (!sortKeys.has(b)) sortKeys.set(b, Math.random());

    return sortKeys.get(a) - sortKeys.get(b);
  };
}


