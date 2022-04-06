import socket from '../../utils/socketConnection';
import { connect } from 'react-redux';
import { capitalizeFirstLetter } from '../../utils/functions';
import { fetchMyBalance } from '../../actions/users';
import currencyFormatter from 'currency-formatter';
import { Alert, message } from 'antd';
import has from 'lodash/has';

const targetPair = (currentPair, balance) => {
	const pair = currentPair.split('/');

	if (balance.length === 0) {
		return {
			currency_name: '',
			currency_symbol: '',
			balance: '',
		};
	}

	const currency = balance.find(item => item.currency === pair[1]);

	return {
		currency_name: capitalizeFirstLetter(currency.currency_name),
		currency_symbol: currency.currency_symbol,
		balance: currency.available_balance,
	};
};

class PlaceOrderModal extends React.Component {
	state = {
		submitMessage: '',
		submitError: false,
		loadingSubmit: false,
	};

	handlePlaceOrder = e => {
		e.preventDefault();
		const {
			price,
			amount,
			orderLimits,
			currentPair,
			isBuy,
			dispatch,
			handleClose,
		} = this.props;

		const total = price * amount;
		const orderMinimum = `${currentPair
			.toLowerCase()
			.replace('/', '_')}_minimum`;

		const minimum = has(orderLimits, orderMinimum)
			? parseFloat(orderLimits[orderMinimum])
			: 0;

		if (total <= 0) {
			return this.setState({
				submitMessage: 'O valor não pode ser menor do que 0',
				submitError: true,
			});
		}

		if (total < minimum) {
			return this.setState({
				submitMessage: `Valor minimo de ${minimum}`,
				submitError: true,
			});
		}

		this.setState({ loadingSubmit: true });

		const data = {
			pair: currentPair,
			amount: amount,
			price: price,
			order_type: `${ isBuy ? 'buy' : 'sell'} market advanced`,
			token: localStorage.getItem('auth_token'),
		};

		socket.emit('place_order', data, response => {
			this.setState({
				loadingSubmit: false,
			});

			if (!response.success) {
				return this.setState({
					submitMessage: response.message,
					submitError: true,
				});
			}

			message.success('Ordem inserida com sucesso');
			dispatch(fetchMyBalance());
			handleClose();
		});
	};

	render() {
		const {
			myBalance: { balance = [] },
			currentPair,
		} = this.props;
		const currencySymbolTarget = targetPair(currentPair, balance)
			.currency_symbol;
		return (
			<div className="screen-overlay">
				<div onClick={e => e.stopPropagation()} className="overlay-deposito">
					<header className="overlay-deposito__header">
						<h3>
							Confirmação de {this.props.isBuy ? 'COMPRA' : 'VENDA'} de{' '}
							<span style={{ textTransform: 'uppercase' }}>
								{this.props.currencyName}
							</span>
						</h3>
						<button
							onClick={this.props.handleClose}
							className="overlay-deposito__close"
						>
							<img src="/static/img/cancel.svg" />
						</button>
					</header>
					<div className="overlay-deposito__content">
						{
							<React.Fragment>
								<p style={{ display: 'none' }}>
									Deseja confirmar a {this.props.isBuy ? 'compra' : 'venda'} de{' '}
									{this.props.currencyName.toUpperCase()}?
								</p>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										flexDirection: 'column',
									}}
								>
									<div className="row simple-row">
										<div className="col-6">
											<b>Par:</b> {currentPair}
										</div>
										<div className="col-6">
											<b>Comissão:</b>{' '}
											{currencyFormatter.format(this.props.comissao, {
												symbol: this.props.isBuy
													? this.props.currencySymbol
													: 'R$',
												format: '%s %v',
												decimal: ',',
												thousand: '.',
												precision: this.props.isBuy ? 8 : 2,
											})}
										</div>
									</div>
									<div className="row simple-row">
										<div className="col-6">
											<b>Tipo:</b> Mercado
										</div>
										<div className="col-6">
											<b>Preço unitário:</b>{' '}
											{currencyFormatter.format(this.props.price, {
												symbol: currencySymbolTarget,
												format: '%s %v',
												decimal: ',',
												thousand: '.',
												precision: currencySymbolTarget === 'R$' ? 2 : 8,
											})}
										</div>
									</div>
									<div className="row simple-row">
										<div className="col-6">
											<b>Quantidade:</b>{' '}
											{currencyFormatter.format(this.props.amount, {
												symbol: this.props.currencySymbol,
												format: '%s %v',
												decimal: ',',
												thousand: '.',
												precision: this.props.currencySymbol === 'R$' ? 2 : 8,
											})}
										</div>
										<div className="col-6">
											<b>Valor Total:</b>{' '}
											{currencyFormatter.format(
												this.props.price * this.props.amount,
												{
													symbol: currencySymbolTarget,
													format: '%s %v',
													decimal: ',',
													thousand: '.',
													precision: currencySymbolTarget === 'R$' ? 2 : 8,
												}
											)}
										</div>
									</div>

									<div style={{ marginTop: '10px' }}>
										{this.state.submitSuccess && (
											<Alert
												showIcon
												type="success"
												message={this.state.submitMessage}
												closeText="Fechar"
												onClose={() =>
													this.setState({
														submitSuccess: false,
														submitMessage: '',
													})
												}
											/>
										)}

										{this.state.submitError && (
											<Alert
												showIcon
												type="error"
												message={this.state.submitMessage}
												closeText="Fechar"
												onClose={() =>
													this.setState({
														submitError: false,
														submitMessage: '',
													})
												}
											/>
										)}
									</div>
								</div>
								<button
									style={{ color: '#FFF' }}
									onClick={this.props.handleClose}
									className={`place-order-btn place-order-btn-no aside__form-button aside__form-button--red`}
								>
									NÃO
								</button>
								<button
									style={
										this.state.loadingSubmit
											? { color: '#FFF', cursor: 'not-allowed' }
											: { color: '#FFF' }
									}
									onClick={e => this.handlePlaceOrder(e)}
									className={`place-order-btn place-order-btn-yes aside__form-button`}
								>
									{this.state.loadingSubmit ? 'AGUARDE...' : 'SIM'}
								</button>
							</React.Fragment>
						}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	myBalance: state.users.myBalance,
	currentPair: state.orders.currentPair,
	userProfile: state.users.userProfile,
	orderLimits: state.orders.orderLimits,
});
export default connect(mapStateToProps)(PlaceOrderModal);
