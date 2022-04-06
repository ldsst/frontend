import { connect } from 'react-redux';
import { signupUser } from '../actions/users';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'antd';
import InputMask from 'react-input-mask';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import zxcvbn from 'zxcvbn';
import moment from 'moment';
import isEmail from 'validator/lib/isEmail';
import Router from 'next/router';
import 'isomorphic-unfetch';
import { userService } from '../utils/endpoint';

import '../scss/pages/login.scss';

Number.prototype.formatMoney = function(c, d, t) {
  var n = this,
    c = isNaN((c = Math.abs(c))) ? 2 : c,
    d = d == undefined ? '.' : d,
    t = t == undefined ? ',' : t,
    s = n < 0 ? '-' : '',
    i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
    j = (j = i.length) > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : '')
  );
};

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
        type="text"
        name="document"
        className="form-control cpf-cnpj"
        placeholder="CPF ou CNPJ"
      />
    )}
  </InputMask>
);

const InputBirthDate = props => (
  <InputMask
    disabled={false}
    mask={'99/99/9999'}
    value={props.value}
    onChange={props.onChange}
  >
    {inputProps => (
      <input
        type="text"
        name="birth_date"
        className="form-control"
        placeholder="Data de Nascimento"
      />
    )}
  </InputMask>
);

class Signup extends React.Component {
  state = {
    isLoading: false,
    data: {
      document: '',
      password: '',
      birth_date: '',
      email: this.props.query.email ? this.props.query.email : '',
    },
    showEmailConfirm: false,
    showBirthDate: true,
    errors: {},
    passwordStrength: '',
    passwordScore: '',
    showPassword: false,
    teste: '',
  };

  validateForm = () => {
    const { data, passwordScore } = this.state;
    const errors = {};
    let isValidForm = true;

    if (!data.document) {
      errors.document = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.document && data.document.replace(/\D/g, '').length < 11) {
      errors.document = 'CPF/CNPJ inválido';
      isValidForm = false;
    }

    if (data.document.replace(/\D/g, '').length < 14 && !data.birth_date) {
      errors.birth_date = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.birth_date && data.birth_date.split('/')[1] > 12) {
      errors.birth_date = 'Mês inválido';
      isValidForm = false;
    }

    if (data.birth_date && data.birth_date.split('/')[0] > 31) {
      errors.birth_date = 'Dia inválido';
      isValidForm = false;
    }

    if (data.birth_date) {
      const years = moment().diff(
        moment(data.birth_date, 'DD/MM/YYYY'),
        'years'
      );
      if (years < 18) {
        errors.birth_date = 'Você precisa ter mais de 18 anos';
        isValidForm = false;
      }
    }

    if (!data.email) {
      errors.email = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.email && !isEmail(data.email)) {
      errors.email = 'E-mail inválido';
      isValidForm = false;
    }

    if (!data.password) {
      errors.password = 'Campo obrigatório';
      isValidForm = false;
    }

    if (data.password && passwordScore < 2) {
      errors.password = 'Digite uma senha forte';
      isValidForm = false;
    }

    this.setState({ errors });

    return isValidForm;
  };

  handleChange = e => {
    const { data } = this.state;
    const { name, value } = e.target;
    data[name] = value;

    if (name === 'password') {
      this.setState({ data }, this.validatePassword);
    } else if (name === 'document') {
      this.setState({ data }, this.validateDocument);
    } else {
      this.setState({ data });
    }
  };

  validateDocument = () => {
    const errors = {};
    let showBirthDate = true;
    const { document } = this.state.data;

    if (document) {
      if (
        document.replace(/\D/g, '').length != 11 &&
        document.replace(/\D/g, '').length != 14
      ) {
        errors.document = 'CPF/CNPF inválido';
      }

      if (document.replace(/\D/g, '').length == 14) {
        showBirthDate = false;
      }
    } else {
      errors.document = 'CPF/CNPF inválido';
    }

    this.setState({ errors, showBirthDate });
  };

  validatePassword = () => {
    const { password } = this.state.data;
    const result = zxcvbn(password);

    const crack_time = result.crack_times_seconds;
    const crack_time_seconds = crack_time.offline_slow_hashing_1e4_per_second;

    const passwordScore = result.score;

    this.setState({ passwordScore });

    if (crack_time_seconds < 1) {
      this.setState({ passwordStrength: 'Menos de 1 segundo' });
    } else {
      let unit = 'segundos';
      let s_crack_time_seconds = crack_time_seconds;
      if (crack_time_seconds > 60) {
        s_crack_time_seconds = crack_time_seconds / 60;
        unit = 'minutos';
      }
      if (crack_time_seconds > 3600) {
        s_crack_time_seconds = crack_time_seconds / 3600;
        unit = 'horas';
      }
      if (crack_time_seconds > 86400) {
        s_crack_time_seconds = crack_time_seconds / 86400;
        unit = 'dias';
      }
      if (crack_time_seconds > 604800) {
        s_crack_time_seconds = crack_time_seconds / 604800;
        unit = 'semanas';
      }
      if (crack_time_seconds > 2629746) {
        s_crack_time_seconds = crack_time_seconds / 2629746;
        unit = 'meses';
      }
      if (crack_time_seconds > 31556952) {
        s_crack_time_seconds = crack_time_seconds / 31556952;
        unit = 'anos';
      }
      const passwordStrength =
        Number(s_crack_time_seconds).formatMoney(2, ',', '.') + ' ' + unit;
      this.setState({ passwordStrength });
    }
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { data } = this.state;

    if (this.validateForm()) {
      const errors = {};
      const values = {
        ...data,
        birth_date:
          data.document.replace(/\D/g, '').length == 14 ? '' : data.birth_date,
        document: data.document.replace(/\D/g, ''),
      };

      this.setState({ isLoading: true });
      const response = await this.props.dispatch(signupUser(values));
      this.setState({ isLoading: false });
      if (!response.success) {
        errors.apiError = response.message;

        return this.setState({ errors });
      }

      this.setState({ showEmailConfirm: true, data: {} });
    }
  };

