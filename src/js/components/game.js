import React from 'react';
import Board from '../components/board';

const POSSIBLE_VALUES = [1,2,3,4,5,6,7,8,9];

class Cell {

	constructor(x, y, value, dispatch) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.possibleValues = (value == null ? [...POSSIBLE_VALUES] : []);
		this.dispatch = dispatch;
	}

	setValue(value=this.possibleValues[0], force=false) {
		// console.log(`Changing value ${this.value} to ${value}`);
		if (typeof(value) === 'string')
			value = parseInt(value);

		if (this.possibleValues.indexOf(value) > -1 || value == null || force === true) {
			this.value = value;
			this.possibleValues = (value == null ? [...POSSIBLE_VALUES] : []);

			if (this.dispatch)
				this.dispatch({
					type: 'updatecells'
				});
			setTimeout(() => {}, 5);
			return true;
		}
		return false;
	}

	getValue() {
		return this.value;
	}

	removePossibleValue(possibleValue, setIfPossible) {
		let change = false;

		if (!this.value) {
			let index = this.possibleValues.indexOf(possibleValue);
			if (index > -1) {
				this.possibleValues.splice(index, 1);
				change = true;
			}

			if (setIfPossible && this.possibleValues.length == 1) {
				this.setValue(this.possibleValues[0]);
				change = true;
			}
		}

		return change;
	}

	getPossibleValues() {
		return this.possibleValues;
	}

}

export default class Game extends React.Component {
	constructor(props) {
		super(props);

		let count = 0;
		let values = new Array(9).fill(null);
		for (let i in values) {
			values[i] = new Array(9).fill(null);
			for (let j in values[i]) {
				let y = Math.floor(count / 9);
				let x = count++ % 9;
				values[y][x] = new Cell(y, x, this.props.values[x][y], this.props.store.dispatch);
			}
		}

		this.dfsCount = 0;

		this.state = {
			selectedCell: null,
			values: values
		}
	}

	componentDidMount() {
		this.unsub = this.props.store.subscribe(() => {
			this.setState(this.props.store.getState());
		});
	}

