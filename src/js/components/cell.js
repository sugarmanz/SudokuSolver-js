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
		if (this.props.value && !this.props.value.getValue)
			console.log(this.props.value);
		return (this.props.value ? this.props.value.getValue() : '');
	}

	getClasses() {
		let x = this.props.x;
		let y = this.props.y;
		let selX = this.props.selectedCell.x;
		let selY = this.props.selectedCell.y;

		let sameX = (selX == x ? 1 : 0);
		let sameY = (selY == y ? 1 : 0);

		let sum = sameX + sameY;
		let className = 'cell' + (sum == 2 ? ' cell-focused' : (sum == 1 ? ' row-focused' : ''));

		if (!sum && selX !== null && x - (x % 3) == selX - (selX % 3) && y - (y % 3) == selY - (selY % 3))
			className += ' group-focused';

		if (this.props.error)
			className += ' cell-error';

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