  static async getInitialProps({ query }) {
    const res = await fetch(`${userService}/app-config`);
    const json = await res.json();
    return { appConfig: json.data, query };
  }

  render() {
    const {
      data,
      errors,
      showPassword,
      isLoading,
      passwordStrength,
      showEmailConfirm,
    } = this.state;
    return (
      <React.Fragment>
        <Head>
          <HeadMetaTags />
          <title>Cadastre-se | {this.props.appConfig.name}</title>
        </Head>
        <div>
          <div id="modal-login" className="custom-modal animated">
            <div className="animated" />
            <a
              onClick={() => Router.push('/login')}
              className="btn btn-default btn-ls-back"
              style={{
                background: 'rgba(0,0,0,.05)!important',
                fontSize: '1.3rem',
                cursor: 'pointer',
              }}
            >
              <i className="ti-arrow-left mr-2" />
              Voltar
            </a>
            <div className="container">
              <div className="row">
                <div className={`box ${showEmailConfirm && 'confirm-email'}`}>
                  <div className="logo-area">
                    <img src={this.props.appConfig.logo}  />
                  </div>

                  {showEmailConfirm ? (
                    <div className="bg big">
                      <h1 className="text-center" style={{ fontSize: '5rem' }}>
                        📬
                      </h1>
                      <h1
                        className="text-center mt-3"
                        style={{
                          fontWeight: 200,
                          fontSize: '2rem',
                          marginBottom: '2rem',
                        }}
                      >
                        Confirme seu e-mail
                      </h1>

                      <p
                        className="mt-5"
                        style={{ textAlign: 'center', fontSize: '1.2rem' }}
                      >
                        <b>Seu cadastro foi concluído com sucesso!</b>
                        <br />
                        Abra sua caixa de e-mail e procure pelo e-mail que
                        acabamos de enviar.
                      </p>

                      <p
                        className="mt-5"
                        style={{
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          marginTop: '2rem',
                        }}
                      >
                        <b>Não encontrou o e-mail?</b>
                        <br />
                        Verifique na caixa de spam. Caso não o encontre, entre
                        em contato conosco.
                      </p>
                    </div>
                  ) : (
                    <div className="bg">
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
                        {this.state.showBirthDate && (
                          <div className="required-fields">
                            <div className="form-group">
                              <InputBirthDate
                                onChange={this.handleChange}
                                value={data.birth_date || ''}
                              />

                              {errors.birth_date && (
                                <div className="invalid-feedback">
                                  {errors.birth_date}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                        <div className="input-group mb-3">
                          <input
                            value={data.password || ''}
                            onChange={this.handleChange}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-control password-target"
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
                              {this.state.showPassword ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <div className="invalid-feedback password">
                              {errors.password}
                            </div>
                          )}
                        </div>
                        <div
                          className="progress password-meter mb-3"
                          style={{
                            height: '1.5rem',
                            borderRadius: '0 0 4px 4px',
                            position: 'relative',
                          }}
                        >
                          <span
                            style={{
                              textAlign: 'center',
                              display: 'block',
                              width: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              margin: 'auto',
                              fontWeight: 500,
                              lineHeight: '1.5rem',
                            }}
                          >
                            {passwordStrength ? (
                              <div>
                                {passwordStrength}
                                <Tooltip title="Tempo necessário para hackers quebrarem sua senha através de um ataque Brute Force.">
                                  <span>
                                    <FaInfoCircle
                                      style={{ marginLeft: '6px' }}
                                    />
                                  </span>
                                </Tooltip>
                              </div>
                            ) : (
                              '-'
                            )}
                          </span>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: 0 }}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                        {!isLoading ? (
                          <div id="login-btn" className="form-group">
                            <button
                              onClick={e => this.handleSubmit(e)}
                              type="submit"
                              className="text-center btn btn-block btn-primary"
                            >
                              Cadastre-se
                            </button>
                          </div>
                        ) : (
                          <div id="signup-btn-loading" className="form-group">
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
                              Aguarde...
                            </button>
                          </div>
                        )}

                        <a
                          onClick={() => Router.push('/login')}
                          style={{
                            display: 'block',
                            color: '#111',
                            textAlign: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          Já possui uma conta? Faça login
                        </a>

                        {errors.apiError && (
                          <div className="general-invalid-feedback">
                            {errors.apiError}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(Signup);
