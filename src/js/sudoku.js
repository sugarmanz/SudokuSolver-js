import '../css/style';

import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/game';

import { createStore } from 'redux';

Object.defineProperties(Array.prototype, {
    count: {
        value: function(value, manipulate=((x)=>x)) {
            return this.reduce((total, x) => (manipulate(x) == value ? total+1 : total), 0);
        }
    }
});

const defaultValues = [
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null, null]
];

// Puzzle Easy
const easyValues = [
	[9, 7, null, null, null, null, null, 5, null],
	[null, null, 3, null, 8, null, 4, null, null],
	[null, 1, 2, null, null, 6, null, null, null],
	[null, null, null, 6, null, 5, null, 4, null],
	[2, null, 7, null, null, null, 6, null, 1],
	[null, 4, null, 7, null, 1, null, null, null],
	[null, null, null, 8, null, null, 5, 6, null],
	[null, null, 4, null, 7, null, 8, null, null],
	[null, 8, null, null, null, null, null, 9, 7]
];

const elevenStarValues = [
	[8, null, null, null, null, null, null, null, null],
	[null, null, 3, 6, null, null, null, null, null],
	[null, 7, null, null, 9, null, 2, null, null],
	[null, 5, null, null, null, 7, null, null, null],
	[null, null, null, null, 4, 5, 7, null, null],
	[null, null, null, 1, null, null, null, 3, null],
	[null, null, 1, null, null, null, null, 6, 8],
	[null, null, 8, 5, null, null, null, 1, null],
	[null, 9, null, null, null, null, 4, null, null]
];

const defaultState = {
	values: defaultValues,
	selectedCell: null
};

function reducer(state=defaultState, action) {
	switch (action.type) {
		case 'updatecells':
			return {};
		case 'cellselected':
			return {
				selectedCell: action.cell
			};
		case 'undo':
			return {
				values: action.values
			};
		default:
			return state;
	}
};

ReactDOM.render(<Game store={createStore(reducer)} values={easyValues}/>, document.getElementById('main'));
