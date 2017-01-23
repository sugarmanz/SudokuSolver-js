import React from 'react';
import Board from '../components/board';

class Cell {

	constructor(x, y, value) {
		this.x = x;
		this.y = y;
		this.value = value;
	}

	setValue(value, callback) {
		this.value = value;
	}

	getValue() {
		return this.value;
	}

}

const POSSIBLE_VALUES = [1,2,3,4,5,6,7,8,9];
export default class Game extends React.Component {
	constructor(props) {
		super(props);

		let count = 0;
		let values = new Array(9).fill(null); //fill(new Array(9).fill(null));
		for (let i in values) {
			values[i] = new Array(9).fill(null);
			for (let j in values[i]) {
				let y = Math.floor(count / 9);
				let x = count++ % 9;
				values[y][x] = new Cell(x, y, this.props.values[x][y]);
			}
		}

		this.state = {
			currCell: null,
			values: values 

			// [
			// 	// Puzzle Empty
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null],
			// 	// [null,null,null,null,null,null,null,null,null]

			// 	// Puzzle Easy
			// 	[9,   null,null,null,2,   null,null,null,null],
			// 	[7,   null,1,   null,null,4,   null,null,8   ],
			// 	[null,3,   2,   null,7,   null,null,4,   null],
			// 	[null,null,null,6,   null,7,   8,   null,null],
			// 	[null,8,   null,null,null,null,null,7,   null],
			// 	[null,null,6,   5,   null,1,   null,null,null],
			// 	[null,4,   null,null,6,   null,5,   8,   null],
			// 	[5,   null,null,4,   null,null,6,   null,9   ],
			// 	[null,null,null,null,1,   null,null,null,7   ]

			// 	// Puzzle Eleven Star
			// 	// [8   ,null,null,null,null,null,null,null,null],
			// 	// [null,null,7   ,5   ,null,null,null,null,9   ],
			// 	// [null,3   ,null,null,null,null,1   ,8   ,null],
			// 	// [null,6   ,null,null,null,1   ,null,5   ,null],
			// 	// [null,null,9   ,null,4   ,null,null,null,null],
			// 	// [null,null,null,7   ,5   ,null,null,null,null],
			// 	// [null,null,2   ,null,7   ,null,null,null,4   ],
			// 	// [null,null,null,null,null,3   ,6   ,1   ,null],
			// 	// [null,null,null,null,null,null,8   ,null,null]
			// ]
		}
	}

	getFirstEmptyCell() {
		for (let y in this.state.values) {
			for (let x in this.state.values[y]) {
				if (!this.state.values[y][x].getValue())
					return this.state.values[y][x];
			}
		}
		return null;
	}

	getColumns() {
		return this.state.values;
	}

	getRows() {
		let rows = [];
		for (let i in this.state.values) {
			let row = [];
			for (let j in this.state.values) {
				row.push(this.state.values[j][i]);
			}
			rows.push(row);
		}

		return rows;
	}

	getGroup(groupID) {
		let group = [];
		let y = Math.floor(groupID / 3) * 3;
		
		for (let i = 0; i < 3; i++) {
			let groupRow = [];
			let x = (groupID % 3) * 3;

			for (let j = 0; j < 3; j++)
				groupRow.push(this.state.values[x++][y]);

			group.push(groupRow);
			y++;
		}

		return group;
	}

	getGroups() {
		let groups = [];

		for (let groupID in this.state.values)
			groups.push(this.getGroup(groupID));

		return groups;
	}

	getGroupsAsLines() {
		let groupsAsLine = [];
		let groups = this.getGroups();

		for (let groupIndex in groups)
			groupsAsLine.push([].concat.apply([], groups[groupIndex]));

		return groupsAsLine;
	}

	isLineValid(line) {
		for (let valIndex in POSSIBLE_VALUES)
			if (line.count(POSSIBLE_VALUES[valIndex], (x) => x.getValue()) > 1)
				return false;

		return true;
	}

	isValid() {
		let lines = [...this.getColumns(), ...this.getRows(), ...this.getGroupsAsLines()];
		for (let i in lines)
			if (!this.isLineValid(lines[i]))
				return false;

		// console.log("Valid");
		return true;
	}

	isFinished() {
		return !this.getFirstEmptyCell();
	}

	dfs() {
		// Check for completed, valid board
		if (!this.isValid())
			return false;
		else if (this.isFinished())
			return true;

		// Get first empty cell
		let emptyCell = this.getFirstEmptyCell(self);

		// Copy values to dfs_history state


		// Loop through possible values for the 'first empty cell'
		let possibleValues = [...POSSIBLE_VALUES];
		while (possibleValues.length > 0) {
			let value = possibleValues.pop();
			// console.log(`Trying value: ${value}`);

			// Call dfs on new values
			emptyCell.setValue(value);

			this.setState({
				values: this.state.values
			});

			// If success, return success
			if (this.dfs())
				return true;
		}

		// Undo
		emptyCell.setValue(null);

		// Return failure
		return false;
	}

	solve() {
		let finished = false;
		while (!finished) {
			break;
		}
	}

	onSolveClick() {
		this.solveButton.disabled = true;
		this.solveButton.innerHTML = 'Solving...';
		setTimeout(() => {
			if (this.dfs())
				this.solveButton.innerHTML = 'Solved! :)'
			else
				this.solveButton.innerHTML = 'Unsolvable! :('
		}, 1);
	}

	onCellClick(event) {
		let clicked = event.target;

		if (this.state.currCell)
			this.state.currCell.classList.remove('cell-focused');

		let newCurrCell = null;
		if (this.state.currCell != clicked) {
			newCurrCell = clicked;
			newCurrCell.classList.add('cell-focused');
		}

		this.setState({
			currCell: newCurrCell
		});
	}

	getClickedCell() {
		if (this.state.currCell)
			return {
				x: this.state.currCell.getAttribute('x'),
				y: this.state.currCell.getAttribute('y')
			};

		return {
			x: null,
			y: null
		};
	}

	render() {
		return (
			<div className="game">
				<div className="game-board">
					<Board values={this.state.values} onCellClick={::this.onCellClick} clickedCell={this.getClickedCell()}/>
				</div>
				<button className="solve-button" onClick={::this.onSolveClick} ref={(button) => {this.solveButton = button;}}>Solve</button>
			</div>
		);
	}
}
