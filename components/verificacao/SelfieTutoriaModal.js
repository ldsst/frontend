import React from 'react';

class SelfieTutorialModal extends React.Component {
	render() {
		return (
			<div className="screen-overlay">
				<div
					onClick={e => e.stopPropagation()}
					className="overlay-deposito"
					style={{ width: '40vw', height: 'auto', zIndex:99999 }}
				>
					<header className="overlay-deposito__header">
						<h3>Tutorial - Envio de selfie</h3>
						<button
							onClick={() => this.props.handleClose(false)}
							className="overlay-deposito__close"
						>
							<img src="/static/img/cancel.svg" />
						</button>
					</header>
					<div className="overlay-deposito__content" style={{padding:'15px'}}>

						<img src="/static/img/SELFIE.jpg" alt="" style={{width:'100%'}}/>

					</div>
				</div>
			</div>
		);
	}
}

export default SelfieTutorialModal;
