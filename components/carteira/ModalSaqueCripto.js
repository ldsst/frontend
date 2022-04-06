import Link from 'next/link';
import { Input, Select, Form, Button, Alert, message } from 'antd';
import { connect } from 'react-redux';
import { withdrawCryptoCurrency } from '../../actions/withdraw';
import Cleave from 'cleave.js/react';
import currencyFormatter from 'currency-formatter';

const { Option } = Select;
const FormItem = Form.Item;

class ModalSaqueCripto extends React.Component {
	state = {
		loadingSubmit: false,
		success: false,
		error: false,
		errorMessage: '',
		step: 0,
	};

	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields(async (err, values) => {
			this.setState({ error: false, errorMessage: '' });
			if (!err) {
				this.setState({ loadingSubmit: true, error: false, errorMessage: '' });
				const amount = values.amount
					.replace(/\./g, '')
					.replace(',', '.')
					.trim()
					.split(' ');

				const data = {
					...values,
					currency: this.props.currency,
					amount: parseFloat(amount[1] ? amount[1] : amount[0]),
				};

				const response = await this.props.dispatch(
					withdrawCryptoCurrency(data)
				);
				this.setState({ loadingSubmit: false });
				if (!response.success) {
					return this.setState({ error: true, errorMessage: response.message });
				}
				await this.props.handleUpdateUserBalance();
				message.success('Pedido de retirada enviado com sucesso!');
				this.props.handleClose();
			}
		});
	};

	handleContinue = e => {
		e.preventDefault();
		const { currency, userLimit } = this.props;

		this.props.form.validateFields((err, values) => {
			if (!err) {
				const amount =
					values.amount
						.replace(`${this.props.currencySymbol} `, '')
						.replace(/\./g, '')
						.replace(',', '.') || 0;

				const maxLimit = userLimit[currency.toLowerCase()]
					? parseFloat(userLimit[currency.toLowerCase()].withdraw_maximum)
					: 0;

				const minLimit = userLimit[currency.toLowerCase()]
					? parseFloat(userLimit[currency.toLowerCase()].withdraw_minimum)
					: 0;

				if (parseFloat(amount) <= 0) {
					return this.setState({
						error: true,
						errorMessage: 'O valor não pode ser negativo ou zero',
					});
				}

				if (parseFloat(amount) > maxLimit) {
					return this.setState({
						error: true,
						errorMessage: 'O valor excede seu limite',
					});
				}

				if (parseFloat(amount) < minLimit) {
					return this.setState({
						error: true,
						errorMessage: `Valor mínimo para saque: ${minLimit}`,
					});
				}

				this.setState({ step: 1 });
			}
		});
	};

	handleCalculateAmount = (e, field, symbol) => {
		const fee = parseFloat(this.props.form.getFieldValue('fee')) || 0;
		const value =
			e.target.value
				.replace(`${symbol} `, '')
				.replace(/\./g, '')
				.replace(',', '.') || 0;

		if (field === 'bruteAmount') {
			const liquid = currencyFormatter.format(parseFloat(value) - fee, {
				format: '%v',
				decimal: ',',
				thousand: '.',
				precision: 8,
			});
			this.props.form.setFieldsValue({ amount: liquid });
		} else {
			const brute = currencyFormatter.format(parseFloat(value) + fee, {
				format: '%v',
				decimal: ',',
				thousand: '.',
				precision: 8,
			});
			this.props.form.setFieldsValue({ bruteAmount: brute });
		}
	};

	handleCalculateFee = (values, symbol) => {
		const value = this.props.form.getFieldValue('bruteAmount');

		const amount = value
			? value
					.replace(`${symbol} `, '')
					.replace(/\./g, '')
					.replace(',', '.')
			: 0;

		const fee = parseFloat(values) || 0;

		const liquid = currencyFormatter.format(amount - fee, {
			format: '%v',
			decimal: ',',
			thousand: '.',
			precision: 8,
		});

		this.props.form.setFieldsValue({ amount: liquid });
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<div className="screen-overlay">
				<Form
					className="overlay-deposito"
					style={{ width: '500px' }}
					layout="vertical"
					onSubmit={
						this.state.step === 0 ? this.handleContinue : this.handleSubmit
					}
				>
					<header className="overlay-deposito__header">
						<h3>Retirada de criptomoedas</h3>
						<button
							onClick={this.props.handleClose}
							className="overlay-deposito__close"
						>
							<img src="/static/img/cancel.svg" />
						</button>
					</header>
					<div className="overlay-deposito__content">
						{this.props.userProfile.verified === 1 ? (
							<React.Fragment>
								<FormItem>
									<span className="overlay-deposito__item-span">
										Moeda:
									</span>
									{getFieldDecorator('currency', {
										initialValue: `(${
											this.props.currency
										}) - ${this.props.currencyName.toUpperCase()}`,
									})(<Input type="text" disabled />)}
								</FormItem>

								<FormItem>
									<span className="overlay-deposito__item-span-2">
										Carteira de destino:
									</span>
									{getFieldDecorator('wallet', {
										rules: [{ required: true, message: 'Carteira inválida!' }],
									})(<Input type="text" placeholder="Carteira de destino" />)}
								</FormItem>

								<FormItem>
									<span className="overlay-deposito__item-span-2">
										Quantidade bruta:
									</span>
									{getFieldDecorator('bruteAmount', {
										rules: [
											{ required: true, message: 'Quantidade inválida!' },
										],
									})(
										<Cleave
											placeholder={`0,00000000`}
											onChange={e =>
												this.handleCalculateAmount(
													e,
													'bruteAmount',
													this.props.currencySymbol
												)
											}
											options={{
												numeral: true,
												numeralDecimalMark: ',',
												delimiter: '',
												numeralDecimalScale: 8,
												prefix: `${this.props.currencySymbol} `,
											}}
											className={`ant-input`}
										/>
									)}
								</FormItem>

								<FormItem>
									<span className="overlay-deposito__item-span-2">
										Miners fee:
									</span>
									{getFieldDecorator('fee', {
										rules: [{ required: true, message: 'Selecione uma taxa!' }],
									})(
										<Select
											placeholder="Selecione a taxa"
											style={{ color: '#000!important' }}
											onChange={values =>
												this.handleCalculateFee(
													values,
													this.props.currencySymbol
												)
											}
										>
											<Option value={0.0001}>{`${
												this.props.currencySymbol
											} 0,0001`}</Option>
											<Option value={0.00013}>{`${
												this.props.currencySymbol
											} 0,00013`}</Option>
											<Option value={0.00027}>{`${
												this.props.currencySymbol
											} 0,00027`}</Option>
										</Select>
									)}
								</FormItem>

								<FormItem>
									<span className="overlay-deposito__item-span-2">
										Quantidade líquida (a ser recebida):
									</span>
									{getFieldDecorator('amount', {
										rules: [
											{ required: true, message: 'Quantidade inválida!' },
										],
									})(
										<Cleave
											placeholder={`0,00000000`}
											onChange={e =>
												this.handleCalculateAmount(
													e,
													'amount',
													this.props.currencySymbol
												)
											}
											options={{
												numeral: true,
												numeralDecimalMark: ',',
												delimiter: '',
												numeralDecimalScale: 8,
												prefix: `${this.props.currencySymbol} `,
											}}
											className={`ant-input`}
										/>
									)}
								</FormItem>

								{this.state.step === 1 && (
									<FormItem>
										<span className="overlay-deposito__item-span-2">
											Digite o token de 2FA:
										</span>
										{getFieldDecorator('auth2fa', {
											rules: [
												{
													required: true,
													message: 'Digite o 2FA para realizar a retirada',
												},
											],
										})(<Input type="text" placeholder="Token de 2FA" />)}
									</FormItem>
								)}

								{this.state.error && (
									<Alert
										message={this.state.errorMessage}
										type="error"
										closeText="Fechar"
										onClose={() =>
											this.setState({ error: false, errorMessage: '' })
										}
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
										className="primary-button primary-button--continue verificacao__item__button verificacao__item__anchor__2"
									>
										Clique aqui para verificar sua conta
									</a>
								</Link>
							</div>
						)}
					</div>

					{this.props.userProfile.verified === 1 && (
						<footer className="overlay-deposito__footer">
							<button
								onClick={this.props.handleClose}
								className="primary-button primary-button--text"
							>
								Cancelar
							</button>
							{this.props.userProfile.verified === 1 && (
								<Button
									type="primary"
									htmlType="submit"
									loading={this.state.loadingSubmit}
								>
									Solicitar retirada
								</Button>
							)}
						</footer>
					)}
				</Form>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	userProfile: state.users.userProfile,
	userLimit: state.users.userLimit,
});
const WrappedModalSaqueCripto = Form.create()(ModalSaqueCripto);
export default connect(mapStateToProps)(WrappedModalSaqueCripto);
