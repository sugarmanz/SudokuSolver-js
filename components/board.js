import React from 'react';
import Cell from '../components/cell'

export default class Board extends React.Component {
	constructor() {
		super();
	}

	renderRow(row) {
		return (
			<div className="board-row">
				<Cell coords={row + ",0"} x='0' y={row}/>
				<Cell coords={row + ",1"} x='1' y={row}/>
				<Cell coords={row + ",2"} x='2' y={row}/>
				<Cell coords={row + ",3"} x='3' y={row}/>
				<Cell coords={row + ",4"} x='4' y={row}/>
				<Cell coords={row + ",5"} x='5' y={row}/>
				<Cell coords={row + ",6"} x='6' y={row}/>
				<Cell coords={row + ",7"} x='7' y={row}/>
				<Cell coords={row + ",8"} x='8' y={row}/>
			</div>
		);
	}

	render() {
		return (
			<div className="board">
				{this.renderRow(0)}
				{this.renderRow(1)}
				{this.renderRow(2)}
				{this.renderRow(3)}
				{this.renderRow(4)}
				{this.renderRow(5)}
				{this.renderRow(6)}
				{this.renderRow(7)}
				{this.renderRow(8)}
			</div>
		);
	}
}
