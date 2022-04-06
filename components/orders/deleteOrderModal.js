import socket from "../../utils/socketConnection";
import { connect } from 'react-redux';
import { fetchMyBalance } from "../../actions/users";
import currencyFormatter from 'currency-formatter';
import { Alert, message } from 'antd';

class DeleteOrdelModal extends React.Component {
    state = {
        submitMessage: '',
        submitError: false,
        loadingSubmit: false,
    }


    handleDeleteOrder = (e) => {
        e.preventDefault();

        this.setState({ loadingSubmit: true });

        const data = {
            orderIdentificator: this.props.order.orderIdentificator,
            token: localStorage.getItem('auth_token'),
        };

        socket.emit("order_delete", data, (response) => {
            this.setState({
                loadingSubmit: false
            });

            if (!response.success) {
                return this.setState({
                    submitMessage: response.message,
                    submitError: true
                });
            }

            message.success('Ordem deletada com sucesso');
            this.props.dispatch(fetchMyBalance());
            this.props.handleClose();
        });
    }

    render() {
        return (
            <div className="screen-overlay">
                <div className="overlay-deposito">
                    <header className="overlay-deposito__header">
                        <h3>Confirmação de exclusão</h3>
                        <button onClick={this.props.handleClose} className="overlay-deposito__close"><img src="/static/img/cancel.svg" /></button>
                    </header>
                    <div className="overlay-deposito__content" style={{paddingTop:'20px'}}>
                        {
                            <React.Fragment>
                                <p style={{marginBottom:'10px'}}>Deseja confirmar a exclusão da ordem {this.props.order.orderIdentificator}?</p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                <div className="row simple-row">
                                    <div className="col-6">
                                      <div><b>Par:</b> {this.props.order.pair}</div>
                                    </div>
                                    <div className="col-6">
                                      <div><b>Quantidade:</b> {currencyFormatter.format(this.props.order.amount, {
                                          symbol: this.props.currencySymbol,
                                          format: "%s %v",
                                          decimal: ",",
                                          thousand: ".",
                                          precision: this.props.currencySymbol === 'R$' ? 2 : 8
                                      })}</div>
                                    </div>
                                </div>
                                <div className="row simple-row">
                                  <div className="col-6">
                                    <div><b>Preço:</b> {currencyFormatter.format(this.props.order.price, {
                                        symbol: 'R$',
                                        format: "%s %v",
                                        decimal: ",",
                                        thousand: ".",
                                        precision: 2,
                                    })}</div>
                                    </div>
                                    <div className="col-6">
                                        <b>Valor Total:</b> {currencyFormatter.format(this.props.order.price * this.props.order.amount, {
                                            symbol: 'R$',
                                            format: "%s %v",
                                            decimal: ",",
                                            thousand: ".",
                                            precision: 'R$',
                                        })}
                                    </div>
                                  </div>

                                    <div>
                                        {this.state.submitSuccess
                                            && <Alert
                                                showIcon
                                                type='success'
                                                message={this.state.submitMessage}
                                                closeText="Fechar"
                                                onClose={() => this.setState({
                                                    submitSuccess: false,
                                                    submitMessage: ''
                                                })}
                                            />}

                                        {this.state.submitError
                                            && <Alert
                                                showIcon
                                                type='error'
                                                message={this.state.submitMessage}
                                                closeText="Fechar"
                                                onClose={() => this.setState({
                                                    submitError: false,
                                                    submitMessage: ''
                                                })}
                                            />}

                                    </div>
                                </div>

                                <button
                                    style={{ color: "#FFF" }}
                                    onClick={this.props.handleClose}
                                    className={`place-order-btn place-order-btn-no aside__form-button aside__form-button--red`}>
                                    NÃO
                                </button>
                                <button
                                    style={this.state.loadingSubmit
                                        ? { color: "#FFF", cursor: 'not-allowed' }
                                        : { color: "#FFF" }
                                    }
                                    onClick={e => this.handleDeleteOrder(e)}
                                    className={`place-order-btn place-order-btn-yes place-order-btn-delete aside__form-button`}
                                >
                                    {this.state.loadingSubmit ? 'AGUARDE...' : 'SIM'}
                                </button>

                            </React.Fragment>}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userProfile: state.users.userProfile,
})
export default connect(mapStateToProps)(DeleteOrdelModal);
