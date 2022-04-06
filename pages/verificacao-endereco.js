import Link from "next/link";
import Router from "next/router";
import ContextAside from '../components/context/aside';
import ContextHeader from "../components/context/header";
import { connect } from 'react-redux';
import { verificationAddress } from '../actions/users';
import { Form, Input, Alert, Spin, Icon, message } from 'antd';

const FormItem = Form.Item;

const antIcon = <Icon type="loading" style={{ fontSize: 20, color: '#333', margin: '0', padding: '0' }} spin />;

class VerifyAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            successMsg: '',
            loadingSubmit: false,
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const cep = values.cep;
                const address = `${values.street}, ${values.number} ${values.complement}`;

                const data = {
                    address,
                    cep,
                }

                this.setState({ loadingSubmit: true });
                const response = await this.props.dispatch(verificationAddress(data));
                this.setState({ loadingSubmit: false });

                if (!response.success) {
                    return this.setState({ errorMsg: response.message });
                }

                message.success(response.message);
                Router.push('/verificacao');
            }
        });
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div style={{ display: "flex" }}>
                <ContextAside page={20} />
                <main className="main">
                    <ContextHeader page="7" />
                    <div className="container-content verificacao">
                        <Form>
                            <div className="page-title">
                                <h1 className="page-title__name">
                                    <Link prefetch href="/verificacao">Verificação de Conta</Link>
                                    <span>Endereço</span>
                                </h1>
                                <Link prefetch href="/verificacao">
                                    <button href="javascript:void()" className="dark-button" style={{position:'absolute',right:'9rem'}}>
                                      <Icon type="swap-left" style={{ marginRight: '5px' }} /> Voltar
                                    </button>
                                </Link>
                                <button
                                    style={this.state.loadingSubmit ? { pointerEvents: 'none', width: '8rem', height: '1.8rem' } : { width: '8rem', height: '1.8rem' }}
                                    onClick={(e) => this.handleSubmit(e)}
                                    className="success-button">
                                    {this.state.loadingSubmit ? <Spin indicator={antIcon} /> : <div><Icon type="check" style={{ marginRight: '5px' }} /> Enviar</div>}
                                </button>
                            </div>
                            <div className="verificacao__content verificacao__content--inside">
                                {this.state.errorMsg && <Alert
                                    message={this.state.errorMsg}
                                    type="error"
                                    closeText="Fechar"
                                    onClose={() => this.setState({ errorMsg: '' })}
                                />}

                                {this.state.successMsg && <Alert
                                    message={this.state.successMsg}
                                    type="success"
                                    closeText="Fechar"
                                    onClose={() => this.setState({ successMsg: '' })}
                                />}


                                <h2 className="verificacao__item__title">Cadastro de Endereço</h2>

                                <form className="verificacao__form">
                                    <div className="verificacao__input">
                                        <label className="verificacao__input__label">
                                            <span>CEP</span>
                                            <small>Digite o seu CEP.</small>
                                        </label>
                                        <div>
                                          <FormItem>
                                              <Icon type="edit" style={{color:'orange',marginRight:'1rem',fontSize:'1.2rem'}} />
                                              {getFieldDecorator('cep', {
                                                  rules: [{ required: true, message: 'Campo obrigatório' }],
                                              })(
                                                  <Input placeholder='CEP' style={{width:'20rem'}} />
                                              )}
                                          </FormItem>
                                        </div>
                                    </div>
                                    <div className="verificacao__input">
                                        <label className="verificacao__input__label">
                                            <span>Endereço</span>
                                            <small>Digite o seu endereço completo.</small>
                                        </label>
                                        <div>
                                          <FormItem>
                                              <Icon type="edit" style={{color:'orange',marginRight:'1rem',fontSize:'1.2rem'}} />
                                              {getFieldDecorator('street', {
                                                  rules: [{ required: true, message: 'Campo obrigatório' }],
                                              })(
                                                  <Input placeholder='Nome da Rua' style={{width:'20rem'}} />
                                              )}
                                          </FormItem>
                                        </div>
                                    </div>
                                    <div className="verificacao__input">
                                        <label className="verificacao__input__label">
                                            <span>Número do imóvel</span>
                                            <small>Digite o número do imóvel.</small>
                                        </label>
                                        <div>
                                          <FormItem>
                                              <Icon type="edit" style={{color:'orange',marginRight:'1rem',fontSize:'1.2rem'}} />
                                              {getFieldDecorator('number', {
                                                  rules: [{ required: true, message: 'Campo obrigatório' }],
                                              })(
                                                  <Input placeholder='Número' style={{width:'20rem'}} />
                                              )}
                                          </FormItem>
                                        </div>
                                    </div>
                                    <div className="verificacao__input">
                                        <label className="verificacao__input__label">
                                            <span>Complemento</span>
                                            <small>Digite o complemento do endereço.</small>
                                        </label>
                                        <div>
                                          <FormItem>
                                              <Icon type="edit" style={{color:'orange',marginRight:'1rem',fontSize:'1.2rem'}} />
                                              {getFieldDecorator('complement', {
                                                  rules: [{ required: true, message: 'Campo obrigatório' }],
                                              })(
                                                  <Input placeholder='Complemento' style={{width:'20rem'}} />
                                              )}
                                          </FormItem>
                                        </div>
                                    </div>
                                </form>


                            </div>
                        </Form>
                    </div>

                    <div className="verificacao__actions">

                    </div>
                </main>
            </div >
        )
    }
}


const WrappedVerifyAddress = Form.create()(VerifyAddress);
export default connect()(WrappedVerifyAddress);
