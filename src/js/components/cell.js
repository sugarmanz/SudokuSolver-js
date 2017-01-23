import React from 'react';

export default class Cell extends React.Component {

	constructor(props) {
		super(props);

		// this.state = {
		// 	value: this.props.coords
		// };
	}

	componentDidMount() {
		// this.unsub = this.props.store.subscribe(() => {
		// 	// TODO: Consider checking for change
		// 	this.setState(this.props.store.getState().values[this.props.y][this.props.x]);
		// });
	}

	renderValue() {
		return (this.props.value ? this.props.value.getValue() : '');
	}

	getClasses() {
		let sameX = (this.props.clickedCell.x == this.props.x ? 1 : 0);
		let sameY = (this.props.clickedCell.y == this.props.y ? 1 : 0);

		let sum = sameX + sameY;
		let className = 'cell' + (sum == 2 ? ' cell-focused' : (sum == 1 ? ' row-focused' : ''));
		
		return className;
	}

	render() {
		return (
			<div className={this.getClasses()} onClick={this.props.onCellClick} x={this.props.x} y={this.props.y}>
				{this.renderValue()}
			</div>
		);
	}

}
