import FormItem from 'antd/lib/form/FormItem';
import { Button, Input, Alert } from 'antd';
import ReactTooltip from 'react-tooltip';
import { showSecret } from '../../actions/users';
import { connect } from 'react-redux';

class Show2FaModal extends React.Component {
	state = {
		password: '',
		showSecret: '',
		secret: '',
		loading: false,
		errorMsg: '',
	};

	handleShowSecret = async () => {
		const { secret, password } = this.state;
		const data = {
			password,
			auth2fa: secret,
		};

		this.setState({ loading: true });
		const response = await this.props.dispatch(showSecret(data));
		this.setState({ loading: false, errorMsg: '' });

		if (!response.success) {
			return this.setState({ errorMsg: response.message });
		}

		return this.setState({ showSecret: response.secret });
	};

	copyToClipboard = name => {
		document.getElementById(name).select();
		document.getElementById(name).focus();
		document.execCommand('copy');
	};

	render() {
		return (
			<div className="screen-overlay">
				<div className="overlay-deposito">
					<header className="overlay-deposito__header">
						<div className="screen-overlay">
							<div className="overlay-deposito">
								<header className="overlay-deposito__header">
									<h3>Exibir 2FA </h3>
									<button
										onClick={this.props.handleClose}
										className="overlay-deposito__close"
									>
										<img src="/static/img/cancel.svg" />
									</button>
								</header>
								<div className="overlay-deposito__content">
									<FormItem>
										<Input
											onChange={e =>
												this.setState({ password: e.target.value })
											}
											value={this.state.password || ''}
											type="password"
											placeholder="Digite sua senha"
											style={{ marginBottom: '10px' }}
										/>
									</FormItem>

									<FormItem>
										<Input
											onChange={e => this.setState({ secret: e.target.value })}
											value={this.state.secret || ''}
											placeholder="Digite o token 2FA"
											type="text"
										/>
									</FormItem>

									<div style={{ paddingTop: 6 }} />

									{this.state.errorMsg && (
										<Alert
											message={this.state.errorMsg}
											type="error"
											closeText="Fechar"
											onClose={() => this.setState({ errorMsg: '' })}
										/>
									)}

									{this.state.showSecret && (
										<div
											className="overlay-deposito__container-input"
											style={{ paddingTop: '10px' }}
										>
											<label className="overlay-deposito__label">
												2FA Secret:
											</label>
											<p className="overlay-deposito__wallet">
												<input
													id="token"
													value={this.state.showSecret || ''}
													style={{
														background: 'transparent',
														border: 'none',
														width: '100%',
														cursor: 'default',
													}}
													readOnly
												/>
												<img
													data-tip="Copiar secret"
													className="overlay-deposito__copy"
													src="/static/img/copy.svg"
													style={{ cursor: 'pointer' }}
													onClick={() => this.copyToClipboard('token')}
												/>
												<ReactTooltip
													effect={'solid'}
													place={'right'}
													border={true}
													className={'tooltip'}
												/>
											</p>
										</div>
									)}
								</div>
								<footer className="overlay-deposito__footer">
									<button
										onClick={this.props.handleClose}
										className="primary-button primary-button--text"
									>
										Cancelar
									</button>
									<FormItem>
										<Button
											onClick={() => this.handleShowSecret()}
											loading={this.state.loading}
											type="primary"
										>
											Continuar
										</Button>
									</FormItem>
								</footer>
							</div>
						</div>
					</header>
				</div>
			</div>
		);
	}
}

export default connect()(Show2FaModal);
