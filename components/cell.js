import React from 'react';

export default class Cell extends React.Component {

	constructor() {
		super();

		// this.state = {
		// 	value: this.props.coords
		// };
	}

	render() {
		return (
			<div className="cell">
				{this.props.x * this.props.y}
			</div>
		);
	}

}
