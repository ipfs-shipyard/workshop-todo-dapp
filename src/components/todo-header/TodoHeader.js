import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TodoHeader.css';

const ENTER_KEY = 13;

export default class TodoHeader extends PureComponent {
    static propTypes = {
        counts: PropTypes.shape({
            total: PropTypes.number.isRequired,
            remaining: PropTypes.number.isRequired,
            completed: PropTypes.number.isRequired,
        }),
        onNewTodo: PropTypes.func.isRequired,
        onAllCompletedToggle: PropTypes.func.isRequired,
    };

    state = { newTodo: '' };

    render() {
        const { counts } = this.props;

        return (
            <div className="TodoHeader">
                { counts.total > 0 ? (
                    <button
                        className={ classNames('TodoHeader__toggle-all', {
                            'TodoHeader__toggle-all--active': counts.remaining === 0,
                        }) }
                        onClick={ this.handleToggleAllClick } />
                ) : null }

                <input
                    className="TodoHeader__new-input"
                    placeholder="What needs to be done?"
                    value={ this.state.newTodo }
                    onKeyDown={ this.handleNewTodoKeyDown }
                    onChange={ this.handleNewTodoChange }
                    autoFocus />
            </div>
        );
    }

    handleNewTodoKeyDown = (event) => {
        if (event.keyCode !== ENTER_KEY) {
            return;
        }

        const title = this.state.newTodo.trim();

        if (title) {
            this.props.onNewTodo(title);
            this.setState({ newTodo: '' });
        }
    };

    handleNewTodoChange = (event) =>
        this.setState({ newTodo: event.target.value });

    handleToggleAllClick = () =>
        this.props.onAllCompletedToggle(this.props.counts.remaining > 0);
}
