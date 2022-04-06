import { Form, Input, Select, Button, Alert, InputNumber, Icon, message } from 'antd';
import { connect } from 'react-redux';
import { createAccount, fetchAllBankAccounts, updateAccount, deleteAccount } from '../../actions/bank';

const FormItem = Form.Item;
const Option = Select.Option;

class ModalCreate extends React.Component {
    state = {
        loadingSubmit: false,
        loadingDelete: false,
        successMessage: '',
        errorMesssage: '',
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                this.setState({ loadingSubmit: true });
                let response;
                if (this.props.method === 'novo') {
                    response = await this.props.dispatch(createAccount(values));
                }
                else {
                    response = await this.props.dispatch(updateAccount(this.props.bankAccount.bank_account_id, values));
                }
                
                if (response.success) {
                    await this.props.dispatch(fetchAllBankAccounts());
                    this.props.handleClose();
                    return message.success(response.message);
                }

                this.setState({ loadingSubmit: false });

                return this.setState({ errorMessage: response.message });
            }
        });
    }

    handleInactiveAccount = async () => {
        this.setState({ loadingDelete: true });
        const response = await this.props.dispatch(deleteAccount(this.props.bankAccount.bank_account_id));
        
        if (response.success) {
            await this.props.dispatch(fetchAllBankAccounts());
            this.props.handleClose();
            return message.success(response.message);
        }

        this.setState({ loadingDelete: false });

        return this.setState({ errorMessage: response.message });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="screen-overlay">
                <Form className="overlay-deposito" onSubmit={this.handleSubmit}>
                    <header className="overlay-deposito__header">
                        <h3>{this.props.method == "novo" ? "Adicionar conta bancária" : "Editar conta bancária"}</h3>
                        <button onClick={this.props.handleClose}
                            className="overlay-deposito__close">
                            <img src="/static/img/cancel.svg" />
                        </button>
                    </header>
                    <div className="overlay-deposito__content" style={{paddingTop:'40px'}}>
                        <FormItem>
                            <p style={{display:'block',position:'absolute',marginTop:'-0.6rem'}}>Selecione o seu banco:</p>
                            {getFieldDecorator('bank', {
                                rules: [{ required: true, message: 'Selecione um banco' }],
                                initialValue: this.props.bankAccount && this.props.bankAccount.bank,
                            })(
                                <Select
                                showSearch
                                style={{marginBottom:'30px'}}
                                placeholder="Selecione o seu banco"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.props.localBanks.length > 0
                                        && this.props.localBanks.map(item => (
                                            <Option key={item.bank} value={item.bank}>{item.bank_name}</Option>
                                        ))}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem style={{display:'inline-block',width:'40%',paddingRight:'20px'}}>
                            <p style={{display:'block',position:'absolute',marginTop:'-0.6rem'}}>Tipo de conta:</p>
                            {getFieldDecorator('account_type', {
                                rules: [{ required: true, message: 'Selecione o tipo de conta.' }],
                                initialValue: this.props.bankAccount && this.props.bankAccount.account_type,
                            })(
                                <Select
                                style={{width:'100%'}}
                                defaultValue='CC'
                                >
                                    <Option value='CC'>Conta Corrente</Option>
                                    <Option value='CP'>Conta Poupança</Option>
                                </Select>
                            )}

                        </FormItem>
                        <FormItem style={{display:'inline-block',width:'20%',paddingRight:'20px'}}>
                            <p style={{display:'block',position:'absolute',marginTop:'-0.6rem'}}>Agência:</p>
                            {getFieldDecorator('agency', {
                                rules: [{ required: true, message: 'Inválido.' }],
                                initialValue: this.props.bankAccount && this.props.bankAccount.agency,
                            })(
                                <Input
                                    placeholder="Agência"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>

                        <FormItem style={{display:'inline-block',width:'40%'}}>
                            <p style={{display:'block',position:'absolute',marginTop:'-0.6rem'}}>Conta:</p>
                            {getFieldDecorator('account_number', {
                                rules: [{ required: true, message: 'Digite o número da sua conta.' }],
                                initialValue: this.props.bankAccount && this.props.bankAccount.account_number,
                            })(
                                <Input
                                    placeholder="Número da conta"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>

                        {this.state.successMessage
                            && <Alert
                                message={this.state.successMessage}
                                type="success"
                                closeText="Fechar"
                                style={{marginTop:'10px'}}
                                onClose={() => this.setState({ successMessage: '' })}
                            />}

                        {this.state.errorMessage
                            && <Alert
                                message={this.state.errorMessage}
                                type="error"
                                closeText="Fechar"
                                style={{marginTop:'10px'}}
                                onClose={() => this.setState({ errorMessage: '' })}
                            />}

                    </div>

                    <footer className="overlay-deposito__footer">
                        {this.props.method === "editar"
                            && <Button
                                type="danger"
                                htmlType='button'
                                onClick={() => this.handleInactiveAccount()}
                                loading={this.state.loadingDelete}>
                                <Icon type="delete"/> Apagar
                        </Button>}

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={this.state.loadingSubmit}
                        >
                            {this.props.method === "editar" ? 'Atualizar conta bancária' : 'Adicionar conta bancária'}
                        </Button>
                    </footer>
                </Form>
            </div >
        );
    }
}
const mapStateToProps = (state) => {
    const { localBanks } = state.bank;
    return { localBanks };
}
const WrappedModalCreate = Form.create()(ModalCreate);
export default connect(mapStateToProps)(WrappedModalCreate);
