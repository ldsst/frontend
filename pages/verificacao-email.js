import { connect } from 'react-redux';
import { userService } from '../utils/endpoint';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import Router from 'next/router';
import 'isomorphic-unfetch';

import '../scss/pages/login.scss';

class VerificacaoEmail extends React.Component {
  static async getInitialProps({ query }) {
    const res = await fetch(`${userService}/validate-email-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: query.token }),
    }).then(response => response.json());

    let valid = false;
    if (res.success) {
      valid = true;
    }

    const app = await fetch(`${userService}/app-config`);
    const json = await app.json();

    return {
      query,
      valid,
      appConfig: json.data,
    };
  }

  render() {
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
              href={this.props.appConfig.site}
              className="btn btn-default btn-ls-back"
              style={{
                background: 'rgba(0,0,0,.05)!important',
                fontSize: '1.3rem',
              }}
            >
              <i className="ti-arrow-left mr-2" />
              Voltar
            </a>
            <div className="container" style={{ paddingTop: '70px' }}>
              <div className="row">
                <div className={'box confirm-email'}>
                  <div className="logo-area">
                    <img src={this.props.appConfig.logo}  />
                  </div>
                  <div className="bg">
                    <p
                      className="mt-5"
                      style={{ textAlign: 'center', fontSize: '1.2rem' }}
                    >
                      <br />
                      {!this.props.valid && (
                        <h2 style={{ fontWeight: '100' }}>
                          Ocorreu um erro, tente novamente
                        </h2>
                      )}
                      {this.props.valid && (
                        <h2 style={{ fontWeight: '100' }}>
                          Email validado com sucesso!
                        </h2>
                      )}
                      <br />
                      <button
                        className="text-center btn btn-primary"
                        onClick={() => Router.push('/login')}
                      >
                        Clique para fazer login
                      </button>
                    </p>
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

export default connect()(VerificacaoEmail);
