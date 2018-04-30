import styled from 'styled-components';
import React from 'react';

const LoaderWrapper = styled.div`
display: inline-block;
position: relative;
transform: scale(0.7);
transform-origin: 0% 50%;
max-width: 32px;
width: 32px;
min-width: 32px;
& > *, &::after, &::before {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.loader-3 {
    display: block;
	height: 32px;
	width: 32px;
}
.loader-3 span {
	display: block;
	position: absolute;
	/* top: 0; left: 0;
	bottom: 0; right: 0; */
	margin: auto;
	height: 32px;
	width: 32px;
}
.loader-3 span::before {
	content: "";
	display: block;
	position: absolute;
	top: 0; left: 0;
	bottom: 0; right: 0;
	margin: auto;
	height: 32px;
	width: 32px;
	border: 3px solid #72C2F3;
	border-bottom: 3px solid transparent;
	border-radius: 50%;
	-webkit-animation: loader-3-1 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite;
	        animation: loader-3-1 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite;
}
@-webkit-keyframes loader-3-1 {
	0%   { -webkit-transform: rotate(0deg); }
	40%  { -webkit-transform: rotate(180deg); }
	60%  { -webkit-transform: rotate(180deg); }
	100% { -webkit-transform: rotate(360deg); }
}
@keyframes loader-3-1 {
	0%   { transform: rotate(0deg); }
	40%  { transform: rotate(180deg); }
	60%  { transform: rotate(180deg); }
	100% { transform: rotate(360deg); }
}
.loader-3 span::after {
	content: "";
	position: absolute;
	top: 0; left: 0;
	bottom: 0; right: 0;
	margin: auto;
	width: 6px;
	height: 6px;
	background: #7ECAF3;
	border-radius: 50%;
	-webkit-animation: loader-3-2 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite;
	        animation: loader-3-2 1.5s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite;
}
@-webkit-keyframes loader-3-2 {
	0%   { -webkit-transform: translate3d(0, -32px, 0) scale(0, 2); opacity: 0; }
	50%  { -webkit-transform: translate3d(0, 0, 0) scale(1.25, 1.25); opacity: 1; }
	100% { -webkit-transform: translate3d(0, 8px, 0) scale(0, 0); opacity: 0; }
}
@keyframes loader-3-2 {
	0%   { transform: translate3d(0, -32px, 0) scale(0, 2); opacity: 0; }
	50%  { transform: translate3d(0, 0, 0) scale(1.25, 1.25); opacity: 1; }
	100% { transform: translate3d(0, 8px, 0) scale(0, 0); opacity: 0; }
}
`;

const Loader = (props) => {
    return (
        <LoaderWrapper {...props}>
            <div className="loader-3"><span></span></div>
        </LoaderWrapper>
    );
}

export default Loader;