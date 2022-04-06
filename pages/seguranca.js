import ContextAside from "../components/context/aside";
import ContextHeader from "../components/context/header";
import { Alert, Form, Button, Input } from 'antd';
import { connect } from 'react-redux';
import { generate2Fa } from '../actions/users';
import Validate2FaModal from '../components/seguranca/Validate2FaModal';
import Show2FaModal from '../components/seguranca/Show2FaModal';
import ResetPasswordModal from '../components/seguranca/ResetPasswordModal';
import HistoryList from "../components/seguranca/HistoryList";
import Loader from '../components/Loader';

const FormItem = Form.Item;

class Seguranca extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            showModalGenerate2Fa: false,
            showModal2Fa: false,
            password2Fa: '',
            errorMsg: '',
            isFetching: true,
            loading2Fa: false,
            error2Fa: '',
            qrCode: '',
            secret2Fa: '',
            isOpenValidate2Fa: false,
            showResetPassModal: false,
        }
    }

    handleShow2Fa = async () => {
        if (!this.state.password2Fa) {
            return this.setState({ error2Fa: 'Preencha a senha' })
        }


        this.setState({ loading2Fa: true, error2Fa: '' });
        const response = await this.props.dispatch(generate2Fa(this.state.password2Fa));

        this.setState({ loading2Fa: false });

        if (!response.success) {
            return this.setState({ error2Fa: response.message })
        }

        this.setState({
            error2Fa: '',
            showModalGenerate2Fa: false,
            password2Fa: '',
            qrCode: response.data.qrCode,
            secret2Fa: response.data.secret,
            isOpenValidate2Fa: true,
        });
    }

    copyToClipboard = (name) => {
        document.getElementById(name).select();
        document.getElementById(name).focus();
        document.execCommand('copy');
    }

    render() {
        const { showModalGenerate2Fa, password2Fa, loading2Fa } = this.state;

        return (
            <div style={{ display: "flex" }}>
                <ContextAside page={3} />
                <main className="main">
                    <ContextHeader page="8" />
                    <div className="content_wrap">
                    <div className="container-content">
                        <div className="page-title">
                            <h1 className="page-title__name">SEGURANÇA</h1>
                        </div>

                        {Object.keys(this.props.userProfile).length > 0 ?
                            <React.Fragment>
                                <div className="seguranca__internal-content">
                                    <div className="seguranca__content-flex">
                                        <div>
                                            <h3>Senha de acesso</h3>
                                            <p style={{marginTop:'5px'}}>Utilize sempre senhas seguras com no mínimo 8 caracteres.</p>
                                        </div>
                                        <button
                                            onClick={() => this.setState({showResetPassModal: true})}
                                            className="seguranca__button">
                                            ALTERAR MINHA SENHA
                                        </button>
                                    </div>
                                    <div className="seguranca__content-flex">
                                        <div>
                                            <h3>Autenticação em 2 fatores (2FA)</h3>
                                            <p style={{marginTop:'5px'}}>É altamente recomendado manter a 2FA sempre ativada.</p>
                                        </div>
                                        {this.props.userProfile.is2FaActived
                                            ? <button
                                                onClick={() => this.setState({ showModal2Fa: true })}
                                                className="seguranca__button">
                                                EXIBIR SECRET
                                            </button>
                                            : <button
                                                onClick={() => this.setState({ showModalGenerate2Fa: true })}
                                                className="seguranca__button">
                                                ATIVAR 2FA
                                        </button>}
                                    </div>
                                    <div className="seguranca__content-flex" style={{display:'none'}}>
                                        <div>
                                            <h4 style={{ height: '2.2rem' }}>PIN</h4>
                                        </div>
                                        <button
                                            onClick={() => ({})}
                                            className="seguranca__button">
                                            CADASTRAR PIN
                                        </button>
                                    </div>
                                </div>
                            </React.Fragment>
                            : <Loader />}

                        <HistoryList />
                    </div>
                    </div>
                </main>

                {
                    !!showModalGenerate2Fa &&
                    <div className="screen-overlay">
                        <div onClick={(e) => e.stopPropagation()} className="overlay-deposito">
                            <header className="overlay-deposito__header">
                                <h3>Ativar Autenticação em 2 Fatores (2FA)</h3>
                                <button onClick={() => this.setState({ showModalGenerate2Fa: false })} className="overlay-deposito__close">
                                    <img src="/static/img/cancel.svg" />
                                </button>
                            </header>
                            <div className="overlay-deposito__content">
                                <FormItem>
                                    <Input
                                        type='password'
                                        placeholder='Digite sua senha'
                                        value={password2Fa || ''}
                                        onChange={(e) => this.setState({ password2Fa: e.target.value })}
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
                                <button onClick={() => this.setState({ showModalGenerate2Fa: false })} className="primary-button primary-button--text">Cancelar</button>
                                <FormItem>
                                    <Button
                                        onClick={() => this.handleShow2Fa()}
                                        loading={loading2Fa}
                                        type="primary">
                                        Continuar
                                     </Button>
                                </FormItem>
                            </footer>
                        </div>
                    </div>
                }


                {this.state.isOpenValidate2Fa &&
                    <Validate2FaModal
                        handleClose={() => this.setState({
                            isOpenValidate2Fa: false,
                            qrCode: '',
                            secret2Fa: ''
                        })}
                        qrCode={this.state.qrCode}
                        secret2Fa={this.state.secret2Fa}
                    />}

                {this.state.showModal2Fa &&
                    <Show2FaModal
                        handleClose={() => this.setState({
                            showModal2Fa: false,
                        })}
                    />}

                {this.state.showResetPassModal &&
                    <ResetPasswordModal
                        handleClose={() => this.setState({
                            showResetPassModal: false,
                        })}
                    />}
            </div>
        )
    }
}

const mapStateToProps = ({users}) => {
    const { userProfile } = users;
    return { userProfile };
}
const WrappedSeguranca = Form.create()(Seguranca);
export default connect(mapStateToProps)(WrappedSeguranca);
