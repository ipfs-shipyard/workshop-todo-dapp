import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pluralize from 'pluralize';
import './TodoFooter.css';

export default class TodoFooter extends PureComponent {
    static propTypes = {
        remainingCount: PropTypes.number.isRequired,
        completedCount: PropTypes.number.isRequired,
        filtering: PropTypes.oneOf(['all', 'active', 'completed']),
        onClearCompleted: PropTypes.func.isRequired,
        onFilterChange: PropTypes.func.isRequired,
    };

    render() {
        const { remainingCount, completedCount, filtering } = this.props;
        const todoWord = pluralize('todo', remainingCount);

        return (
            <div className="TodoFooter">
                <span className="TodoFooter__count">
                    <strong>{ remainingCount }</strong> { todoWord } left
                </span>
                <ul className="TodoFooter__filters">
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filtering === 'all',
                        }) }
                        onClick={ this.handleFilterAllClick }>
                        All
                    </li>
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filtering === 'active',
                        }) }
                        onClick={ this.handleFilterActiveClick }>
                        Active
                    </li>
                    <li
                        className={ classNames('TodoFooter__filter', {
                            'TodoFooter__filter--selected': filtering === 'completed',
                        }) }
                        onClick={ this.handleFilterCompletedClick }>
                        Completed
                    </li>
                </ul>

                { completedCount > 0 ? (
                    <button
                        className="TodoFooter__clear-completed"
                        onClick={ this.handleClearCompletedClick }>
                        Clear completed
                    </button>
                ) : null }
            </div>
        );
    }

    handleFilterAllClick = () => this.props.onFilterChange('all');

    handleFilterActiveClick = () => this.props.onFilterChange('active');

    handleFilterCompletedClick = () => this.props.onFilterChange('completed');

    handleClearCompletedClick = () => this.props.onClearCompleted();
}
