import { connect } from 'react-redux';
import { sendReceiptImg } from '../../actions/orders';
import { Alert, message, Button } from 'antd';
import { fetchMyDeposits } from '../../actions/users';

class ModalDepositReceipt extends React.Component {
	state = {
		loadingSubmit: false,
		receiptImg: null,
		receiptName: '',
		errorImg: '',
	};

	handleImageChange = e => {
		e.preventDefault();

		let reader = new FileReader();
		let file = e.target.files[0];

		// Tamanho máximo do arquivo (em Bytes)
		const maxSize = 1024 * 1024 * 15; // 15Mb
		const fileType = ['image/jpg', 'image/jpeg', 'image/png'];

		if (file) {
			if (!fileType.includes(file.type)) {
				return this.setState({
					errorImg: 'Somente é permitido imagens PNG, JPEG, JPG',
					receiptName: '',
				});
			}

			if (file.size > maxSize) {
				return this.setState({
					errorImg: 'Somente é permitido imagens com no máximo: 15MB',
					receiptName: '',
				});
			}

			reader.onloadend = () => {
				this.setState({
					receiptImg: file,
					receiptName: file.name,
					errorImg: '',
				});
			};
			reader.readAsDataURL(file);
		}
	};

	handleSubmit = async e => {
		e.preventDefault();
		this.setState({ loadingSubmit: true, errorImg: '' });
		const response = await this.props.dispatch(
			sendReceiptImg(this.state.receiptImg, this.props.identificator)
		);

		if (!response.success) {
			return this.setState({
				errorImg: response.message,
				loadingSubmit: false,
			});
		}

		await this.props.handleUpdateUserBalance();
		this.setState({ loadingSubmit: false });
		message.success('Comprovante enviado com sucesso!');
		this.props.handleClose();
	};

	render() {
		return (
			<div className="screen-overlay">
				<div onClick={e => e.stopPropagation()} className="overlay-deposito">
					<header className="overlay-deposito__header">
						<h3>Envio de Comprovante</h3>
						<button
							onClick={this.props.handleClose}
							className="overlay-deposito__close"
						>
							<img src="/static/img/cancel.svg" />
						</button>
					</header>
					<div
						className="overlay-deposito__content"
						style={{ paddingBottom: '0', paddingTop: '5px' }}
					>
						<div
							className="overlay-deposito__files"
							style={{ marginBottom: '30px' }}
						>
							<h4 className="overlay-deposito__files__title">
								Comprovante do depósito
							</h4>
							<div
								className="input-file-container"
								style={{ position: 'relative' }}
							>
								<input
									className="input-file js-input-file"
									id="comprovante"
									onChange={this.handleImageChange}
									type="file"
								/>
								<div className="file-return js-file-return" />
								<label
									htmlFor="comprovante"
									className="ant-btn ant-btn-primary input-file-trigger js-input-file-trigger"
									style={{ lineHeight: '2', height: '29px' }}
								>
									Selecionar arquivo
								</label>
								{this.state.receiptName ? (
									<div className="overlay-deposito__receipt-label">
										{this.state.receiptName}
									</div>
								) : (
									<div className="overlay-deposito__receipt-label-invalid">
										Formatos aceitos: .pdf, .jpg, .jpeg, .png
									</div>
								)}
							</div>

							{this.state.errorImg && (
								<Alert
									message={this.state.errorImg}
									type="error"
									onClose={() => this.setState({ errorImg: '' })}
								/>
							)}
						</div>

						<footer
							className="overlay-deposito__footer"
							style={{ paddingLeft: '0', paddingRight: '0' }}
						>
							<button
								onClick={() =>
									this.setState({
										showModalReal: true,
										showConfirmation: false,
									})
								}
								className="primary-button primary-button--text"
							>
								Voltar
							</button>
							<Button
								onClick={e => this.handleSubmit(e)}
								type="primary"
								loading={this.state.loadingSubmit}
							>
								Enviar comprovante de depósito
							</Button>
						</footer>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({});
export default connect(mapStateToProps)(ModalDepositReceipt);
