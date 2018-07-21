import throttle from 'lodash/throttle';

const localStorageKey = 'dapp-todos';

const readTodos = () => {
    const storedTodos = localStorage.getItem(localStorageKey);

    if (!storedTodos) {
        return null;
    }

    try {
        return JSON.parse(localStorage.getItem(localStorageKey));
    } catch (err) {
        console.error('Unable to read todos from localStorage');
        console.log(err);

        return null;
    }
};

const saveTodos = (todos) => {
    try {
        localStorage.setItem(localStorageKey, JSON.stringify(todos));
    } catch (err) {
        console.error('Unable to store todos in localStorage');
        console.log(err);
    }
};

const saveTodosThrottled = throttle(saveTodos, 200, { leading: false });

export { readTodos, saveTodos, saveTodosThrottled };
