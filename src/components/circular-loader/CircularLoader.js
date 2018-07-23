import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './CircularLoader.css';

const CircularLoader = ({ className, ...rest }) => {
    const finalClassName = classNames(
        'CircularLoader',
        className
    );

    return (
        <span { ...rest } className={ finalClassName }>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
        </span>
    );
};

CircularLoader.propTypes = {
    className: PropTypes.string,
};

export default CircularLoader;
