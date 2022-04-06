import { connect } from "react-redux";

const ModalConfirmacao = ({ dispatch }) =>
    <div onClick={() => this.setState({ showConfirmation: false })} className="screen-overlay">
        <div onClick={(e) => e.stopPropagation()} className="overlay-deposito">
            <header className="overlay-deposito__header">
                <h3>Confirmação do Depósito</h3>
                <button onClick={() => this.setState({ showConfirmation: false })} className="overlay-deposito__close">
                    <img src="/static/img/cancel.svg" />
                </button>
            </header>
            <div className="overlay-deposito__content">
                <div className="overlay-deposito__block">
                    <div className="overlay-deposito__block__item">
                        <h4 className="overlay-deposito__block__name">Dados do Depósito</h4>
                        <ul className="overlay-deposito__block__list">
                            <li><span>Titular</span> Wallace Erick da Silva</li>
                            <li><span>Banco</span> Banco Bradesco SA.</li>
                            <li><span>Tipo</span> Transferência entre contas</li>
                            <li><span>Valor</span> R$ 2.000,00</li> 
                        </ul>
                    </div>
                    <div className="overlay-deposito__block__item">
                        <h4 className="overlay-deposito__block__name">Dados do Destinatário</h4>
                        <ul className="overlay-deposito__block__list">
                            <li><span>Titular</span> Arbwallet Digital LTDA</li>
                            <li><span>Banco</span> Banco Bradesco S.A.</li>
                        </ul>
                        <ul className="overlay-deposito__block__list overlay-deposito__block__list--inline">
                            <li><span>Agência</span> 1236-0</li> 
                            <li><span>Conta</span> 0608367-6</li> 
                        </ul>
                    </div>
                </div>
                <div className="overlay-deposito__warning">
                    <h4 className="overlay-deposito__warning__title">Dados do Depósito</h4>
                    <ul className="overlay-deposito__warning__list">
                        <li>• Lembre-se de <strong>conferir seus dados</strong> para evitar cancelamentos ou atrasos.</li>
                        <li>• Obrigatoriamente, este depósito deve vir de uma conta pertencente a <strong>Wallace Erick da Silva</strong> - 372.858.658-77. Caso contrário, ele será cancelado em até <strong>30 dias</strong>.</li>
                    </ul>
                </div>
                <div className="overlay-deposito__files">
                    <h4 className="overlay-deposito__files__title">Comprovante</h4>
                    <div className="input-file-container">  
                        <input className="input-file js-input-file" id="comprovante" type="file" />
                        <div className="file-return js-file-return"></div>
                        <label htmlFor="comprovante" className="primary-button primary-button--upload input-file-trigger js-input-file-trigger">Selecionar</label>
                    </div>
                </div> 
            </div>
            <footer className="overlay-deposito__footer">
                <button onClick={() => this.setState({ showReal: true, showConfirmation: false })} className="primary-button primary-button--text">Voltar</button>
                <button onClick={() => this.setState({ showConfirmation: false })} className="primary-button primary-button--continue">Enviar</button>
            </footer>
        </div>
    </div>

export default connect(state => state)(ModalConfirmacao);