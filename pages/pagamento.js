import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import ModalCreate from '../components/pagamento/ModalCreate';
import PagamentoLista from '../components/pagamento/PagamentoLista';
import { connect } from 'react-redux';
import { fetchLocalBanks } from '../actions/bank';

class Pagamento extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showModal: false,
			bankAccount: null,
			method: null,
		};
	}

	handleOpenModal = (showModal, bankAccount = null, method = null) => {
		this.setState({ showModal, bankAccount, method });
	};

	componentDidMount() {
		this.props.dispatch(fetchLocalBanks());
	}

	render() {
		return (
			<div style={{ display: 'flex' }}>
				<ContextAside page={4} />
				<main className="main">
					<ContextHeader page={8} />
					<div className="content_wrap">
						<div className="container-content">
							<div className="page-title">
								<h1 className="page-title__name">MINHAS CONTAS BANCÁRIAS</h1>
							</div>

							<PagamentoLista handleOpenModal={this.handleOpenModal} />
						</div>
					</div>
				</main>

				{this.state.showModal && (
					<ModalCreate
						method={this.state.method}
						isOpen={this.state.showModal}
						handleClose={() => this.handleOpenModal(false)}
						bankAccount={this.state.bankAccount}
					/>
				)}
			</div>
		);
	}
}
const mapStateToProps = ({ users }) => {
	const { isChatVisible } = users;
	return { isChatVisible };
};
export default connect(mapStateToProps)(Pagamento);
