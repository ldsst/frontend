import React from 'react';

const loader = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		}}
	>
		<div className="loading-icon" style={{ marginTop: 0 }}>
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
);

export default loader;
