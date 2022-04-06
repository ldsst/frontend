import { AppSuperVariables } from './layouts/app';

class MobileFixedFooter extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<AppSuperVariables.Consumer>
				{context => (
					<footer className="just_mobile mobile_fixed_footer">
						<button
							onClick={() => {
								context.openAside();
								context.buyAsideTrue();
							}}
						>
							COMPRAR
						</button>
						<button
							onClick={() => {
								context.openAside();
								context.buyAsideFalse();
							}}
						>
							VENDER
						</button>
					</footer>
				)}
			</AppSuperVariables.Consumer>
		);
	}
}

export default MobileFixedFooter;
