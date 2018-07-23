import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import TodoHeader from './components/todo-header';
import TodoItem from './components/todo-item';
import TodoFooter from './components/todo-footer';
import CircularLoader from './components/circular-loader';
import todosStore from './todos-store';
import memoize from 'memoize-one';
import './App.css';

const filterTodos = memoize((todos, filter) => {
    switch (filter) {
    case 'active':
        return todos.filter((todo) => !todo.completed);
    case 'completed':
        return todos.filter((todo) => todo.completed);
    default:
        return todos;
    }
});

const calculateTodosCounts = memoize((todos) => {
    const completed = todos.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0);

    return {
        total: todos.length,
        remaining: todos.length - completed,
        completed,
    };
});

class App extends Component {
    state = {
        loading: true,
        error: null,
        todos: null,
        filter: 'all',
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
    }

    render() {
        const { loading, error, todos } = this.state;

        return (
            <div className="App">
                <header className="App__header">
                    <h1>todos</h1>
                </header>

                <main className={ classNames('App__main', {
                    'App__main--loading': loading,
                    'App__main--errored': error,
                }) }>
                    { loading ? <CircularLoader /> : null }
                    { error ? <div>An error occurred while loading the todos</div> : null }
                    { todos ? this.renderTodos() : null }
                </main>

                <footer className="App__footer">
                    <p>Double-click to edit a todo</p>
                    <p>Based on the work of <a href="http://github.com/petehunt/">petehunt</a></p>
                    <p>Slightly modified version of <a href="http://todomvc.com">TodoMVC</a></p>
                </footer>
            </div>
        );
    }

    renderTodos() {
        const { todos, filter } = this.state;
        const todosCounts = calculateTodosCounts(todos);
        const filteredTodos = filterTodos(todos, filter);

        return (
            <Fragment>
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
            </Fragment>
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
