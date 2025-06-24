// EXAMPLE USAGE:
// import { signal, computed, effect, fromPromise } from './signal.js';
// const tokenCount = signal(5);
// const isOutOfTokens = computed(() => tokenCount.get() <= 0, [tokenCount]);
// tokenCount.bindTo('.token-count');
// isOutOfTokens.bindToClass('.warning', 'visible');
// const tasks = fromPromise(loadTasksFromGoogleSheet, { loading: ['Loading...'], error: ['Something went wrong'] });
// players.bindList('#player-template', '#player-list', (el, player, i) => { el.querySelector('.player-name').textContent = player.name });

const resolveElements = (target) =>
  typeof target === 'string'
    ? Array.from(document.querySelectorAll(target))
    : target instanceof HTMLElement
      ? [target]
      : [];

export function signal(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  function notify() {
    listeners.forEach(fn => fn(value));
  }

  return {
    get: () => value,
    set: (newValue) => {
      if (newValue !== value) {
        value = newValue;
        notify();
      }
    },
    subscribe: (fn) => listeners.add(fn),
    unsubscribe: (fn) => listeners.delete(fn),

    bindTo: (targets, options = {}) => {
      const { property = 'textContent', attribute = null, booleanAttr = false, fn = val => val } = options;
      const allElements = Array.isArray(targets) ? targets.flatMap(resolveElements) : resolveElements(targets);
      const update = (val) => {
        const result = fn(val);
        allElements.forEach(el => {
          if (attribute) {
            if (booleanAttr) {
              if (result) el.setAttribute(attribute, '');
              else el.removeAttribute(attribute);
            } else {
              el.setAttribute(attribute, result);
            }
          } else {
            el[property] = result;
          }
        });
      };

      listeners.add(update);
      update(value);
    },

    bindToClass: (targets, className) => {
      const allElements = Array.isArray(targets) ? targets.flatMap(resolveElements) : resolveElements(targets);
      const update = (val) => {
        allElements.forEach(el => {
          if (className) {
            // If className is provided, toggle it based on the value
            el.classList.toggle(className, !!val);
          } else if (typeof val === 'string') {
            // If val is a string, add it as a class
            el.className = '';
            el.classList.add(val);
          }
          
        });
      };

      listeners.add(update);
      update(value);
    },

    bindList: (templateSelector, containerSelector, renderFn) => {
      const template = document.querySelector(templateSelector);
      const container = document.querySelector(containerSelector);

      const render = (arr) => {
        container.innerHTML = '';
        arr.forEach((item, index) => {
          const root = template.content.firstElementChild.cloneNode(true);
          renderFn(root, item, index, arr);
          container.appendChild(root);
        });
      };

      listeners.add(render);
      render(value);
    }
  };
}

export function computed(fn, deps) {
  const result = signal(fn());
  deps.forEach(dep => dep.subscribe(() => result.set(fn())));
  return result;
}

export function effect(fn) {
  fn();
  // TODO: Implement reactivity for effects
}

export function fromPromise(promiseFactory, { loading = null, error = null } = {}) {
  const state = signal(loading);

  promiseFactory()
    .then(result => state.set(result))
    .catch(err => {
      console.warn(err);
      state.set(error);
    });

  return state;
}
