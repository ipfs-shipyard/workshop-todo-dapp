import uuidv4 from 'uuid/v4';
import createApp from 'peer-star-app';
import debounce from 'lodash/debounce';

let todos;
const subscribers = new Set();
const peersSubscribers = new Set();
const app = createApp('todo-dapp');
let collaboration;

app.on('error', (err) => console.error('error in app:', err));

const publishStateChange = (todos) => subscribers.forEach((listener) => listener(todos));
const publishStateChangeDebounced = debounce((todos) => subscribers.forEach((listener) => listener(todos)), 200);
const publishPeersChange = (peers) => peersSubscribers.forEach((listener) => listener(peers));
const publishPeersChangeDebounced = debounce(publishPeersChange, 200);

export default {
    async load() {
        await app.start();

        collaboration = await app.collaborate('todos', 'rga');
        todos = collaboration.shared.value();

        collaboration.removeAllListeners('state changed');
        collaboration.on('state changed', (fromSelf) => {
            todos = collaboration.shared.value();

            if (fromSelf) {
                publishStateChange(todos);
                publishStateChangeDebounced.cancel();
            } else {
                publishStateChangeDebounced(todos);
            }
        });

        collaboration.removeAllListeners('membership changed');
        collaboration.on('membership changed', publishPeersChangeDebounced);

        return todos;
    },

    add(title) {
        const newTodo = { id: uuidv4(), title, completed: false };

        collaboration.shared.push(newTodo);
    },

    remove(id) {
        const index = todos.findIndex((todo) => todo.id === id);

        if (index === -1) {
            return;
        }

        collaboration.shared.removeAt(index);
    },

    updateTitle(id, title) {
        const index = todos.findIndex((todo) => todo.id === id);
        const todo = todos[index];

        if (!todo || todo.title === title) {
            return;
        }

        const updatedTodo = { ...todo, title };

        collaboration.shared.updateAt(index, updatedTodo);
    },

    updateCompleted(id, completed) {
        const index = todos.findIndex((todo) => todo.id === id);
        const todo = todos[index];

        if (!todo || todo.completed === completed) {
            return;
        }

        const updatedTodo = { ...todo, completed };

        collaboration.shared.updateAt(index, updatedTodo);
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

    subscribePeers(subscriber) {
        peersSubscribers.add(subscriber);

        return () => peersSubscribers.remove(subscriber);
    },
};
