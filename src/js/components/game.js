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
		this.error = null;
	}

	setValue(value=this.possibleValues[0], force=false) {
		if (this.value == value)
			return false;

		if (typeof(value) === 'string')
			value = parseInt(value);

		if (this.possibleValues.indexOf(value) > -1 || value == null || force === true) {
			this.value = value;
			this.possibleValues = (value == null ? [...POSSIBLE_VALUES] : []);

			if (this.dispatch)
				this.dispatch({
					type: 'updatecells'
				});

			return true;
		}
		return false;
	}

	getValue() {
		return this.value;
	}

	setError(err) {
		this.error = err;
	}

	getError() {
		return this.error;
	}

	resetPossibleValues() {
		this.possibleValues = (this.value == null ? [...POSSIBLE_VALUES] : []);
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

		let values = this.initialize();

		this.state = {
			selectedCell: null,
			values: values
		}
	}

	initialize() {
		let values = this.props.values.map((row, y) => {
			return row.map((cellValue, x) => {
				return new Cell(x, y, cellValue, this.props.store.dispatch);	
			});
		});

		return values;
	}

	componentDidMount() {
		this.unsub = this.props.store.subscribe(() => {
			this.setState(this.props.store.getState());
		});
	}

	getFirstEmptyCell() {
		for (let row of this.state.values)
			for (let cell of row)
				if (!cell.getValue())
					return cell;
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

		for (let group of groups)
			groupsAsLine.push([].concat(...group));

		return groupsAsLine;
	}

	isLineValid(line) {
		for (let value of POSSIBLE_VALUES)
			if (line.count(value, (x) => x.getValue()) > 1) {
				line.forEach((cell) => {
					cell.setError(true);
				});
				return false;
			}

		line.forEach((cell) => {
			cell.setError(false);
		});

		return true;
	}

	isValid() {
		let lines = [...this.getColumns(), ...this.getRows(), ...this.getGroupsAsLines()];
		for (let line of lines)
			if (!this.isLineValid(line))
				return false;

		return true;
	}

	isFinished() {
		return !this.getFirstEmptyCell();
	}

	resetPossibleValues() {
		for (let row of this.state.values)
			for (let cell of row)
				cell.resetPossibleValues();
	}

	dfsStep() {
		let {cell, possibleValues, nullCells} = this.dfsStack[this.dfsStack.length - 1];
		let needToClearNullCells = true;

		if (!this.isValid() || !cell)
			return false;

		while (possibleValues.length > 0) {
			let value = (Math.random() >= 0.5 ? possibleValues.shift() : possibleValues.pop());

			if (needToClearNullCells) {
				for (let nullCell of nullCells)
					if (nullCell.getValue())
						nullCell.setValue(null);
				needToClearNullCells = false;
			}

			cell.setValue(value, true);

			if (this.isValid()) {

				this.resetPossibleValues();

				while (this.solveStep()) {}

				if (!this.isValid()) {
					needToClearNullCells = true;
					continue;
				}

				return true;
			}
		}

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
		for (let cell of line)
			if (cell.getPossibleValues().length == 1)
				change |= cell.setValue();

		// Find all values set in the current line/group
		let lineValues = [];
		for (let cell of line)
			if (cell.getValue())
				lineValues.push(cell.getValue());

		// Remove all the values found in the line/group from the possible values
		for (let cell of line)
			for (let value of lineValues)
				change |= cell.removePossibleValue(value);

		// Get a count for all the possible values in the current line/group
		let possibleCount = new Array(9).fill(0);
		for (let cell of line)
			for (let possibleValue of cell.getPossibleValues())
				possibleCount[possibleValue]++;

		// Determine if any of those possiblities occur only once
		let singles = [];
		for (let possibleIndex in possibleCount)
			if (possibleCount[possibleIndex] == 1)
				singles.push(possibleIndex);

		// For all possibilities that occur only once in the line/group, set the value
		for (let cell of line)
			for (let value of singles)
				change |= cell.setValue(value);

		return change;
	}

	getAllLinesAndGroupsAsLines() {
		return [...this.getColumns(),
				...this.getRows(),
				...this.getGroupsAsLines()];
	}

	getNullCells() {
		let nullCells = [];

		for (let row of this.state.values)
			for (let cell of row)
				if (!cell.getValue())
					nullCells.push(cell);

		return nullCells;
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
							possibleValues: [...POSSIBLE_VALUES],
							nullCells: this.getNullCells()
						});
					else
						for (let nullCell of this.dfsStack.pop().nullCells)
							if (nullCell.getValue())
								nullCell.setValue(null);

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
						possibleValues: [...POSSIBLE_VALUES],
						nullCells: this.getNullCells()
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
	}

	solveStep() {
		let changed = false;

		let lines = this.getAllLinesAndGroupsAsLines();
		for (let line of lines)
			changed |= this.eliminateChoices(line);

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
				console.info(`Time: ${(performance.now() - start) / 1000} seconds`);
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

	onResetClick() {
		this.state.values = this.initialize();
		this.solveButton.innerHTML = 'Solve';
		this.solveButton.disabled = false;

		this.props.store.dispatch({
			type: 'updatecells'
		});
	}

	render() {
		return (
			<div className="game">
				<div className="game-board">
					<Board values={this.state.values} onCellClick={::this.onCellClick} selectedCell={this.getSelectedCell()}/>
				</div>
				<button className="reset-button" onClick={::this.onResetClick} ref={(button) => {this.resetButton = button;}}>Reset</button>
				<button className="solve-button" onClick={::this.onSolveClick} ref={(button) => {this.solveButton = button;}}>Solve</button>
			</div>
		);
	}
}