	getFirstEmptyCell() {
		for (let y in this.state.values) {
			for (let x in this.state.values[y]) {
				if (!this.state.values[x][y].getValue())
					return this.state.values[x][y];
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
			groupsAsLine.push([].concat(...groups[groupIndex]));

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

	dfsStep() {
		if (!this.isValid())
			return false;

		let {cell, possibleValues} = this.dfsStack[this.dfsStack.length - 1];

		while (possibleValues.length > 0) {
			let value = possibleValues.pop();
			cell.setValue(value, true);
			if (this.isValid())
				return true;
		}

		cell.setValue(null, true);
		return false;
	}

	dfs() {
		this.dfsCount++;
		
		// console.log("Call");
		// Check for completed, valid board
		if (!this.isValid())// && !console.log("Not valid"))
			return false;
		else if (this.isFinished() && !console.log("Finished"))
			return true;

		// Find all null cells (to revert if failure)
		let nullCells = []
		// for (let i in this.state.values)
		// 	for (let j in this.state.values)
		// 		if (this.state.values[i][j].getValue() == null)
		// 			nullCells.push(this.state.values[i][j]);

		// // Try logic
		// for (let i in this.state.values)
		// 	for (let j in this.state.values[i])
		// 		this.state.values[i][j].possibleValues = [...POSSIBLE_VALUES];
		// while (this.solveStep()) {}

		// Check completion again
		if (this.isFinished() && !console.log("Finished"))
			return true;

		// Get first empty cell
		let emptyCell = this.getFirstEmptyCell();
		console.log(`Trying cell: ${emptyCell.x}, ${emptyCell.y}`)
		// Loop through possible values for the 'first empty cell'
		let possibleValues = [...POSSIBLE_VALUES];
		while (possibleValues.length > 0) {

			// Call dfs on new values
			let value = possibleValues.pop();

			console.log(`Trying value: ${value}`);
			if (!emptyCell.setValue(value, true))
				continue;

			// If success, return success\
			if (this.dfs())
				return true;
			else
				emptyCell.setValue(null);
		}

		// Undo
		while (nullCells.length > 0)
			nullCells.pop().setValue(null);
		// emptyCell.setValue(null);
		// this.props.store.dispatch({
		// 	type: 'undo',
		// 	values: copy.values
		// });

		// Return failure
		// console.log("Exhausted values...");
		return false;
	}

	// TODO: Implement a system in which updating a cell value will trigger the related cells to
	//		 re-evaluate their possibleValues. This could improve the overall efficiency of the
	//		 algorithm and ultimately elimate the need for a long loop to perform calculations.
	//		 One possible (good) side-effect would be allowing React enough resources to render
	//		 the changes in real-time.
	eliminateChoices(line) {
		let change = false;

		// Set cells that only have a single possibility
		for (let cellIndex in line) {
			let cell = line[cellIndex];
			if (cell.getPossibleValues().length == 1)
				change |= cell.setValue();
		}

		// Find all values set in the current line/group
		let lineValues = [];
		for (let cellIndex in line) {
			let cell = line[cellIndex];
			if (cell.getValue())
				lineValues.push(cell.getValue());
		}

		// Remove all the values found in the line/group from the possible values
		for (let cellIndex in line) {
			let cell = line[cellIndex];
			for (let valueIndex in lineValues)
				change |= cell.removePossibleValue(lineValues[valueIndex]);
		}

		// Get a count for all the possible values in the current line/group
		let possibleCount = new Array(9).fill(0);
		for (let cellIndex in line) {
			let possibleValues = line[cellIndex].getPossibleValues();
			for (let possibleIndex in possibleValues) {
				possibleCount[possibleValues[possibleIndex]]++;
			}
		}

		// Determine if any of those possiblities occur only once
		let singles = [];
		for (let possibleIndex in possibleCount) {
			if (possibleCount[possibleIndex] == 1)
				singles.push(possibleIndex);
		}

		// For all possibilities that occur only once in the line/group, set the value
		for (let cellIndex in line) {
			let cell = line[cellIndex];
			for (let possibleIndex in singles) {
				let value = singles[possibleIndex];
				change |= cell.setValue(value); // Note: the cell will only set if it is included in the possible values
			}
		}

		return change;
	}

	getAllLinesAndGroupsAsLines() {
		return [...this.getColumns(),
				...this.getRows(),
				...this.getGroupsAsLines()];
	}

	dfsPromise() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (this.isFinished() && this.isValid())
					resolve('Finished!');
				else {
					if (this.dfsStep())
						this.dfsStack.push({
							cell: this.getFirstEmptyCell(),
							possibleValues: [...POSSIBLE_VALUES]
						});
					else
						this.dfsStack.pop();

					if (this.dfsStack.length == 0)
						reject('Unsolvable!');
					else
						resolve('dfs');
				}
			}, 0);

		}).then(resp => {
			if (resp === 'dfs')
				return this.dfsPromise();

			return resp;
		});
	}

	solvePromise() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (this.isFinished() && this.isValid())
					resolve('Finished!');
				else
					if (this.solveStep())
						resolve('logic');
					else
						resolve('dfs');
			}, 0);
		}).then(resp => {
			switch (resp) {
				case 'logic':
					return this.solvePromise();
				case 'dfs':
					this.dfsStack = [{
						cell: this.getFirstEmptyCell(),
						possibleValues: [...POSSIBLE_VALUES]
					}];
					return this.dfsPromise();
				default:
					return resp;
			}
		});
	}

	solve() {
		return this.solvePromise().then(resp => {
			if (resp === 'logic')
				this.solve();
			return resp
		}).catch(err => {
			console.error(err);
			throw err;
		});

		// if (this.isFinished() && this.isValid())
		// 	return true;
		// else
		// 	if (this.solveStep())
		// 		setTimeout(::this.solve, 0);
		// 	else
		// 		setTimeout(::this.dfs, 0);
	}

	solveStep() {
		let changed = false;

		let lines = this.getAllLinesAndGroupsAsLines();
		for (let lineIndex in lines)
			changed |= this.eliminateChoices(lines[lineIndex]);

		return changed;
	}

	onSolveClick() {
		this.solveButton.disabled = true;
		this.solveButton.innerHTML = 'Solving...';
		let start = performance.now();
		setTimeout(() => {
			this.solve().then((resp) => {
				this.solveButton.innerHTML = resp;
				this.solveButton.style.backgroudColor = 'green';
			}, (err) => {
				this.solveButton.innerHTML = err;
				this.solveButton.style.backgroudColor = 'red';
			}).then(() => {
				console.info(`Time: ${performance.now() - start}`);
			});
		}, 100);
		// setTimeout(() => {
		// 	this.solveButton.innerHTML = 'Solving...';
		// 	console.info("Starting logical solve.");
		// 	if (this.solve())
		// 		this.solveButton.innerHTML = 'Solved! :)'
		// 	else
		// 		this.solveButton.innerHTML = 'Unsolvable! :('
		// }, 100);
	}

	onCellClick(event) {
		let newSelectedCell = (this.state.selectedCell != event.target ? event.target : null);

		this.props.store.dispatch({
			type: 'cellselected',
			cell: newSelectedCell
		});
	}

	getSelectedCell() {
		let selectedCell = {
			x: null,
			y: null
		};

		if (this.state.selectedCell) {
			selectedCell.x = this.state.selectedCell.getAttribute('x');
			selectedCell.y = this.state.selectedCell.getAttribute('y');
		}

		return selectedCell;
	}

	render() {
		return (
			<div className="game">
				<div className="game-board">
					<Board values={this.state.values} onCellClick={::this.onCellClick} selectedCell={this.getSelectedCell()}/>
				</div>
				<button className="solve-button" onClick={::this.onSolveClick} ref={(button) => {this.solveButton = button;}}>Solve</button>
			</div>
		);
	}
}
