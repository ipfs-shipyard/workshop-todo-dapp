# workshop-todo-dapp

This walk-through will guide you into the process of converting a local To-do application into a decentralized application that allows different users to manipulate the To-dos collaboratively and in realtime, while also offering offline support.

The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and is highly based on the [TodoMVC](http://todomvc.com/) project.

## Walk-through

Follow the step-by-step walk-through below to complete the workshop.

At any time, you may check the final application in the [`with-peer-star`](https://github.com/ipfs-shipyard/workshop-todo-app/tree/with-peer-star) branch in case you are running into issues.

1. [Installing](#1-installing)
1. [Running](#2-running)
1. [Understanding the To-dos store and data-model](#3-understanding-the-to-dos-store-and-data-model)
1. [Adapting the To-dos store to use `peer-star-app`](#4-adapting-the-to-dos-store-to-use-peer-star-app)
    1. [Install `peer-star-app`](#41-install-peer-star-app)
    1. [Create the app](#42-create-the-app)
    1. [Re-implement the `load` method](#43-re-implement-the-load-method)
    1. [Get rid of the `localStorage`](#44-get-rid-of-the-localstorage)
    1. [Update `add`, `remove`, `updateTitle` and `updateCompleted`](#45-update-add-remove-updatetitle-and-updatecompleted)
1. [Testing if the application works locally](#5-testing-if-the-application-works-locally)
1. [Displaying the number of users](#6-displaying-the-number-of-users-peers)
    1. [Replicate the `subscribe` and `publishStateChange` but for the peers](#61-replicate-the-subscribe-and-publishstatechange-but-for-the-peers)
    1. [Keep track of `peersCount` in the UI](#62-keep-track-of-peerscount-in-the-ui)
    1. [Render `peersCount` in the UI](#63-render-peerscount-in-the-ui)
    1. [Style `peersCount` in the UI](#64-style-peerscount-in-the-ui)
1. [Testing if the application works with other users](#7-testing-if-the-application-works-with-other-users)
1. [Deploying the application on IPFS](#8-deploying-the-application-on-ipfs)
    1. [Install IPFS and run a local node](#81-install-ipfs-and-run-a-local-node)
    1. [Ensure links are relative](#82-ensure-links-are-relative)
    1. [Build and deploy](#83-build-and-deploy)
    1. [Using a domain](#84-using-a-domain)

### 1. Installing

Be sure to have [Node.js](https://nodejs.org/download/) in your machine. Install the project by running:

```sh
$ npm install
```

### 2. Running

Now that the project is installed, you may run the development server:

```sh
$ npm start
```

The application will open automatically in your browser once ready.

### 3. Understanding the To-dos store and data-model

The [`App`](src/App.js) component is our root react component. When mounted, it loads the initial To-dos from the `todos-store` and subscribes to subsequent updates. This ensures that any change to the To-dos state will trigger a UI update. While you can explore the `App` component and all its underlying logic, our goal is to change it as little as possible.

The [`todos-store`](src/todos-store.js) exposes all the operations necessary to read and manipulate the To-dos. It also continuously persists the state to the `localStorage` so that the To-dos can be restored on subsequent visits. Moreover, it allows subscribers to receive the new state whenever it's updated. The state looks like this:

```js
[
    { id: "<unique-id>", title: "Buy candies": completed: true },
    { id: "<unique-id>", title: "Walk the dog", completed: false }
]
```

As you imagine, this application only works locally within the browser. It doesn't allow different users to read and manipulate the To-dos. What architectural pieces would we traditionally need to support [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations amongs several users?

- A database to store the To-dos
- A (Restful) API that offers a CRUD for the To-dos
- A static web-server to serve the application assets
- A realtime server, using [`socket.io`](https://socket.io/) or similar, to deliver updates to the users without using polling mechanisms

But even so, how do we deal with concurrent updates? What if we want to allow users to performs changes while offline and sync them when online? These are [hard problems](https://www.youtube.com/watch?v=4VB66hJSvqM) to solve unless we use the right technologies.

This is where `peer-star-app` comes in. It's goal is to provide the primitives for developers to build real-time and offline-first decentralized applications by using ([delta](https://github.com/ipfs-shipyard/js-delta-crdts)) [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) and [IPFS](https://ipfs.io/).

### 4. Adapting the To-dos store to use `peer-star-app`

#### 4.1. Install `peer-star-app`

Install `peer-star-app` by running:

```sh
$ npm install peer-star-app
```

#### 4.2. Create the app

Create a new app with the name `todo-dapp`:

```js
// src/todos-store.js
import createApp from 'peer-star-app';

// ...

const app = createApp('todo-dapp');

app.on('error', (err) => console.error('error in app:', err));
```

We will just log `error` events in the console, but you could display them in the UI instead.

#### 4.3. Re-implement the `load` method

We need to re-implement the `load` function which is responsible for loading the todos. In here, we must:

- Start the app
- Create a new collaboration for the To-dos
- Subscribe to the `state changed` event of the collaboration to receive updates to the underlying To-dos
- Update `todos` variable to the last known list of To-dos

In `peer-star-app` we may have as many collaborations as we want. Users collaborate on a CRDT [type](https://github.com/ipfs-shipyard/js-delta-crdts#types): either a built-in or a custom one. Because the To-dos data-model is an array of objects, we will use the `rga` (Replicable Growable Array) type.

This allows multiple users to perform concurrent CRUD operations without any conflicts. This works well in most cases but it doesn't allow concurrent updates of the title and complete fields of To-dos. That could be supported by using sub-collaborations  but we will skip it for the sake of simplicity.

Update the `load` function like so:

```js
// src/todos-store.js

// ...
let collaboration;

export default {
    async load() {
        await app.start();

        collaboration = await app.collaborate('todos-of-<github-username>', 'rga');

        collaboration.removeAllListeners('state changed');
        collaboration.on('state changed', () => {
            todos = collaboration.shared.value();
            publishStateChange(todos);
        });

        todos = collaboration.shared.value();

        return todos;
    },

    // ...
};
```

Be sure to change `<<github-username>` so that the Collaboration ID is unique. This ensures that you start with an empty list of To-dos.


The `collaboration.shared` is a reference to the CRDT instance. We will use it in next steps to perform changes on the underlying state.

Note that we are calling `removeAllListeners('state changed')` so that `load` can be called multiple times during the lifecyle of the app. If we didn't do that, the subscribers would be called multiple times for the same event.


#### 4.4. Get rid of the `localStorage`

Peer-star already persists the last known state of each collaboration. This means that we can safely remove any code that relates to storing or reading the To-dos from the `localStorage`.

You may remove all the lines below:

```js
// src/todos-store.js
// ....

import throttle from 'lodash/throttle';

// ....

window.addEventListener('unload', () => saveTodos(todos));

const readTodos = () => JSON.parse(localStorage.getItem('dapp-todos') || '[]');
const saveTodos = () => todos && localStorage.setItem('dapp-todos', JSON.stringify(todos));
const saveTodosThrottled = throttle(saveTodos, 1000, { leading: false });
```

... and the `publishStateChange` now becomes simpler:

```js
// src/todos-store.js

const publishStateChange = (todos) => subscribers.forEach((listener) => listener(todos));
```

Yeah, less code yields profit!

### 4.5. Update `add`, `remove`, `updateTitle` and `updateCompleted`

We now must update `add`, `remove`, `updateTitle` and `updateCompleted` functions to call the CRDT mutations instead of manipulating the `todos` manually. By doing so, we will trigger a `state change` event on ourselves and in other replicas (users) as well.

The `rga` CRDT type has the following methods:

- `push()`
- `insertAt(index, value)`
- `updateAt(index, value)`
- `removeAt(index)`

Let's use these functions to mutate the state:

```js
// src/todos-store.js
// ...

export default {
    // ...
    add(title) {
        collaboration.shared.push({ id: uuidv4(), title, completed: false });
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

    // ...
},
```

And that's all. Easy huh?

### 5. Testing if the application works locally

You may test the changes we made locally. The application should behave exactly the same as before but it's now partially decentralized! It's not totally decentralized because we are still serving it using a web server. But more on that later.

### 6. Displaying the number of users (peers)

The `collaboration` emits the `membership changed` event that we can listen to keep track of the peers collaborating. We will use it to display the number of peers in the UI.

### 6.1. Replicate the `subscribe` and `publishStateChange` but for the peers

Lets replicate the `subscribe` and `publishStateChange` logic but for the peers:

```js
// src/todos-store.js
// ...

const publishPeersChange = (peers) => peersSubscribers.forEach((listener) => listener(peers));

export default {
    async load() {
        // ...

        collaboration.removeAllListeners('membership changed');
        collaboration.on('membership changed', publishPeersChange);
    },

    // ...

    subscribePeers(subscriber) {
        peersSubscribers.add(subscriber);

        return () => peersSubscribers.remove(subscriber);
    },
};
```

### 6.2. Keep track of `peersCount` in the UI

Add `peersCount` to the `App` component state and update it whenever it changes:

```js
// src/App.js
// ...

class App extends Component {
    state = {
        // ...
        peersCount: 1,
    }

    async componentDidMount() {
        // ...

        todosStore.subscribePeers((peers) => this.setState({ peersCount: peers.size }));
    }

    // ...
}
```

### 6.3. Render `peersCount` in the UI

Let's render `peersCount` in the footer:

```jsx
// src/App.js
// ...

class App extends Component {
    // ...

    render() {
        const { loading, error, todos, peersCount } = this.state;

        return (
            <div className="App">
                { /* ... */ }

                <footer className="App__footer">
                    <div className="App__peers-count">{ peersCount }</div>

                    { /* ... */ }
                </footer>
            </div>
        );
    }
);
```

### 6.4. Style `peersCount` in the UI

Finally, add the `App__peers-count` CSS class to the bottom of `App.css`:

```css
/* App.css */
/* ... */

.App__peers-count {
    width: 50px;
    height: 50px;
    margin-bottom: 25px;
    padding: 5px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #cc9a9a;
    background-color: rgba(175, 47, 47, 0.15);
    border-radius: 50%;
    color: #6f6f6f;
    font-size: 15px;
    line-height: 50px;
}
```

You should now be able to see the number of peers collaborating on the To-dos. Depending on the network, it might take some time to discover peers.

### 7. Testing if the application works with other users

Open the application in two different browsers, e.g.: Chrome and Chrome incognito. Any changes should replicate seamlessly. Be sure to also make changes while offline and see if they syncronize correctly once online.

### 8. Deploying the application on IPFS

Instead of using a regular web server to serve the application, we will use IPFS instead. After completing this step, our app will be 100% decentralized!

#### 8.1. Install IPFS and run a local node

We need to have a local IPFS node for the upcoming steps. We will use a [JS IPFS node](https://github.com/ipfs/js-ipfs) but you could use a [Go node](https://github.com/ipfs/go-ipfs) instead.

Let's install it globally:

```sh
$ npm install -g ipfs
```

Now, open a new terminal window and start the node:

```sh
$ jsipfs init
$ jsipfs daemon
```

#### 8.2. Ensure links are relative

Everything stored on IPFS is immutable and content-addressable. When a file is stored, IPFS calculates its hash and uses it as an identifier, called `cid`. These files can be accessed in your browser via IPFS node gateways. Since we are running the JS IPFS node, we can access files via `http://localhost:9090/ipfs/<cid>`.

Because the `cid` is unknown at build time, we can't use absolute paths to reference any links or assets. Luckily for us, Create React App allows us to set a `homepage` property which will be used to prefix every asset:

```json
{
    "name": "workshop-todo-dapp",
    "homepage": ".",
    "...other": "properties"
}
```

#### 8.3. Build and deploy

Let's create a production-ready version of the website by building it:

```sh
$ npm run build
```

This creates a `build` folder with all the application assets. Let's deploy it to IPFS by adding that folder to your local IPFS node:

```sh
$ jsipfs add -r build
```

The `-r` tell `ipfs` to recursively add all the files. At the end of the command output, you should see the `cid` of all added files, including the build folder one:

```
...
added QmcFc6EPhavNSfdjG8byaxxV6KtHZvnDwYXLHvyJQPp3uN public/favicon.ico
added <cid> build
```

Finally, copy the `<cid>` and use your local IPFS node to access the website: `http://localhost:9090/ipfs/<cid>`. The trick here is that other IPFS nodes that pin the same `<cid>` will also be eligible to serve the website!

#### 8.4. Using a domain

In order to use a domain with your website deployed on IPFS, we need to first understand dnslink. Please watch ["Quick explanation of dnslink in IPFS"](https://www.youtube.com/watch?v=YxKZFeDvcBs) by [@VictorBjelkholm](https://github.com/VictorBjelkholm) that explains what dnslink is in less than 3 minutes.

First, create to a ALIAS record pointing to a public Gateway (e.g.: gateway-int.ipfs.io) or a A record pointing to the IP address where your IPFS gateway is running. Lastly, create a TXT record named `_dnslink.<domain>` with a value of `dnslink=/ipfs/<cid>` (eplace `<domain>` and `<cid>` with the correct values). We recommend setting a short TTL like 60 seconds.

## Interested in knowing more?

The `peer-star-app` library is still in its infancy. We are actively working on adding features such as Identity, Authentication and Authorization.

If you are insterested in helping us or even just tracking progress, you may do so via:

- IPFS's Dynamic Data and Capabilities Working Group on GitHub - https://github.com/ipfs/dynamic-data-and-capabilities
- `#ipfs` and `#ipfs-dynamic-data` IRC channels on freenode.net
- `peer-star-app` repository on GitHub - https://github.com/ipfs-shipyard/peer-star-app
