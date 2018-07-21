import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TodoItem.css';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export default class TodoItem extends PureComponent {
    static propTypes = {
        todo: PropTypes.object.isRequired,
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
                    <input
                        className="TodoItem__toggle"
                        type="checkbox"
                        checked={ todo.completed }
                        onChange={ this.handleToggleChange } />
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

        if (newTitle === this.props.todo.title) {
            return;
        }

        if (newTitle) {
            this.props.onTitleChange(todo.id, newTitle);
        } else {
            this.props.onRemove(todo.id);
        }
    };

    handleToggleChange = (event) =>
        this.props.onCompleteChange(this.props.todo.id, event.target.checked);

    handleTitleDoubleClick = () =>
        this.setState({ editing: true });

    handleEditInputBlur = () => {
        this.setState({ editing: false });
        this.reportTitleChange();
    };

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
