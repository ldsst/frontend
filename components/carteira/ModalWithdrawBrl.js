import Link from 'next/link';
import { connect } from 'react-redux';
import { Form, Select, Alert, Button, message } from 'antd';
import { withdrawMoney } from '../../actions/withdraw';
import Router from 'next/router';
import MaskedInput from 'react-text-mask';
import currencyFormatter from 'currency-formatter';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const FormItem = Form.Item;
const Option = Select.Option;

const fiatMask = createNumberMask({
	prefix: 'R$ ',
	suffix: '',
	includeThousandsSeparator: true,
	allowDecimal: true,
	decimalSymbol: ',',
	thousandsSeparatorSymbol: '.',
	decimalLimit: 2,
});

const unformatCurrency = (val = '') => {
	return val
		.toString()
		.replace(/\./g, '')
		.replace(/\,/g, '.')
		.replace(/\s/g, '')
		.replace('$', '')
		.replace(/[^\d.-]/g, '');
};

class ModalWithdrawBbrl extends React.Component {
	state = {
		bankAccountId: '',
		amountBrlWithdraw: 0,
		tedFee: '',
		brlFee: '',
		loadingSubmit: false,
		amountTotal: '',
		withdrawError: '',
		withdrawSuccess: '',
		errors: {},
	};

	handleChange = value => {
		if (value == 'new') {
			Router.push('/pagamento');
			return;
		}

		const bank =
			this.props.bankAccounts.find(item => item.bank_account_id === value) ||
			null;
		let tedFee;

		if (bank) {
			tedFee = bank.is_available_bank ? 0 : this.props.profile.fees.ted;
		}

		this.setState({ bankAccountId: value, tedFee }, this.handleCalculateFee);
	};

	handleChangeAmountTotal = e => {
		this.setState({ amountTotal: e.target.value }, this.handleCalculateFee);
	};

	handleCalculateFee = () => {
		const {
			profile: { fees = {} },
		} = this.props;
		const amount = this.state.amountTotal
			? this.state.amountTotal.replace('R$ ', '')
			: '0.00';

		const value = amount.replace(/\./g, '').replace(',', '.');

		const brlFee = (value * fees.brl_withdraw) / 100;

		const amountBrlWithdraw =
			parseFloat(value) - parseFloat(brlFee) - parseFloat(this.state.tedFee);

		this.setState({
			brlFee,
			amountBrlWithdraw: amountBrlWithdraw < 0 ? 0 : amountBrlWithdraw,
		});
	};

	handleUseBalance = () => {
		this.setState(
			{
				amountTotal: currencyFormatter.format(this.props.brlBalance, {
					symbol: 'R$',
					format: '%s %v',
					decimal: ',',
					thousand: '.',
					precision: 2,
				}),
			},
			this.handleCalculateFee
		);
	};

	handleWithdrawMoney = async () => {
		if (this.validateForm()) {
			const maxLimit = this.props.userLimit.brl
				? parseFloat(this.props.userLimit.brl.withdraw_maximum)
				: 0;

			const minLimit = this.props.userLimit.brl
				? parseFloat(this.props.userLimit.brl.withdraw_minimum)
				: 0;

			const valueToWithdraw = unformatCurrency(this.state.amountTotal);

			if (parseFloat(valueToWithdraw) > maxLimit) {
				return this.setState({ withdrawError: 'A operação excede seu limite' });
			}

			if (parseFloat(valueToWithdraw) < minLimit) {
				return this.setState({
					withdrawError: `Valor mínimo para saque: ${minLimit}`,
				});
			}

			this.setState({ withdrawError: '' });

			const data = {
				bank_account_id: this.state.bankAccountId,
				amount: parseFloat(valueToWithdraw),
				auth2fa: '1234',
			};

			this.setState({ loadingSubmit: true });
			const response = await this.props.dispatch(withdrawMoney(data));

			if (!response.success) {
				return this.setState({
					withdrawError: response.message,
					loadingSubmit: false,
				});
			}

			await this.props.handleUpdateUserBalance();
			message.success('Pedido de saque realizado com sucesso');
			this.props.handleClose();
		}
	};

