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

	initialize(initialValues=this.props.values) {
		let values = initialValues.map((row, y) => {
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

	nullifyPromise(nullCells) {
		return new Promise((resolve, reject) => {
			for (let nullCell of nullCells)
				setTimeout(() => {
					if (nullCell.getValue())
						nullCell.setValue(null);
				}, 0);
			resolve();
		}).then(resp => {
			// if (nullCells.length != 0)
			// 	return nullifyPromise(nullCells);
			// else
				return resp;
		});
	}

	dfsStep() {
		let {cell, possibleValues, nullCells} = this.dfsStack[this.dfsStack.length - 1];

		if (!this.isValid() || !cell)
			return false;

		while (possibleValues.length > 0) {
			let value = (Math.random() >= 0.5 ? possibleValues.shift() : possibleValues.shift());

			cell.setValue(value, true);

			if (this.isValid())
				return true;
		}

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
				if (!this.isValid())
					resolve('Invalid!');
				else if (this.isFinished())
					resolve('Finished!');
				else {
					let res;

					if (this.dfsStep())
						res = 'logic';
					else
						res = 'dfs';

					if (this.dfsStack.length == 0)
						reject('Unsolvable!');
					else
						resolve(res);
				}
			}, 0);

		}).then(resp => {
			switch (resp) {
				case 'logic':
					this.resetPossibleValues();
					return this.solvePromise();
				case 'dfs':
					this.dfsStack.pop();
				case 'Invalid!':
					return this.nullifyPromise(this.dfsStack[this.dfsStack.length - 1].nullCells).then(resp => {
						return this.dfsPromise();
					});
				default:
					return resp;
			}
		});
	}

	solvePromise() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (!this.isValid())
					resolve('Invalid!');
				else if (this.isFinished())
					resolve('Finished!');
				else
					if (this.solveStep())
						if (this.isValid())
							resolve('logic');
						else
							resolve('Invalid!');
					else
						resolve('dfs');
			}, 0);
		}).then(resp => {
			switch (resp) {
				case 'logic':
					return this.solvePromise();
				case 'dfs':
					this.dfsStack.push({
						cell: this.getFirstEmptyCell(),
						possibleValues: [...POSSIBLE_VALUES],
						nullCells: this.getNullCells()
					});
					return this.dfsPromise();
				case 'Invalid!':
					return this.nullifyPromise(this.dfsStack[this.dfsStack.length - 1].nullCells).then(resp => {
						return this.dfsPromise();
					});
				default:
					return resp;
			}
		});
	}

	solve() {
		this.dfsStack = [];
		return this.solvePromise().then(resp => {
			if (resp === 'logic')
				return this.solvePromise();
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
				this.solveButton.style.backgroundColor = 'green';
			}, (err) => {
				this.solveButton.innerHTML = err;
				this.solveButton.style.backgroundColor = 'red';
			}).then(() => {
				console.info(`Time: ${(performance.now() - start) / 1000} seconds`);
			});
		}, 0);
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

	onSaveClick() {
		let name = prompt("Puzzle name: ", `puzzle${Math.round(performance.now())}`);
		let values = this.state.values.map(row => {
			return row.map(cell => {
				return cell.getValue();
			});
		});

		localStorage.setItem(name + '.puzzle', JSON.stringify(values));
	}

	renderOptions() {
		let options = [];
		for (let name in localStorage)
			if (name.slice(name.lastIndexOf('.')) === '.puzzle')
				options.push(<option value={name}>{name}</option>);

		return options;
	}

	onPuzzleChange(event) {
		console.log(event.target.value);

		// let values = localStorage.getItem(event.target.value);
		// this.initialize(JSON.parse(values));
	}

	onLoadClick() {
		let name = this.puzzleSelect.value;
		this.props.store.dispatch({
			type: 'loadcells',
			cells: this.initialize(JSON.parse(localStorage.getItem(name)))
		});
	}

	render() {
		return (
			<div className="game">
				<select className="puzzle-select" ref={(select) => {this.puzzleSelect = select;}} onchange={::this.onPuzzleChange}>
					{this.renderOptions()}
				</select>
				<div className="game-board">
					<Board values={this.state.values} onCellClick={::this.onCellClick} selectedCell={this.getSelectedCell()}/>
				</div>
				<button className="reset-button" onClick={::this.onResetClick} ref={(button) => {this.resetButton = button;}}>Reset</button>
				<button className="solve-button" onClick={::this.onSolveClick} ref={(button) => {this.solveButton = button;}}>Solve</button>
				<button className="solve-button" onClick={::this.onSaveClick} ref={(button) => {this.saveButton = button;}}>Save</button>
				<button className="solve-button" onClick={::this.onLoadClick} ref={(button) => {this.loadButton = button;}}>Load</button>
			</div>
		);
	}
}
