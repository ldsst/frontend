import { AppSuperVariables } from "../layouts/app";
import Header from '../header';

const ContextHeader = (props) => {
	return (
		<AppSuperVariables.Consumer>
		{(context) => <Header context={context} page={props.page} /> }
		</AppSuperVariables.Consumer>
	)
}

export default ContextHeader;