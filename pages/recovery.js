import { connect } from 'react-redux';
import { forgotPasswordUser } from '../actions/users';
import InputMask from 'react-input-mask';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import isEmail from 'validator/lib/isEmail';
import Router from 'next/router';
import 'isomorphic-unfetch';
import { userService } from '../utils/endpoint';

import '../scss/pages/login.scss';

const InputDocument = props => (
  <InputMask
    disabled={false}
    mask={props.documentMask}
    formatChars={{ '9': '[0-9]', '?': '[0-9 ]' }}
    maskChar={null}
    value={props.value}
    onChange={props.onChange}
  >
    {inputProps => (
      <input
        id="login-document"
        type="text"
        name="document"
        className="form-control cpf-cnpj"
        placeholder="CPF ou CNPJ"
      />
    )}
  </InputMask>
);

class Login extends React.Component {
  state = {
    isLoading: false,
    data: {
      document: '',
      email: '',
    },
    errors: {},
    showPassword: false,
    submitSuccess: false,
  };

  static async getInitialProps({}) {
    import('../static/antd-imports');

    const res = await fetch(`${userService}/app-config`);
    const json = await res.json();
    return { appConfig: json.data };
  }

  validateForm = () => {
    const { data } = this.state;
    const errors = {};
    let isValidForm = true;

    if (!data.document) {
      errors.document = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.document && data.document.replace(/\D/g, '').length < 11) {
      errors.document = 'Minímo 11 caracteres';
      isValidForm = false;
    }

    if (!data.email) {
      errors.email = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.email && !isEmail(data.email)) {
      errors.email = 'E-mail inválido';
      isValidForm = false;
    }

    this.setState({ errors });

    return isValidForm;
  };

  handleChange = e => {
    const { data } = this.state;
    data[e.target.name] = e.target.value;

    this.setState({ data }, this.validateDocument);
  };

  validateDocument = () => {
    const errors = {};
    const { document } = this.state.data;
    if (document && document.replace(/\D/g, '').length < 11) {
      errors.document = 'CPF/CNPF inválido';
    }

    this.setState({ errors });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { data } = this.state;
    const values = {
      ...data,
      document: data.document.replace(/\D/g, ''),
    };

    if (this.validateForm()) {
      const errors = {};

      this.setState({ isLoading: true });
      const response = await this.props.dispatch(forgotPasswordUser(values));
      this.setState({
        isLoading: false,
        data: {
          document: '',
          email: '',
        },
        submitSuccess: true,
      });
    }
  };

  render() {
    const { data, errors, isLoading, submitSuccess } = this.state;
    return (
      <React.Fragment>
        <Head>
          <HeadMetaTags />
          <title>Recuperar senha | {this.props.appConfig.name}</title>
        </Head>
        <div>
          <div id="modal-login" className="custom-modal animated">
            <div className="animated" />
            <button
              onClick={() => Router.push('/login')}
              className="btn btn-default btn-ls-back"
              style={{
                background: 'rgba(0,0,0,.05)!important',
                fontSize: '1.3rem',
              }}
            >
              <i className="ti-arrow-left mr-2" />
              Voltar
            </button>
            <div className="container">
              <div className="row">
                <div className="box">
                  <div className="logo-area">
                    <img src={this.props.appConfig.logo}  />
                  </div>
                  <div className="bg">
                    <h1
                      className="text-center"
                      style={{
                        fontWeight: 200,
                        fontSize: '1.5rem',
                        marginBottom: '1rem',
                      }}
                    >
                      Recuperação de senha
                    </h1>

                    <div className="required-fields">
                      <div className="form-group">
                        <InputDocument
                          documentMask={
                            data.document.replace(/\D/g, '').length <= 11
                              ? '999.999.999-99?'
                              : '99.999.999/9999-99'
                          }
                          onChange={this.handleChange}
                          value={data.document || ''}
                        />

                        {errors.document && (
                          <div className="invalid-feedback">
                            {errors.document}
                          </div>
                        )}
                      </div>
                      <div className="input-group mb-3">
                        <input
                          value={data.email || ''}
                          onChange={this.handleChange}
                          name="email"
                          type="email"
                          className="form-control password-target"
                          placeholder="E-mail"
                        />
                        {errors.email && (
                          <div className="invalid-feedback email">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      {!isLoading ? (
                        <div id="login-btn" className="form-group">
                          <button
                            onClick={e => this.handleSubmit(e)}
                            type="submit"
                            className="text-center btn btn-block btn-primary"
                          >
                            Prosseguir
                          </button>
                        </div>
                      ) : (
                        <div id="login-btn-loading" className="form-group">
                          <button
                            type="button"
                            className="text-center btn btn-block btn-default"
                            style={{
                              backgroundColor: '#ccc',
                              padding: '1rem 0',
                              outline: 'none!important',
                              boxShadow: 'none!important',
                            }}
                          >
                            Enviando...
                          </button>
                        </div>
                      )}
                      {submitSuccess && (
                        <div className="positive-feedback">
                          Caso os dados estejam corretos, você receberá um
                          e-mail com instruções para resetar sua senha.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(Login);
