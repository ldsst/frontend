import dynamic from 'next/dynamic';
import ContextAsideTrade from '../components/context/asideTrade';
import ContextHeader from '../components/context/header';
import { connect } from 'react-redux';

const TableExtratos = dynamic(() =>
	import('../components/extratos/extratosTable')
);

class Extratos extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div style={{ display: 'flex' }}>
				<ContextAsideTrade handleChangeGraph={() => ({})} />
				<main className="main">
					<ContextHeader page="4" />
					<div className="content_wrap">
						{Object.keys(this.props.userProfile).length === 0 ? (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<div className="loading-icon">
									<div />
									<div />
									<div />
									<div />
								</div>
							</div>
						) : (
							<React.Fragment>
								<div className="container-content">
									<div className="page-title">
										<h1 className="page-title__name">EXTRATO</h1>
									</div>
								</div>

								<div style={{ paddingTop: 0 }} />
								<div className="wrap-table">
									<TableExtratos />
								</div>
							</React.Fragment>
						)}
					</div>
				</main>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const { userProfile } = state.users;
	return { userProfile };
};
export default connect(mapStateToProps)(Extratos);
