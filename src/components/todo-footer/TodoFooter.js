import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pluralize from 'pluralize';
import './TodoFooter.css';

export default class TodoFooter extends PureComponent {
    static propTypes = {
        counts: PropTypes.shape({
            total: PropTypes.number.isRequired,
            remaining: PropTypes.number.isRequired,
            completed: PropTypes.number.isRequired,
        }),
        filter: PropTypes.oneOf(['all', 'active', 'completed']),
        onClearCompleted: PropTypes.func.isRequired,
        onFilterChange: PropTypes.func.isRequired,
    };

    render() {
        const { counts, filter } = this.props;
        const todoWord = pluralize('todo', counts.remaining);

        return (
            <div className="TodoFooter">
                <span className="TodoFooter__count">
                    <strong>{ counts.remaining }</strong> { todoWord } left
                </span>
                <ul className="TodoFooter__filters">
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filter === 'all',
                        }) }
                        onClick={ this.handleFilterAllClick }>
                        All
                    </li>
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filter === 'active',
                        }) }
                        onClick={ this.handleFilterActiveClick }>
                        Active
                    </li>
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filter === 'completed',
                        }) }
                        onClick={ this.handleFilterCompletedClick }>
                        Completed
                    </li>
                </ul>

                <button
                    className={ classNames('TodoFooter__clear-completed', {
                        'TodoFooter__clear-completed--hidden': counts.completed === 0,
                    }) }
                    onClick={ this.handleClearCompletedClick }>
                    Clear completed
                </button>
            </div>
        );
    }

    handleFilterAllClick = () => this.props.onFilterChange('all');

    handleFilterActiveClick = () => this.props.onFilterChange('active');

    handleFilterCompletedClick = () => this.props.onFilterChange('completed');

    handleClearCompletedClick = () => this.props.onClearCompleted();
}
