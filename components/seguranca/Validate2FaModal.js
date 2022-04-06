import { connect } from 'react-redux';
import { Form, Input, message, Button, Alert } from 'antd';
import ReactTooltip from 'react-tooltip';
import { validate2Fa, fetchUserProfile } from '../../actions/users';

const FormItem = Form.Item;

class Validate2FaModal extends React.Component {
    state = {
        error2Fa: '',
        loadingSubmit: false,
        secret: '',
    }

    handleSubmit = async () => {
        if (!this.state.secret) {
            return this.setState({ error2Fa: 'Preencha o secret' });
        }

        this.setState({ error2Fa: '', loadingSubmit: true });
        const response = await this.props.dispatch((validate2Fa(this.state.secret)));
        await this.props.dispatch(fetchUserProfile());
        this.setState({ loadingSubmit: false });

        if (!response.success) {
           return this.setState({ error2Fa: response.message });
        }

        message.success('2FA cadastrada com sucesso!');
        this.props.handleClose();
    }

    copyToClipboard = (name) => {
        document.getElementById(name).select();
        document.getElementById(name).focus();
        document.execCommand('copy');
    }

    render() {
        return (
            <div className="screen-overlay">
                <div className="overlay-deposito">
                    <header className="overlay-deposito__header">
                        <h3>Ativar Autenticação em 2 Fatores (2FA)</h3>
                        <button onClick={this.props.handleClose} className="overlay-deposito__close">
                            <img src="/static/img/cancel.svg" />
                        </button>
                    </header>
                    <div className="overlay-deposito__content">

                        <h3 style={{marginBottom:'10px'}}>Tutorial:</h3>

                        <div style={{lineHeight:'1.5'}}>
                          <b>1.</b> Baixe o aplicativo Authy ou Google Authenticator no seu celular Android, iOS ou Windows Phone.
                          <br/>
                          <b>2.</b> Escaneie o QR Code abaixo, e confirme a criação da conta no aplicativo.
                          <br/>
                          <b>3.</b> Você irá ver um token de 6 números no aplicativo, que expira a cada 30 segundos.
                          <br/>
                          <b>4.</b> Digite esse token abaixo, e clique em "Continuar".
                        </div>

                        <div style={{display:'block',width:'100%',height:'2px',background:'rgba(0,0,0,.1)',marginTop:'10px',marginBottom:'10px'}} ></div>

                        {this.props.qrCode &&
                            <img src={this.props.qrCode} style={{display:'block',margin:'auto',textAlign:'center'}}/>
                        }

                        {this.props.secret2Fa &&
                            <p className="overlay-deposito__wallet" style={{marginBottom:'10px'}}>
                                <b>Secret:</b>
                                <input
                                    id='secret2fa'
                                    value={this.props.secret2Fa || ''}
                                    style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'default', marginLeft:'20px' }} readOnly />
                                <img
                                    data-tip="Copiar Secret"
                                    className="overlay-deposito__copy"
                                    src="/static/img/copy.svg"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => this.copyToClipboard('secret2fa')} />
                                <ReactTooltip effect={'solid'} place={'right'} border={true} className={'tooltip'} />
                            </p>
                        }

                        <span style={{display:'block',marginTop:'10px',marginBottom:'5px',fontWeight:'600'}}>Digite o token numérico aqui:</span>
                        <FormItem>
                            <Input
                                placeholder="------"
                                value={this.state.secret || ''}
                                maxlength="6"
                                className="tfa-input"
                                onChange={(e) => this.setState({ secret: e.target.value })}
                            />
                        </FormItem>


                        {this.state.error2Fa
                            && <Alert
                                type='error'
                                message={this.state.error2Fa}
                                closeText='Fechar'
                                showIcon
                                onClose={() => this.setState({ error2Fa: '' })}
                            />
                        }
                    </div>
                    <footer className="overlay-deposito__footer">
                        <button onClick={() => this.props.handleClose()} className="primary-button primary-button--text">Cancelar</button>
                        <FormItem>
                            <Button
                                onClick={() => this.handleSubmit()}
                                loading={this.state.loadingSubmit}
                                type="primary">
                                Continuar
                                 </Button>
                        </FormItem>
                    </footer>
                </div>
            </div>
        )
    }
}

export default connect()(Validate2FaModal);
