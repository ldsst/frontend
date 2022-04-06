import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import { connect } from 'react-redux';
import { Alert } from 'antd';
import currencyFormatter from 'currency-formatter';
import Loader from '../components/Loader';

const findCurrency = (currency, balance = []) => {
	if (balance.length === 0) {
		return {
			currency: '',
			currency_symbol: '',
			currency_name: '',
		};
	}

	const data = balance.find(item => item.currency === currency.toUpperCase());

	if (data) {
		return data;
	}

	return {
		currency: '',
		currency_symbol: '',
		currency_name: '',
	};
};

class LimitesOperacionais extends React.Component {
	constructor() {
		super();
	}
	renderRows = () => {
		const { balance = [] } = this.props.myBalance;
		if (Object.keys(this.props.userLimit).length === 0) {
			return <h4>Nenhum limite encontrado</h4>;
		}

		return (
			<tbody>
				{Object.keys(this.props.userLimit).map((item, index) => {
					// const currency = item.split('_')[0];
					// const type = item.split('_')[1];
					return (
						<tr key={index}>
							<td>
								{
									<b>
										{findCurrency(item, balance).currency_name.toUpperCase()}
									</b>
								}
							</td>
							<td>
								{currencyFormatter.format(
									this.props.userLimit[item]
										? this.props.userLimit[item].deposit_maximum
										: 0,
									{
										symbol:
											item === 'brl'
												? 'R$'
												: findCurrency(item, balance).currency_symbol,
										format: '%s %v',
										decimal: ',',
										thousand: '.',
										precision: item === 'brl' ? 2 : 8,
									}
								)}
							</td>
							<td>
								{currencyFormatter.format(
									this.props.userLimit[item]
										? this.props.userLimit[item].withdraw_maximum
										: 0,
									{
										symbol:
											item === 'brl'
												? 'R$'
												: findCurrency(item, balance).currency_symbol,
										format: '%s %v',
										decimal: ',',
										thousand: '.',
										precision: item === 'brl' ? 2 : 8,
									}
								)}
							</td>
						</tr>
					);
				})}
			</tbody>
		);
	};

	render() {
		return (
			<div style={{ display: 'flex' }}>
				<ContextAside page={2} />
				<main className="main">
					<ContextHeader page={7} />
					<div className="content_wrap">
						<div className="container-content">
							<div className="page-title">
								<h1 className="page-title__name">LIMITES OPERACIONAIS</h1>
							</div>
							<div style={{ paddingTop: '20px' }}>
								{Object.keys(this.props.userProfile).length > 0 &&
								!this.props.isFetchingLimit ? (
									<div>
										<div>
											<table className="table-strip__table">
												<thead>
													<tr className="table-strip__tr">
														<th>Moeda</th>
														<th>Depósito</th>
														<th>Retirada</th>
													</tr>
												</thead>
												{this.renderRows()}
											</table>
										</div>

										{this.props.userProfile.verified === 0 ? (
											<Alert
												message="Como aumentar meu limite?"
												description='Para aumentar o limite da sua conta, é necessário fazer a verificação da mesma. Você pode iniciar o processo clicando em "Verificação de conta", no menu lateral esquerdo desta página.'
												type="info"
												showIcon
												style={{ marginTop: '30px' }}
											/>
										) : (
											<React.Fragment>
												<Alert
													message="Precisa de limites maiores?"
													description="Clique no link abaixo e preencha o formulário. Você receberá um retorno em até 2 dias úteis."
													type="info"
													showIcon
													style={{ marginTop: '30px' }}
												/>
												<div
													style={{
														display: 'block',
														width: '100%',
														textAlign: 'center',
														marginTop: '20px',
													}}
												>
												</div>
											</React.Fragment>
										)}
									</div>
								) : (
									<Loader />
								)}
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	userProfile: state.users.userProfile,
	myBalance: state.users.myBalance,
	userLimit: state.users.userLimit,
	isFetchingLimit: state.users.isFetchingLimit,
});
export default connect(mapStateToProps)(LimitesOperacionais);
