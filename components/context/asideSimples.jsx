import { AppSuperVariables } from "../layouts/app";
import AsideSimples from '../asideSimples';

const ContextAside = (props) => {
	return (
		<AppSuperVariables.Consumer>
		{(context) => <AsideSimples context={context} /> }
		</AppSuperVariables.Consumer>
	)
}

export default ContextAside;