import { connect } from 'react-redux';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import Loading from '../components/loading';
import { blockAccount, checkBlockAccountToken } from '../actions/users';
import Router from 'next/router';
import 'isomorphic-unfetch';
import { userService } from '../utils/endpoint';

class BlockAccount extends React.Component {
  state = {
    isFetching: true,
    isLoading: false,
    successResponse: null,
    isTokenValid: true,
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const response = await this.props.dispatch(blockAccount(this.props.token));
    if (response.success) {
      this.setState({ successResponse: 'Conta bloqueada com sucesso' });
    }
    this.setState({ isLoading: false });
  };

  static async getInitialProps({ query: { token } }) {
    const res = await fetch(`${userService}/app-config`);
    const json = await res.json();
    return { appConfig: json.data, token };
  }

  async componentDidMount() {
    if (!this.props.token) {
      return Router.push('/login');
    }

    const response = await this.props.dispatch(
      checkBlockAccountToken(this.props.token)
    );
    if (!response.success) {
      this.setState({ isTokenValid: false });
    }
    this.setState({ isFetching: false });
  }

  renderData = () => {
    const { successResponse, isLoading, isTokenValid } = this.state;

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
          <h4>Bloquear seu acesso?</h4>
          {!isLoading ? (
            <div id="login-btn" className="form-group">
              <button
                onClick={e => this.handleSubmit(e)}
                type="submit"
                className="text-center btn btn-block btn-primary"
              >
                Bloquear acesso
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
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <h4 className="positive-feedback">{successResponse}</h4>
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
          <title>Bloquear Acesso | {this.props.appConfig.name}</title>
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

export default connect()(BlockAccount);
