import { AppSuperVariables } from "../layouts/app";
import AsideProfile from '../aside';

const ContextAside = (props) => {
	return (
		<AppSuperVariables.Consumer>
		{(context) => <AsideProfile context={context} handleChangeGraph={props.handleChangeGraph} /> }
		</AppSuperVariables.Consumer>
	)
}

export default ContextAside;