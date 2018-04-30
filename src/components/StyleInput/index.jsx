import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const InputStyle = styled.div`
position: relative; 
margin-bottom: 24px; 
width: ${props => props.width};
max-width: ${props => props.width};
min-width: ${props => props.width};
transition: 0.2s ease all; 
-moz-transition: 0.2s ease all; 
-webkit-transition: 0.2s ease all;
&.disable-warning {
    margin-bottom: ${props => props.fontSize};
}

input {
    font-size: ${props => props.fontSize} !important;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 100%;
    border: none;
    border-bottom: 1px solid #757575;
    transition: 0.2s ease all; 
    -moz-transition: 0.2s ease all; 
    -webkit-transition: 0.2s ease all;

    &:focus {
        outline: none;
    }
}
label {
    color: ${props => props.fontColor} !important; 
    font-size: ${props => props.fontSize} !important;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 10px;
    transition: 0.2s ease all; 
    -moz-transition: 0.2s ease all; 
    -webkit-transition: 0.2s ease all;
}

/* active state */
input:focus ~ label, input:valid ~ label {
    top: calc(-1*0.8*${props => props.fontSize});
    font-size: ${props => props.fontSizeActive} !important;
    color: ${props => props.activeColor} !important;
    margin: 0px;
}

/* BOTTOM BARS ================================= */
.bar {
    position: relative;
    display: block;
    width: 100%;

    &:before, &:after {
        content: '';
        height: 2px; 
        width: 0;
        bottom: 1px; 
        position: absolute;
        background: ${props => props.highlightColor}; 
        transition: 0.2s ease all; 
        -moz-transition: 0.2s ease all; 
        -webkit-transition: 0.2s ease all;
    }

    &:before {
        background: ${props => props.activeColor};
        left: 50%;
    }

    &:after {
        background: ${props => props.activeColor};
        right: 50%;
    }
}

/* active state */
input:focus ~ .bar:before, input:focus ~ .bar:after {
    width: 50%;
}

/* HIGHLIGHTER ================================== */
.highlight {
    position: absolute;
    height: 60%; 
    width: 100%;
    top: 25%; 
    left: 0;
    pointer-events: none;
    opacity: 0.5;
}

/* active state */
input:focus ~ .highlight {
    -webkit-animation: inputHighlighter 0.3s ease;
    -moz-animation: inputHighlighter 0.3s ease;
    animation: inputHighlighter 0.3s ease;
}

.warning {
    color: red;
    opacity: 1;
    visibility: visible;
    transition: 0.2s ease all; 
    -moz-transition: 0.2s ease all; 
    -webkit-transition: 0.2s ease all;

    &.disable {
        opacity: 0;
        visibility: hidden;
        transition-delay: 0s;
    }
}

/* ANIMATIONS ================ */
@-webkit-keyframes inputHighlighter {
    from {
        background: ${props => props.highlightColor};
    }
    to 	{
        width: 0;
        background: transparent;
    }
}
@-moz-keyframes inputHighlighter {
    from {
        background: ${props => props.highlightColor};
    }
    to 	{
        width: 0;
        background: transparent;
    }
}
@keyframes inputHighlighter {
    from {
        background: ${props => props.highlightColor};
    }
    to 	{
        width: 0;
        background: transparent;
    }
}
`

const MaterialInput = ({
        label, width, highlightColor, activeColor, fontColor,
        fontSize, fontSizeActive, warning, isValidated, outerClass,
        ...props
    }) => {
    return (
        <InputStyle
            width={width ? width : '300px'}
            highlightColor={highlightColor ? highlightColor : '#5264AE'}
            activeColor={activeColor ? activeColor : '#5264AE'}
            fontColor={fontColor ? fontColor : '#999'}
            fontSize={fontSize ? fontSize : '18px'}
            fontSizeActive={fontSizeActive ? fontSizeActive : '14px'}
            className={`${isValidated ? 'disable-warning' : ''} ${outerClass ? outerClass : ''}`}
        >
            <input
                type="text"
                required={true}
                {...props}
            />
            <span className="highlight" />
            <span className="bar" />
            <label>{label ? label : ''}</label>
            <span className={`warning ${isValidated ? 'disable' : ''}`}>{warning}</span>
        </InputStyle>
    );
}

MaterialInput.defaultProps = {
    isValidated: true,
    warning: 'Test'
}

MaterialInput.propTypes = {
    isValidated: PropTypes.bool.isRequired,
    warning: PropTypes.string,
    outerClass: PropTypes.string
}

export default MaterialInput;