	validateForm = () => {
		const errors = {};
		let isFormValid = true;

		if (!this.state.amountBrlWithdraw) {
			errors.amountBrlWithdraw = 'Campo obrigatório';
			isFormValid = false;
		}

		if (!this.state.amountTotal) {
			errors.amountTotal = 'Campo obrigatório';
			isFormValid = false;
		}

		if (!this.state.bankAccountId) {
			errors.bankAccountId = 'Campo obrigatório';
			isFormValid = false;
		}

		this.setState({ errors });
		return isFormValid;
	};

	render() {
		const {
			bankAccountId,
			amountTotal,
			amountBrlWithdraw,
			brlFee,
		} = this.state;
		const {
			profile: { fees = {} },
		} = this.props;
		return (
			<div className="screen-overlay">
				<div className="overlay-deposito" style={{ width: '800px' }}>
					<header className="overlay-deposito__header">
						<h3>Retirada de Reais para conta bancária</h3>
						<button
							onClick={this.props.handleClose}
							className="overlay-deposito__close"
						>
							<img src="/static/img/cancel.svg" />
						</button>
					</header>
					<div className="overlay-deposito__content">
						{this.props.profile.verified === 1 ? (
							<React.Fragment>
								<p className="overlay-deposito__label">
									Em qual conta bancária sua você deseja <b>receber o saque</b>?
								</p>

								<div
									className="overlay-deposito__container-input"
									style={{ marginBottom: '15px' }}
								>
									<FormItem
										validateStatus={this.state.errors.bankAccountId && 'error'}
										help={
											this.state.errors.bankAccountId &&
											this.state.errors.bankAccountId
										}
									>
										<Select
											// showSearch
											style={{ width: '100%' }}
											theme="dark"
											placeholder="Selecione sua conta bancária"
											optionFilterProp="children"
											value={bankAccountId || ''}
											onChange={this.handleChange}
											onFocus={this.handleFocus}
											onBlur={this.handleBlur}
											// filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
										>
											<Option value="new">Cadastrar nova conta bancária</Option>
											{this.props.bankAccounts.length > 0 &&
												this.props.bankAccounts.map(bank => (
													<Option
														key={bank.bank_account_id}
														value={bank.bank_account_id}
													>
														[{bank.account_type}] {bank.bank_name} - Ag.{' '}
														{bank.agency} - Conta {bank.account_number}
													</Option>
												))}
										</Select>
									</FormItem>
								</div>

								<div style={{ display: 'flex' }}>
									<div
										className="overlay-deposito__container-input"
										style={{ display: 'inline-block', width: '30%' }}
									>
										<FormItem
											validateStatus={this.state.errors.amountTotal && 'error'}
											help={
												this.state.errors.amountTotal &&
												this.state.errors.amountTotal
											}
										>
											<label className="overlay-deposito__label">
												Valor bruto:
											</label>
											<div style={{ position: 'relative' }}>
												<MaskedInput
													mask={fiatMask}
													style={{ marginBottom: 0 }}
													value={amountTotal || ''}
													onChange={this.handleChangeAmountTotal}
													placeholder={'R$ 0,00'}
													className="primary-field overlay-deposito__input overlay-deposito__value"
												/>
												<button
													onClick={() => this.handleUseBalance()}
													type="button"
													style={{
														position: 'absolute',
														top: '0',
														bottom: '0',
														right: '0.6rem',
													}}
												>
													Usar saldo
												</button>
											</div>
										</FormItem>
										<span
											style={{ fontSize: '.8rem', marginTop: '5px' }}
											className="overlay-deposito__label"
										>
											<b>Saldo disponivel:</b>{' '}
											{currencyFormatter.format(this.props.brlBalance, {
												symbol: 'R$',
												format: '%s %v',
												decimal: ',',
												thousand: '.',
												precision: 2,
											})}
										</span>
									</div>

									<div
										className="overlay-deposito__container-input"
										style={{
											display: 'inline-block',
											width: '20%',
											marginLeft: '2%',
										}}
									>
										<FormItem>
											<label className="overlay-deposito__label">
												Comissão (
												{currencyFormatter.format(fees.brl_withdraw || 0, {
													format: '%v%s',
													symbol: '%',
													decimal: ',',
													thousand: '.',
													precision: 2,
												})}
												):
											</label>
											<input
												type="text"
												className="primary-field overlay-deposito__input overlay-deposito__value"
												value={currencyFormatter.format(brlFee, {
													symbol: 'R$',
													format: '%s %v',
													decimal: ',',
													thousand: '.',
													precision: 2,
												})}
												style={{ color: '#000' }}
												readOnly
											/>
										</FormItem>
									</div>

									<div
										className="overlay-deposito__container-input"
										style={{
											display: 'inline-block',
											width: '15%',
											marginLeft: '2%',
										}}
									>
										<FormItem>
											<label className="overlay-deposito__label">
												Taxa de TED:
											</label>
											<input
												type="text"
												className="primary-field overlay-deposito__input overlay-deposito__value"
												value={currencyFormatter.format(this.state.tedFee, {
													symbol: 'R$',
													format: '%s %v',
													decimal: ',',
													thousand: '.',
													precision: 2,
												})}
												style={{ color: '#000' }}
												readOnly
											/>
										</FormItem>
									</div>

									<div
										className="overlay-deposito__container-input"
										style={{
											display: 'inline-block',
											width: '30%',
											marginLeft: '2%',
										}}
									>
										<FormItem
											validateStatus={
												this.state.errors.amountBrlWithdraw && 'error'
											}
											help={
												this.state.errors.amountBrlWithdraw &&
												this.state.errors.amountBrlWithdraw
											}
										>
											<label className="overlay-deposito__label">
												Valor líquido (a receber):
											</label>
											<input
												type="text"
												className="primary-field overlay-deposito__input overlay-deposito__value"
												value={currencyFormatter.format(amountBrlWithdraw, {
													symbol: 'R$',
													format: '%s %v',
													decimal: ',',
													thousand: '.',
													precision: 2,
												})}
												style={{ color: '#000' }}
												readOnly
											/>
										</FormItem>
									</div>
								</div>

								{parseFloat(amountBrlWithdraw) > this.props.brlBalance && (
									<Alert
										message="Saldo insulficiente"
										type="error"
										closeText="Fechar"
									/>
								)}

								{this.state.withdrawError && (
									<Alert
										message={this.state.withdrawError}
										type="error"
										closeText="Fechar"
										onClose={() => this.setState({ withdrawError: '' })}
									/>
								)}

								{this.state.withdrawSuccess && (
									<Alert
										message={this.state.withdrawSuccess}
										type="success"
										closeText="Fechar"
										onClose={() => this.setState({ withdrawSuccess: '' })}
									/>
								)}
							</React.Fragment>
						) : (
							<div>
								<Alert
									message="Verifique sua conta para executar esta ação."
									type="error"
									style={{ textAlign: 'center' }}
								/>
								<Link prefetch href="/verificacao">
									<a
										href="#"
										className="primary-button primary-button--continue verificacao__item__button"
										style={{
											width: '60%',
											marginLeft: '20%',
											padding: '10px 20px',
											marginTop: '20px',
											textAlign: 'center',
										}}
									>
										Clique aqui para verificar sua conta
									</a>
								</Link>
							</div>
						)}
					</div>
					{this.props.profile.verified === 1 && (
						<footer className="overlay-deposito__footer">
							<button
								onClick={this.props.handleClose}
								className="primary-button primary-button--text"
							>
								Cancelar
							</button>
							<FormItem>
								<Button
									onClick={() => this.handleWithdrawMoney()}
									type="primary"
									loading={this.state.loadingSubmit}
									disabled={
										amountTotal &&
										parseFloat(unformatCurrency(amountTotal)) >
											this.props.brlBalance
									}
								>
									Continuar
								</Button>
							</FormItem>
						</footer>
					)}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	profile: state.users.userProfile,
	userLimit: state.users.userLimit,
	bankAccounts: state.bank.bankAccounts,
});
export default connect(mapStateToProps)(ModalWithdrawBbrl);
