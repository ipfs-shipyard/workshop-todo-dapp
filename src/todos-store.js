import uuidv4 from 'uuid/v4';
import throttle from 'lodash/throttle';

let todos;
const subscribers = new Set();

window.addEventListener('unload', () => saveTodos(todos));

const readTodos = () => JSON.parse(localStorage.getItem('dapp-todos') || '[]');
const saveTodos = () => todos && localStorage.setItem('dapp-todos', JSON.stringify(todos));
const saveTodosThrottled = throttle(saveTodos, 1000, { leading: false });

const publishStateChange = (todos) => {
    saveTodosThrottled(todos);
    subscribers.forEach((listener) => listener(todos));
};

export default {
    load() {
        return new Promise((resolve) => {
            todos = readTodos();
            setTimeout(() => resolve(todos), 400);
        });
    },

    add(title) {
        const newTodo = { id: uuidv4(), title, completed: false };

        todos = [
            ...todos,
            newTodo,
        ];

        publishStateChange(todos);
    },

    remove(id) {
        const index = todos.findIndex((todo) => todo.id === id);

        if (index === -1) {
            return;
        }

        todos = [
            ...todos.slice(0, index),
            ...todos.slice(index + 1),
        ];

        publishStateChange(todos);
    },

    updateTitle(id, title) {
        const index = todos.findIndex((todo) => todo.id === id);
        const todo = todos[index];

        if (!todo || todo.title === title) {
            return;
        }

        const updatedTodo = { ...todo, title };

        todos = [
            ...todos.slice(0, index),
            updatedTodo,
            ...todos.slice(index + 1),
        ];

        publishStateChange(todos);
    },

    updateCompleted(id, completed) {
        const index = todos.findIndex((todo) => todo.id === id);
        const todo = todos[index];

        if (!todo || todo.completed === completed) {
            return;
        }

        const updatedTodo = { ...todo, completed };

        todos = [
            ...todos.slice(0, index),
            updatedTodo,
            ...todos.slice(index + 1),
        ];

        publishStateChange(todos);
    },

    updateAllCompleted(completed) {
        todos.forEach((todo) => this.updateCompleted(todo.id, completed));
    },

    clearCompleted() {
        todos
        .filter((todo) => todo.completed)
        .reverse()
        .forEach((todo) => this.remove(todo.id));
    },

    subscribe(subscriber) {
        subscribers.add(subscriber);

        return () => subscribers.remove(subscriber);
    },
};
