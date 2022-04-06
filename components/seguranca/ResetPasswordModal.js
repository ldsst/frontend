import { connect } from 'react-redux';
import { Form, Input, message, Button, Alert } from 'antd';
import { resetPassword } from '../../actions/users';

const FormItem = Form.Item;
import zxcvbn from 'zxcvbn';

Number.prototype.formatMoney = function(c, d, t) {
	var n = this,
		c = isNaN((c = Math.abs(c))) ? 2 : c,
		d = d == undefined ? '.' : d,
		t = t == undefined ? ',' : t,
		s = n < 0 ? '-' : '',
		i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
		j = (j = i.length) > 3 ? j % 3 : 0;
	return (
		s +
		(j ? i.substr(0, j) + t : '') +
		i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
		(c
			? d +
			  Math.abs(n - i)
					.toFixed(c)
					.slice(2)
			: '')
	);
};

class ResetPasswordModal extends React.Component {
	state = {
		error: '',
		loadingSubmit: false,
		password: '',
		confirmPassword: '',
		newPassword: '',
		passwordStrength: '',
		passwordScore: '',
	};

	validatePassword = () => {
		const password = this.state.newPassword;
		const result = zxcvbn(password);

		const crack_time = result.crack_times_seconds;
		const crack_time_seconds = crack_time.offline_slow_hashing_1e4_per_second;

		const passwordScore = result.score;

		this.setState({ passwordScore });

		if (crack_time_seconds < 1) {
			this.setState({ passwordStrength: 'Menos de 1 segundo' });
		} else {
			let unit = 'segundos';
			let s_crack_time_seconds = crack_time_seconds;
			if (crack_time_seconds > 60) {
				s_crack_time_seconds = crack_time_seconds / 60;
				unit = 'minutos';
			}
			if (crack_time_seconds > 3600) {
				s_crack_time_seconds = crack_time_seconds / 3600;
				unit = 'horas';
			}
			if (crack_time_seconds > 86400) {
				s_crack_time_seconds = crack_time_seconds / 86400;
				unit = 'dias';
			}
			if (crack_time_seconds > 604800) {
				s_crack_time_seconds = crack_time_seconds / 604800;
				unit = 'semanas';
			}
			if (crack_time_seconds > 2629746) {
				s_crack_time_seconds = crack_time_seconds / 2629746;
				unit = 'meses';
			}
			if (crack_time_seconds > 31556952) {
				s_crack_time_seconds = crack_time_seconds / 31556952;
				unit = 'anos';
			}
			const passwordStrength =
				Number(s_crack_time_seconds).formatMoney(2, ',', '.') + ' ' + unit;
			this.setState({ passwordStrength });
		}
	};

	handleSubmit = async () => {
		if (!this.state.password) {
			return this.setState({ error: 'Preencha a senha' });
		}

		if (this.state.newPassword && this.state.passwordScore < 2) {
			return this.setState({
				error:
					'Digite uma senha forte contendo letra maiúscula, letra minúscula, número e símbolo',
			});
		}

		if (!this.state.confirmPassword) {
			return this.setState({ error: 'Preencha a confirmação da senha' });
		}

		if (!this.state.newPassword) {
			return this.setState({ error: 'Preencha a nova senha' });
		}

		if (this.state.newPassword !== this.state.confirmPassword) {
			return this.setState({ error: 'As senhas não conferem' });
		}

		this.setState({ error: '', loadingSubmit: true });

		const data = {
			password: this.state.password,
			newPassword: this.state.newPassword,
		};

		const response = await this.props.dispatch(resetPassword(data));

		this.setState({ loadingSubmit: false });

		if (!response.success) {
			return this.setState({ error: response.message });
		}

		this.setState({ error: '' });
		message.success('Senha alterada com sucesso!');
		this.props.handleClose();
	};

	hadleChangePassword = e => {
		this.setState({ newPassword: e.target.value }, this.validatePassword);
	};

	render() {
		return (
			<div className="screen-overlay">
				<div className="overlay-deposito">
					<header className="overlay-deposito__header">
						<h3>Alterar Senha</h3>
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
								placeholder="Digite sua senha atual"
								type="password"
								value={this.state.password || ''}
								onChange={e => this.setState({ password: e.target.value })}
								style={{ marginBottom: '10px' }}
							/>
						</FormItem>

						<FormItem>
							<Input
								placeholder="Digite sua senha nova"
								type="password"
								value={this.state.newPassword || ''}
								onChange={this.hadleChangePassword}
								style={{ marginBottom: '10px' }}
							/>
						</FormItem>

						<FormItem>
							<Input
								placeholder="Confirme sua nova senha"
								type="password"
								value={this.state.confirmPassword || ''}
								onChange={e =>
									this.setState({ confirmPassword: e.target.value })
								}
								style={{ marginBottom: '10px' }}
							/>
						</FormItem>

						{this.state.error && (
							<Alert
								type="error"
								message={this.state.error}
								showIcon
								onClose={() => this.setState({ error: '' })}
							/>
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
								onClick={() => this.handleSubmit()}
								loading={this.state.loadingSubmit}
								type="primary"
							>
								Continuar
							</Button>
						</FormItem>
					</footer>
				</div>
			</div>
		);
	}
}

export default connect()(ResetPasswordModal);
