import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './TodoHeader.css';

const ENTER_KEY = 13;

export default class TodoHeader extends PureComponent {
    static propTypes = {
        onNewTodo: PropTypes.func.isRequired,
    };

    state = { newTodo: '' };

    render() {
        return (
            <div className="TodoHeader">
                <input
                    className="TodoHeader__input"
                    placeholder="What needs to be done?"
                    value={ this.state.newTodo }
                    onKeyDown={ this.handleKeyDown }
                    onChange={ this.handleChange }
                    autoFocus />
            </div>
        );
    }

    handleKeyDown = (event) => {
        if (event.keyCode !== ENTER_KEY) {
            return;
        }

        const title = this.state.newTodo.trim();

        if (title) {
            this.props.onNewTodo(title);
            this.setState({ newTodo: '' });
        }
    };

    handleChange = (event) =>
        this.setState({ newTodo: event.target.value });
}
