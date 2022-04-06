import Link from 'next/link';
import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import { Input, message } from 'antd';
import { connect } from 'react-redux';
import { verificationPersonal } from '../actions/users';
import { Alert, Spin, Icon } from 'antd';
import { formatarCpfCnpj } from '../utils/formatCpfCnpj';
import InputMask from 'react-input-mask';
import Router from 'next/router';

const InputPhone = props => (
	<InputMask
		disabled={false}
		mask="(99) 9999tt999?"
		formatChars={{ '9': '[0-9]', t: '[0-9-]', '?': '[0-9 ]' }}
		maskChar={null}
		value={props.value}
		onChange={props.onChange}
	>
		{inputProps => (
			<Input
				{...inputProps}
				style={{ display: 'inline-block!important', width: '15rem' }}
				placeholder="Digite seu número de telefone"
			/>
		)}
	</InputMask>
);

const antIcon = (
	<Icon
		type="loading"
		style={{ fontSize: 20, color: '#333', margin: '0', padding: '0' }}
		spin
	/>
);

class VerifyPersonal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			phone: '',
			errorMsg: '',
			successMsg: '',
			loadingSubmit: false,
		};
	}

	handleSendVerification = async () => {
		if (!this.state.phone) {
			return this.setState({ errorMsg: 'Digite o telefone' });
		}

		this.setState({ loadingSubmit: true, errorMsg: '' });
		const response = await this.props.dispatch(
			verificationPersonal(this.state.phone)
		);
		this.setState({ loadingSubmit: false });

		if (!response.success) {
			return this.setState({ errorMsg: response.message });
		}

		message.success(response.message);
		Router.push('/verificacao');
	};

	render() {
		const { userProfile } = this.props;
		return (
			<div style={{ display: 'flex' }}>
				<ContextAside page={20} />
				<main className="main">
					<ContextHeader page="7" />
					<div className="container-content verificacao">
						<div className="page-title">
							<h1 className="page-title__name">
								<Link prefetch href="/verificacao">
									Verificação de Conta
								</Link>
								<span>Pessoal</span>
							</h1>
							<Link prefetch href="/verificacao">
								<button
									href="javascript:void()"
									className="dark-button"
									style={{ position: 'absolute', right: '9rem' }}
								>
									<Icon type="swap-left" style={{ marginRight: '5px' }} />{' '}
									Voltar
								</button>
							</Link>
							<button
								style={
									this.state.loadingSubmit
										? { pointerEvents: 'none', width: '8rem', height: '1.8rem' }
										: { width: '8rem', height: '1.8rem' }
								}
								onClick={e => this.handleSendVerification(e)}
								className="success-button"
							>
								{this.state.loadingSubmit ? (
									<Spin indicator={antIcon} />
								) : (
									<div>
										<Icon type="check" style={{ marginRight: '5px' }} /> Enviar
									</div>
								)}
							</button>
						</div>
						<div className="verificacao__content verificacao__content--inside">
							{this.state.errorMsg && (
								<Alert
									message={this.state.errorMsg}
									type="error"
									closeText="Fechar"
									onClose={() => this.setState({ errorMsg: '' })}
								/>
							)}

							{this.state.successMsg && (
								<Alert
									message={this.state.successMsg}
									type="success"
									closeText="Fechar"
									onClose={() => this.setState({ successMsg: '' })}
								/>
							)}
							<h2 className="verificacao__item__title">Informações Pessoais</h2>
							<form className="verificacao__form">
								<div className="verificacao__input">
									<label className="verificacao__input__label">
										<span>Nome completo</span>
										<small>
											Caso seu nome esteja incorreto, entre em contato conosco.
										</small>
									</label>
									<div>
										<Icon
											type="check"
											style={{
												color: 'rgb(18,171,104)',
												marginRight: '1rem',
												fontSize: '1.2rem',
											}}
										/>
										<input
											className="primary-field primary-field--light verificacao__input__large"
											type="text"
											value={userProfile.name || ''}
											readOnly
										/>
									</div>
								</div>
								<div className="verificacao__input">
									<label className="verificacao__input__label">
										<span>CPF/CNPJ</span>
										<small>
											Caso seu CPF/CNPJ esteja incorreto, entre em contato
											consoco.
										</small>
									</label>
									<div>
										<Icon
											type="check"
											style={{
												color: 'rgb(18,171,104)',
												marginRight: '1rem',
												fontSize: '1.2rem',
											}}
										/>
										<input
											className="primary-field primary-field--light verificacao__input__medium"
											type="text"
											value={formatarCpfCnpj(userProfile.document || '')}
											readOnly
										/>
									</div>
								</div>
								<div className="verificacao__input">
									<label className="verificacao__input__label">
										<span>Data de Nascimento</span>
										<small>Insira o dia, mês e o ano de seu nascimento</small>
									</label>
									<div>
										<Icon
											type="check"
											style={{
												color: 'rgb(18,171,104)',
												marginRight: '1rem',
												fontSize: '1.2rem',
											}}
										/>
										<input
											className="primary-field primary-field--light verificacao__input__medium"
											type="text"
											value={userProfile.birth_date || ''}
											readOnly
										/>
									</div>
								</div>
								<div className="verificacao__input">
									<label className="verificacao__input__label">
										<span>Telefone</span>
										<small>Seu telefone de uso pessoal</small>
									</label>
									<div>
										<Icon
											type="edit"
											style={{
												color: 'orange',
												marginRight: '1rem',
												fontSize: '1.2rem',
											}}
										/>
										<InputPhone
											onChange={e => this.setState({ phone: e.target.value })}
											value={this.state.phone || ''}
										/>
									</div>
								</div>
							</form>
						</div>
					</div>

					<div className="verificacao__actions" />
				</main>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const { userProfile } = state.users;
	return { userProfile };
};
export default connect(mapStateToProps)(VerifyPersonal);
