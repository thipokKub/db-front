import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import PropTypes from 'prop-types';

const SelectBoxWrapper = styled.div`
select {
  background-color: white;
  border: thin solid rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  font: inherit;
  line-height: 1.5em;
  box-sizing: border-box;
  padding: 0.2em 3.5em 0.1em 1em;
  width: auto;
  /* reset */
  margin: 0;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #aaa 50%), linear-gradient(135deg, #aaa 50%, transparent 50%), linear-gradient(to right, #ccc, #ccc);
  background-position: calc(100% - 1.25em) calc(50% + 0.05*0.375em), calc(100% - 0.9em) calc(50% + 0.05*0.375em), calc(100% - 2.5em) 0.125em;
  background-size: 0.375em 0.375em, 0.375em 0.375em, 1px 1.6em;
  background-repeat: no-repeat; }
  select option {
    width: 100%; }
  select:focus {
    background-image: linear-gradient(45deg, #3190FF 50%, transparent 50%), linear-gradient(135deg, transparent 50%, #3190FF 50%), linear-gradient(to right, #3190FF 50%, #3190FF 50%);
    background-position: calc(100% - 0.9em) calc(50% + 0.05*0.375em), calc(100% - 1.25em) calc(50% + 0.05*0.375em), calc(100% - 2.5em) 0.125em;
    background-size: 0.375em 0.375em, 0.375em 0.375em, 1px 1.6em;
    background-repeat: no-repeat;
    border-color: #3190FF;
    color: #3190FF;
    outline: 0; }
  select:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000; }
`;

const SelectBox = (props) => {
    const { onChange, value, refFunc, ...other } = props;
    return (
        <SelectBoxWrapper>
            <select
                {...other}
                onClick={onChange}
                onChange={onChange}
                value={value}
                className={`${_.get(other, 'className', '')}`}
                ref={(me) => {
                    typeof refFunc === "function" && refFunc(me)
                }}
            >
                {
                    _.get(other, 'options', []).map((text, index) => {
                        return (
                            <option value={text} key={index}>{text}</option>
                        );
                    })
                }
            </select>
        </SelectBoxWrapper>
    );
}

SelectBox.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    refFunc: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string
}

export default SelectBox;