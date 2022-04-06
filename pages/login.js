import { connect } from 'react-redux';
import { loginUser, hasUserLogout } from '../actions/users';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import Router from 'next/router';
import Head from 'next/head';
import 'isomorphic-unfetch';
import { message, Alert, Icon, Spin } from 'antd';
import { userService } from '../utils/endpoint';

const antIcon = (
  <Icon type="loading" style={{ fontSize: 24, color: '#333' }} spin />
);

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
  constructor(props) {
    super(props);
    this.foreground = React.createRef();

    this.state = {
      isLoading: false,
      data: {
        document: '',
        password: '',
        auth2fa: '',
      },
      errors: {},
      show2FA: false,
      showPassword: false,
    };
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

    if (!data.password) {
      errors.password = 'Campo obrigatório';
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

  handleClick = e => {
    this.setState({ show2FA: false });
    const { data } = this.state;
    data['tfa'] = '';

    this.setState({ data });
  };

  validateDocument = () => {
    const errors = {};
    const { document } = this.state.data;
    if (document && document.replace(/\D/g, '').length < 11) {
      errors.document = 'CPF/CNPF inválido';
    }

    this.setState({ errors });
  };

  handleKeyUp = async e => {
    if (String(e.target.value).length >= 6) {
      this.handleSubmit(e);
    }
  };

  check2FA = async e => {
    e.preventDefault();
    const { data } = this.state;
    const values = {
      ...data,
      document: data.document.replace(/\D/g, ''),
    };

    this.state.data.auth2fa = '';

    if (this.validateForm()) {
      const errors = {};

      this.setState({ isLoading: true });
      const response = await this.props.dispatch(loginUser(values));
      this.setState({ isLoading: false });
      if (!response.success) {
        if (
          this.state.data.auth2fa == '' &&
          response.message == 'Token inválido'
        ) {
          this.setState({ show2FA: true });
        } else {
          errors.apiError = response.message;
        }

        return this.setState({ errors });
      }
    }

    // Animation when login
    this.foreground.current.style.height = '0px';
  };

  handleKeyPress = async e => {
    if (e.key === 'Enter') {
      this.check2FA(e);
    }
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
      const response = await this.props.dispatch(loginUser(values));
      this.setState({ isLoading: false });
      if (!response.success) {
        if (
          this.state.data.auth2fa == '' &&
          response.message == 'Token inválido'
        ) {
          this.setState({ show2FA: true });
        } else {
          errors.apiError = response.message;
        }

        return this.setState({ errors });
      }
    }
  };

  static async getInitialProps({}) {
    const res = await fetch(`${userService}/app-config`);
    const json = await res.json();
    return { appConfig: json.data };
  }

  async componentDidMount() {
    if (this.props.hasUserLogout) {
      message.config({
        top: 10,
        duration: 5,
        maxCount: 1,
      });
      message.success('Logout efetuado com segurança');
      this.props.dispatch(hasUserLogout(false));
    }
  }

  render() {
    const { data, errors, show2FA, showPassword, isLoading } = this.state;
    return (
      <React.Fragment>
        <Head>
          <title>Login | {this.props.appConfig.name}</title>
        </Head>
        <div>
          <div id="modal-login" className="custom-modal animated">
            <div className="animated" ref={this.foreground} />
            <a
              href={this.props.appConfig.site}
              className="btn btn-default btn-ls-back"
              style={{
                background: 'rgba(0,0,0,.1)!important',
                fontSize: '1.3rem',
              }}
            >
              <i className="ti-arrow-left mr-2" />
              Voltar
            </a>
            <div className="container">
              <div className="row">
                <div className="box">
                  <div className="logo-area">
                    <img src={this.props.appConfig.logo}  />
                  </div>
                  <div className="bg">
                    {!show2FA && (
                      <div className="required-fields">
                        <div className="form-group">
                          <InputDocument
                            documentMask={
                              data.document.replace(/\D/g, '').length <= 11
                                ? '999.999.999-99?'
                                : '99.999.999/9999-99'
                            }
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
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
                            value={data.password || ''}
                            onChange={this.handleChange}
                            name="password"
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-control password-target"
                            onKeyPress={this.handleKeyPress}
                            placeholder="Senha"
                          />
                          <div className="input-group-append">
                            <button
                              onClick={() =>
                                this.setState({
                                  showPassword: !this.state.showPassword,
                                })
                              }
                              className="input-group-text"
                              style={{ borderBottomRightRadius: 0 }}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {errors.password && (
                            <div className="invalid-feedback password">
                              {errors.password}
                            </div>
                          )}
                        </div>

                        {errors.apiError && (
                          <Alert
                            message="Error"
                            type="error"
                            showIcon
                            message={errors.apiError}
                            style={{ marginBottom: '15px' }}
                          />
                        )}

                        {!isLoading ? (
                          <div id="login-btn" className="form-group">
                            <button
                              onClick={e => this.check2FA(e)}
                              type="submit"
                              className="text-center btn btn-block btn-primary"
                            >
                              Login
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
                              <Spin indicator={antIcon} />
                            </button>
                          </div>
                        )}
                        <div className="form-group">
                          <hr />
                        </div>
                        <button
                          onClick={() => Router.push('/signup')}
                          type="button"
                          className="btn btn-block btn-primary"
                        >
                          <span
                            style={{
                              fontSize: '1rem',
                              display: 'block',
                              marginBottom: '5px',
                              fontWeight: 'normal',
                            }}
                          >
                            Não possui uma conta?
                          </span>
                          <sub>Cadastre-se agora!</sub>
                        </button>
                        <p
                          className="text-center mt-2"
                          style={{ marginBottom: 0 }}
                        >
                          <a
                            href="/recovery"
                            className="text-center"
                            style={{ color: '#111', cursor: 'pointer' }}
                          >
                            Esqueceu sua senha?
                          </a>
                        </p>
                      </div>
                    )}
                    {show2FA && (
                      <div className="2fa-fields">
                        <p
                          className="text-center"
                          style={{ fontSize: '1.3rem', marginBottom: '20px' }}
                        >
                          Autenticação em 2 Fatores
                        </p>
                        <div className="input-group mb-3">
                          <div className="input-group-prepend">
                            <div className="input-group-text">
                              <FaLock />
                            </div>
                          </div>

                          <input
                            value={data.auth2fa || ''}
                            onChange={this.handleChange}
                            name="auth2fa"
                            id="login-2fa"
                            type="text"
                            className="form-control"
                            placeholder="------"
                            maxlength="6"
                            onKeyUp={this.handleKeyUp}
                            style={{
                              fontSize: '1.5rem',
                              letterSpacing: '20px',
                              fontWeight: 'normal',
                              textAlign: 'center',
                            }}
                          />
                        </div>

                        {errors.apiError && (
                          <Alert
                            message="Error"
                            type="error"
                            showIcon
                            message={errors.apiError}
                            style={{ marginBottom: '15px' }}
                          />
                        )}

                        <div id="login-2fa-btn" className="form-group">
                          {!isLoading ? (
                            <div id="login-btn" className="form-group">
                              <button
                                onClick={e => this.handleSubmit(e)}
                                type="submit"
                                className="text-center btn btn-block btn-primary"
                              >
                                Login
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
                                <Spin indicator={antIcon} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div
                          id="login-2fa-btn-loading"
                          className="form-group"
                          style={{ display: 'none' }}
                        >
                          <button
                            type="button"
                            className="text-center btn btn-block btn-default progress-bar progress-bar-striped progress-bar-animated"
                            style={{
                              backgroundColor: '#ccc',
                              padding: '1rem 0',
                              outline: 'none!important',
                              boxShadow: 'none!important',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                margin: 'auto',
                                color: '#222',
                                fontWeight: 500,
                              }}
                              className="text-center"
                            >
                              <Spin indicator={antIcon} />
                            </span>
                          </button>
                        </div>
                        <button
                          onClick={e => this.handleClick(e)}
                          type="button"
                          className="btn btn-block btn-primary"
                          style={{
                            background: 'transparent',
                            color: '#222',
                            borderColor: 'rgba(0,0,0,.1)',
                          }}
                        >
                          « Voltar
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-center mt-3">
                    <a
                      target="_blank"
                      href={`${this.props.appConfig.site}/termos-de-uso`}
                      className="text-center"
                      style={{ color: '#fff' }}
                    >
                      Termos de Uso
                    </a>{' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { hasUserLogout } = state.users;
  return { hasUserLogout };
};
export default connect(mapStateToProps)(Login);
