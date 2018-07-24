import React, { Component } from 'react';
import TodoHeader from './components/todo-header';
import TodoItem from './components/todo-item';
import TodoFooter from './components/todo-footer';
import CircularLoader from './components/circular-loader';
import todosStore from './todos-store';
import { filterTodos, calculateTodosCounts } from './todos-selectors';
import './App.css';

class App extends Component {
    state = {
        loading: true,
        error: null,
        todos: null,
        filter: 'all',
        peersCount: 1,
    };

    async componentDidMount() {
        try {
            const todos = await todosStore.load();

            this.setState({ loading: false, todos });
        } catch (error) {
            console.error(error);
            this.setState({ loading: false, error });
        }

        todosStore.subscribe((todos) => this.setState({ todos }));
        todosStore.subscribePeers((peers) => this.setState({ peersCount: peers.size }));
    }

    render() {
        const { loading, error, todos, peersCount } = this.state;

        return (
            <div className="App">
                <header className="App__header">
                    <h1>todos</h1>
                </header>

                { loading ? this.renderLoading() : null }
                { error ? this.renderError() : null }
                { todos ? this.renderTodos() : null }

                <footer className="App__footer">
                    <div className="App_peers-count">{ peersCount }</div>

                    <p>Double-click to edit a todo</p>
                    <p>Based on the work of <a href="http://github.com/petehunt/">petehunt</a></p>
                    <p>Slightly modified version of <a href="http://todomvc.com">TodoMVC</a></p>
                </footer>
            </div>
        );
    }

    renderLoading() {
        return (
            <div className="App__loader">
                <CircularLoader />
            </div>
        );
    }

    renderError() {
        return (
            <div className="App__error">
                An error occurred while loading the todos
            </div>
        );
    }

    renderTodos() {
        const { todos, filter } = this.state;
        const todosCounts = calculateTodosCounts(todos);
        const filteredTodos = filterTodos(todos, filter);

        return (
            <main className="App__main">
                <TodoHeader
                    onNewTodo={ this.handleNewTodo }
                    isEmpty={ todosCounts.total === 0 }
                    allCompleted={ todosCounts.remaining === 0 }
                    onAllCompletedToggle={ this.handleAllCompletedToggle } />

                { filteredTodos.length ? (
                    <ul className="App__todo-list">
                        { filteredTodos.map((todo) => (
                            <TodoItem
                                key={ todo.id }
                                todo={ todo }
                                onTitleChange={ this.handleTitleChange }
                                onCompleteChange={ this.handleCompleteChange }
                                onRemove={ this.handleRemove } />
                        )) }
                    </ul>
                ) : null }

                { todosCounts.total > 0 ? (
                    <TodoFooter
                        remainingCount={ todosCounts.remaining }
                        showClearCompleted={ todosCounts.completed > 0 }
                        filter={ filter }
                        onClearCompleted={ this.handleClearCompleted }
                        onFilterChange={ this.handleFilterChange } />
                ) : null }
            </main>
        );
    }

    handleNewTodo = (title) => todosStore.add(title);

    handleAllCompletedToggle = (completed) => todosStore.updateAllCompleted(completed);

    handleTitleChange = (id, title) => todosStore.updateTitle(id, title);

    handleCompleteChange = (id, completed) => todosStore.updateCompleted(id, completed);

    handleRemove = (id) => todosStore.remove(id);

    handleClearCompleted = () => todosStore.clearCompleted();

    handleFilterChange = (filter) => this.setState({ filter });
}

export default App;
