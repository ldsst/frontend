import { AppSuperVariables } from "../layouts/app";
import AsideTrade from '../asideTrade';

const ContextAsideTrade = (props) => {
	return (
		<AppSuperVariables.Consumer>
		{(context) => <AsideTrade context={context} handleChangeGraph={props.handleChangeGraph} /> }
		{/* {(context) => React.cloneElement(AsideTrade, {context}, null) } */}
		</AppSuperVariables.Consumer>
	)
}

export default ContextAsideTrade;