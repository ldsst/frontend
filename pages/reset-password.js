import {
  validateTokenRecoveryPassword,
  recoveryPassword,
} from '../actions/users';
import { connect } from 'react-redux';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'antd';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import zxcvbn from 'zxcvbn';
import Loading from '../components/loading';
import Router from 'next/router';
import 'isomorphic-unfetch';
import { userService } from '../utils/endpoint';

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

class ResetPassword extends React.Component {
  state = {
    isFetching: true,
    isTokenValid: true,
    password: '',
    showPassword: false,
    errors: {},
    passwordScore: '',
    passwordStrength: '',
    isLoading: false,
    successResponse: null,
  };

  async componentDidMount() {
    const response = await this.props.dispatch(
      validateTokenRecoveryPassword(this.props.token)
    );

    if (!response.success) {
      this.setState({ isTokenValid: false });
    }

    this.setState({ isFetching: false });
  }

  static async getInitialProps({ query: { token } }) {
    const res = await fetch(`${userService}/app-config`);
    const json = await res.json();
    return { appConfig: json.data, token };
  }

  validatePassword = () => {
    const { password } = this.state;
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

  handleChange = e => {
    this.setState({ password: e.target.value }, this.validatePassword);
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { password, passwordScore } = this.state;
    const errors = {};

    if (!password) {
      errors.password = 'Campo obrigatório';
      return this.setState({ errors });
    }

    if (password && passwordScore < 2) {
      errors.password = 'Digite uma senha forte';
      return this.setState({ errors });
    }

    const data = {
      token: this.props.token,
      password,
    };

    this.setState({ isLoading: true });
    const response = await this.props.dispatch(recoveryPassword(data));
    this.setState({ isLoading: false });
    if (!response.success) {
      errors.apiError = response.message;

      return this.setState({ errors });
    }

    this.setState({ successResponse: 'Senha alterada com sucesso' });
  };

  renderData = () => {
    const {
      password,
      showPassword,
      errors,
      passwordStrength,
      isLoading,
      successResponse,
      isTokenValid,
    } = this.state;

    if (!isTokenValid) {
      return (
        <React.Fragment>
          <h4 className="general-invalid-feedback">
            Ocorreu um erro ao validar o token
          </h4>
        </React.Fragment>
      );
    }

    if (!successResponse) {
      return (
        <React.Fragment>
          <div className="input-group mb-3">
            <input
              value={password || ''}
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
                {this.state.showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback password">{errors.password}</div>
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
                      <FaInfoCircle />
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
                Alterar Senha
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
            <div className="general-invalid-feedback">{errors.apiError}</div>
          )}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <h4 className="positive-feedback">{this.state.successResponse}</h4>
        </React.Fragment>
      );
    }
  };

  render() {
    const { isFetching } = this.state;
    return (
      <React.Fragment>
        <Head>
          <HeadMetaTags />
          <title>Recuperar senha | {this.props.appConfig.name}</title>
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
              }}
            >
              <i className="ti-arrow-left mr-2" />
              Voltar
            </a>
            <div className="container">
              {isFetching ? (
                <Loading />
              ) : (
                <div className="row">
                  <div className="box">
                    <div className="logo-area">
                      <img src={this.props.appConfig.logo}  />
                    </div>
                    <div className="bg">{this.renderData()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default connect()(ResetPassword);
