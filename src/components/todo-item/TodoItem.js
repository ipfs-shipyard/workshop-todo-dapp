import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TodoItem.css';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export default class TodoItem extends PureComponent {
    static propTypes = {
        todo: PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
        }),
        onCompleteChange: PropTypes.func.isRequired,
        onTitleChange: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    };

    static getDerivedStateFromProps(props, state) {
        return {
            ...state,
            editText: state.editing ? state.editText : props.todo.title,
        };
    }

    state = {
        editing: false,
    };

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.editing && this.state.editing) {
            this.editInputNode.focus();
            this.editInputNode.setSelectionRange(
                this.editInputNode.value.length,
                this.editInputNode.value.length
            );
        }
    }

    render() {
        const { todo } = this.props;
        const { editing, editText } = this.state;

        return (
            <li
                className={ classNames('TodoItem', {
                    'TodoItem--completed': todo.completed,
                    'TodoItem--editing': editing,
                }) }>
                <div
                    className="TodoItem__view">
                    <button
                        className="TodoItem__toggle"
                        onClick={ this.handleToggleClick } />
                    <span className="TodoItem__title" onDoubleClick={ this.handleTitleDoubleClick }>
                        { todo.title }
                    </span>
                    <button className="TodoItem__remove" onClick={ this.handleRemoveClick } />
                </div>
                <input
                    ref={ this.storeEditInputRef }
                    className="TodoItem__edit-input"
                    value={ editText }
                    onBlur={ this.handleEditInputBlur }
                    onChange={ this.handleEditInputChange }
                    onKeyDown={ this.handleEditInputKeyDown } />
            </li>
        );
    }

    storeEditInputRef = (ref) => {
        this.editInputNode = ref;
    };

    reportTitleChange = () => {
        const { todo } = this.props;
        const newTitle = this.state.editText.trim();

        this.setState({ editing: false });

        if (newTitle) {
            this.props.onTitleChange(todo.id, newTitle);
        } else {
            this.props.onRemove(todo.id);
        }
    };

    handleToggleClick = () =>
        this.props.onCompleteChange(this.props.todo.id, !this.props.todo.completed);

    handleTitleDoubleClick = () =>
        this.setState({ editing: true });

    handleEditInputBlur = () => this.reportTitleChange();

    handleEditInputKeyDown = (event) => {
        if (event.which === ESCAPE_KEY) {
            this.setState({ editText: this.props.todo.title });
        } else if (event.which === ENTER_KEY) {
            this.reportTitleChange();
        }
    };

    handleEditInputChange = (event) =>
        this.setState({ editText: event.target.value });

    handleRemoveClick = () =>
        this.props.onRemove(this.props.todo.id);
}
