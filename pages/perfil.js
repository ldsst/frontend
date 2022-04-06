import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import { Switch, Icon } from 'antd';
import { connect } from 'react-redux';
import Loader from '../components/Loader';
import { changePreferences } from '../actions/users';
import { formatarCpfCnpj } from '../utils/formatCpfCnpj';

class Perfil extends React.Component {
	constructor(props) {
		super(props);
	}

	handleChangePreferences = async (emailAccess, emailOrders) => {
		const data = {
			email_access: emailAccess,
			email_orders: emailOrders,
		};

		await this.props.dispatch(changePreferences(data));
	};

	render() {
		const { userProfile } = this.props;
		return (
			<div style={{ display: 'flex' }}>
				<ContextAside handleChangeGraph={() => ({})} page={1} />
				<main className="main">
					<ContextHeader page="8" />
					<div className="content_wrap">
						<div className="container-content">
							<div className="page-title">
								<h1 className="page-title__name">PERFIL DE USUÁRIO</h1>
							</div>
							{Object.keys(userProfile).length > 0 ? (
								<React.Fragment>
									<div className="seguranca__internal-content">
										<div className="seguranca__content-flex">
											<div>
												<h3>Nome completo/Razão social</h3>
												<p style={{ marginTop: '5px' }}>Titular da conta</p>
											</div>
											<input
												type="text"
												className="seguranca__input"
												value={userProfile.name}
												readOnly
												style={{ color: '#333', width: 300, border: 'thin solid rgba(0, 0, 0, 0.3)' }}
												disabled
											/>
										</div>
										<div className="seguranca__content-flex">
											<div>
												<h3>CPF/CNPJ</h3>
												<p style={{ marginTop: '5px' }}>Titular da conta</p>
											</div>
											<input
												type="text"
												className="seguranca__input"
												value={formatarCpfCnpj(userProfile.document)}
												readOnly
												style={{ color: '#333', border: 'thin solid rgba(0, 0, 0, 0.3)' }}
												disabled
											/>
										</div>
										<div className="seguranca__content-flex">
											<div>
												<h3 style={{ height: '2.2rem' }}>Idioma da conta</h3>
											</div>
											<input
												type="email"
												className="seguranca__input"
												defaultValue="Português (BR)"
												readOnly
												style={{ color: '#333', border: 'thin solid rgba(0, 0, 0, 0.3)' }}
												disabled
											/>
										</div>
									</div>
									<div className="seguranca">
										<div>
											<h1 className="seguranca__h1">NOTIFICAÇÕES</h1>
										</div>
									</div>
									<div className="seguranca__internal-content">
										<div className="seguranca__content-flex">
											<div>
												<div>
													<Switch
														onChange={() =>
															this.handleChangePreferences(
																userProfile.email_access,
																userProfile.email_orders === 1 ? 0 : 1
															)
														}
														checked={
															userProfile.email_orders === 1 ? true : false
														}
														checkedChildren={<Icon type="check" />}
														unCheckedChildren={<Icon type="close" />}
													/>
													<div
														style={{
															display: 'inline-block',
															padding: '0 10px',
														}}
													>
														Receber e-mails quando uma ordem for criada.
													</div>
													<br />
													<br />
													<Switch
														onChange={() =>
															this.handleChangePreferences(
																userProfile.email_access === 1 ? 0 : 1,
																userProfile.email_orders
															)
														}
														checked={
															userProfile.email_access === 1 ? true : false
														}
														checkedChildren={<Icon type="check" />}
														unCheckedChildren={<Icon type="close" />}
													/>
													<div
														style={{
															display: 'inline-block',
															padding: '0 10px',
														}}
													>
														Receber e-mail quando minha conta for acessada.
													</div>
												</div>
											</div>
										</div>
									</div>
								</React.Fragment>
							) : (
								<Loader />
							)}
						</div>
					</div>
				</main>
			</div>
		);
	}
}

const mapStateToProps = ({ users }) => {
	const { userProfile = {} } = users;
	return { userProfile };
};
export default connect(mapStateToProps)(Perfil);
