import memoize from 'memoize-one';

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

export { filterTodos, calculateTodosCounts };
