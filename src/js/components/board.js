import React from 'react';
import Group from '../components/group'

export default class Board extends React.Component {
	constructor(props) {
		super(props);
	}

	renderGroupRow(row) {
		let x = row * 3;

		return (
			<div className="board-group-row">
				<Group onCellClick={this.props.onCellClick} groupID={x++} values={this.props.values} clickedCell={this.props.clickedCell}/>
				<Group onCellClick={this.props.onCellClick} groupID={x++} values={this.props.values} clickedCell={this.props.clickedCell}/>
				<Group onCellClick={this.props.onCellClick} groupID={x++} values={this.props.values} clickedCell={this.props.clickedCell}/>
			</div>
		);
	}

	render() {
		return (
			<div className="board">
				{this.renderGroupRow(0)}
				{this.renderGroupRow(1)}
				{this.renderGroupRow(2)}
			</div>
		);
	}
}
