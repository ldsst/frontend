import ReactTooltip from 'react-tooltip';
import { qrCodeSrc } from '../../utils/qrCode';
import Link from 'next/link';
import { Alert } from 'antd';

const copyToClipboard = name => {
	document.getElementById(name).select();
	document.getElementById(name).focus();
	document.execCommand('copy');
};

const modalDepositCrypto = ({ currency, handleClose, profile }) => (
	<div className="screen-overlay">
		<div className="overlay-deposito">
			<header className="overlay-deposito__header">
				<h3 style={{ textTransform: 'capitalize' }}>
					Receber {currency.currency_name}
				</h3>
				<button
					onClick={() => handleClose()}
					className="overlay-deposito__close"
				>
					<img src="/static/img/cancel.svg" />
				</button>
			</header>
			<div className="overlay-deposito__content">
				{profile.verified === 1 ? (
					<React.Fragment>
						<div className="overlay-deposito__container-input">
							<label className="overlay-deposito__label">
								Endereço da Carteira
							</label>
							<p className="overlay-deposito__wallet">
								<input
									id={currency.currency.toLowerCase() + '_address'}
									value={currency.wallet || '-'}
									className="overlay-deposito__wallet-input"
									readOnly
								/>
								<img
									data-tip="Copiar endereço de depósito"
									className="overlay-deposito__copy"
									src="/static/img/copy.svg"
									style={{ cursor: 'pointer' }}
									onClick={() =>
										copyToClipboard(
											currency.currency.toLowerCase() + '_address'
										)
									}
								/>
								<ReactTooltip
									effect={'solid'}
									place={'right'}
									border={true}
									className={'tooltip'}
								/>
							</p>
						</div>
						<div className="overlay-deposito__info">
							<div
								className="overlay-deposito__container-txt"
								style={{ width: '100%' }}
							>
								<p style={{ letterSpacing: '0px', lineHeight: '1.5rem' }}>
									- <b>Valor mínimo para depósito:</b>{' '}
									{currency.currency_symbol} 0,0001
									<br />- Seu depósito será liberado após{' '}
									<b>{currency.min_confirmations} confirmações</b> na
									Blockchain.
									<br />
									- Após o número de confirmações necessárias, o valor do
									depósito será automaticamente liberado na sua conta.
									<br />- Envie apenas <b>{currency.currency_name}</b> para este
									endereço.
									<br />- Depósitos são <b>isentos de quaisquer comissões</b>.
								</p>
							</div>
							<figure className="overlay-deposito__fig-qr-code">
								<img
									className="overlay-deposito__qr-code"
									src={qrCodeSrc(currency.currency_name, currency.wallet)}
								/>
							</figure>
						</div>
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
								className="primary-button primary-button--continue verificacao__item__button verificacao__item__anchor"
							>
								Clique aqui para verificar sua conta
							</a>
						</Link>
					</div>
				)}
			</div>
		</div>
	</div>
);

export default modalDepositCrypto;
