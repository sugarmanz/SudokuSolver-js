import React from 'react';
import Cell from '../components/cell';

export default class Group extends React.Component {

	constructor(props) {
		super(props);
	}

	onCellClick(x, y) {

	}

	renderGroupRow(y) {
		let x = (this.props.groupID % 3) * 3;

		return (
			<div className="group-row">
				<Cell onCellClick={this.props.onCellClick} clickedCell={this.props.clickedCell} value={this.props.values[x][y]} x={x++} y={y}/>
				<Cell onCellClick={this.props.onCellClick} clickedCell={this.props.clickedCell} value={this.props.values[x][y]} x={x++} y={y}/>
				<Cell onCellClick={this.props.onCellClick} clickedCell={this.props.clickedCell} value={this.props.values[x][y]} x={x++} y={y}/>
			</div>
		);
	}

	render() {
		let row = Math.floor(this.props.groupID / 3) * 3;

		return (
			<div className="group">
				{this.renderGroupRow(row++)}
				{this.renderGroupRow(row++)}
				{this.renderGroupRow(row++)}
			</div>
		);
	}

}