import React, { Component } from 'react';
import TodoHeader from './components/todo-header';
import TodoItem from './components/todo-item';
import TodoFooter from './components/todo-footer';
import './App.css';

const todoList = [
    { id: '1', title: 'Buy candies', completed: false },
    { id: '2', title: 'Finish DApp', completed: true },
    { id: '3', title: 'Finish presentation', completed: false },
];

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App__header">
                    <h1>todos</h1>
                </header>

                <main className="App__main">
                    <TodoHeader
                        onNewTodo={ this.handleNewTodo } />

                    <ul className="App__todo-list">
                        { todoList.map((todo) => (
                            <TodoItem
                                key={ todo.id }
                                todo={ todo }
                                onTitleChange={ this.handleTitleChange }
                                onCompleteChange={ this.handleCompleteChange }
                                onRemove={ this.handleRemove } />
                        )) }
                    </ul>

                    <TodoFooter
                        remainingCount={ 2 }
                        completedCount={ 2 }
                        filtering="all"
                        onClearCompleted={ this.handleClearCompleted }
                        onFilterChange={ this.handleFilterChange } />
                </main>

                <footer className="App__footer">
                    <p>Double-click to edit a todo</p>
                    <p>Based on the work of <a href="http://github.com/petehunt/">petehunt</a></p>
                    <p>Slightly modified version of <a href="http://todomvc.com">TodoMVC</a></p>
                </footer>
            </div>
        );
    }

    handleNewTodo = (title) => console.log('new todo', title);

    handleTitleChange = (id, title) => console.log('title change', id, title);

    handleCompleteChange = (id, completed) => console.log('complete change', id, completed);

    handleRemove = (id) => console.log('remove', id);

    handleClearCompleted = () => console.log('clear completed');

    handleFilterChange = (filter) => console.log('filter change', filter);
}

export default App;
