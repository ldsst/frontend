import Link from 'next/link';
import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import { connect } from 'react-redux';
import { Alert, Button } from 'antd';
import {
  fetchUserVerifications,
  fetchValidateTokenSelfie,
  resetAccountVerification,
} from '../actions/users';

const isAproved = done => {
  if (done === 1) {
    return {
      color: 'approved',
      checked: true,
      text: 'Aprovado',
    };
  }
  if (done === 2) {
    return {
      color: 'reproved',
      checked: true,
      text: 'Reprovado',
    };
  }

  return {
    color: 'approved',
    checked: false,
    text: 'Aprovado',
  };
};

class Verification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetching: true,
    };
  }

  resetAccountVerification = async () => {
    this.setState({ isFetching: true });
    await this.props.dispatch(resetAccountVerification());
    this.loadData();
  };

  loadData = async () => {
    await this.props.dispatch(fetchUserVerifications());
    if (this.props.accountVerifications.done !== 1) {
      await this.props.dispatch(fetchValidateTokenSelfie());
    }
    this.setState({ isFetching: false });
  };

  async componentDidMount() {
    this.loadData();
  }

  renderVerification = () => {
    const { accountVerifications } = this.props;

    if (this.props.userProfile.is_business === 1) {
      return (
        <div style={{ marginTop: '30px' }}>
          <h2>
            Para realizar o processo de verificação de conta jurídica, envie
            para <u>{this.props.appConfig.email}</u> a seguinte documentação:
          </h2>

          <p style={{ lineHeight: '1.5', fontSize: '1rem', marginTop: '20px' }}>
            - Telefone comercial;
            <br />
            - Telefone do representante legal da empresa;
            <br />
            - Contrato social atualizado;
            <br />- Selfie do representante legal da empresa, segurando o
            documento de identificação(exibindo o lado da foto) e uma folha
            branca com o texto "Quero negociar criptomoedas na{' '}
            {this.props.appConfig.name}", com a data do dia.
            <br />
            <br />
            <b>Para cada sócio da empresa, enviar a seguinte documentação:</b>
            <br />
            - Documento de identificação com foto, frente e verso;
            <br />- Comprovante de residência de até 3 meses;
          </p>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginTop: 0 }} />

        {accountVerifications.done === 2 && (
          <React.Fragment>
            <div
              className="verificacao-document"
            >
              <h2 style={{ marginBottom: '20px' }}>Documentação reprovada.</h2>
              Corrija os dados abaixo e faça o envio novamente:
              <br />
              <p style={{ marginTop: '10px' }}>
                {accountVerifications.deniedReason}
              </p>
              <br />
              <Button
                htmlType="button"
                onClick={() => this.resetAccountVerification()}
                style={{ marginTop: '10px' }}
              >
                Clique aqui para reiniciar a verificação
              </Button>
            </div>
          </React.Fragment>
        )}

        {accountVerifications.documents &&
          accountVerifications.phone &&
          accountVerifications.address &&
          accountVerifications.done === 0 && (
            <Alert
              type="info"
              showIcon
              message="Verificação de conta em andamento..."
              description="Estamos analisando seus documentos. Em até 2 dias úteis você receberá uma atualização por e-mail."
              style={{ marginTop: '30px' }}
            />
          )}

        {accountVerifications.done === 1 && (
          <Alert
            type="success"
            showIcon
            message="Conta verificada com sucesso!"
            description="Os limites operacionais da sua conta foram aumentados com sucesso."
            style={{ marginTop: '30px' }}
          />
        )}

        {accountVerifications.done === 0 && (
          <ul className="verificacao__list">
            <li className="verificacao__item">
              <img
                src="/static/img/kyc/step1.svg"
                className="verificacao__item__icon verificacao__item__icon--personal"
              />
              <h2 className="verificacao__item__title">Pessoal</h2>
              {accountVerifications.done !== 1 &&
              !accountVerifications.phone ? (
                <Link prefetch href="/verificacao-pessoal">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button"
                  >
                    Preencher
                  </a>
                </Link>
              ) : (
                <Link prefetch href="">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button filled"
                    disabled
                  >
                    Preenchido!
                  </a>
                </Link>
              )}
              <div className="verificacao__item__status">
                <span
                  className={`verificacao__item__status__approved ${accountVerifications.phone &&
                    'checked'}`}
                >
                  Enviado
                </span>
                <span
                  className={`verificacao__item__status__${
                    isAproved(accountVerifications.done).color
                  } ${isAproved(accountVerifications.done).checked &&
                    'checked'}`}
                >
                  {isAproved(accountVerifications.done).text}
                </span>
              </div>
            </li>

            <li className="verificacao__item">
              <img
                src="/static/img/kyc/step2.svg"
                className="verificacao__item__icon verificacao__item__icon--address"
              />
              <h2 className="verificacao__item__title">Endereço</h2>
              {accountVerifications.done !== 1 &&
              !accountVerifications.address ? (
                <Link prefetch href="/verificacao-endereco">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button"
                  >
                    Preencher
                  </a>
                </Link>
              ) : (
                <Link prefetch href="">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button filled"
                    disabled
                  >
                    Preenchido!
                  </a>
                </Link>
              )}
              <div className="verificacao__item__status">
                <span
                  className={`verificacao__item__status__approved ${accountVerifications.address &&
                    'checked'}`}
                >
                  Enviado
                </span>
                <span
                  className={`verificacao__item__status__${
                    isAproved(accountVerifications.done).color
                  } ${isAproved(accountVerifications.done).checked &&
                    'checked'}`}
                >
                  {isAproved(accountVerifications.done).text}
                </span>
              </div>
            </li>
            <li
              className={`verificacao__item ${
                accountVerifications.done !== 1 &&
                !accountVerifications.documents &&
                !accountVerifications.identificator
                  ? 'blocked'
                  : ''
              }`}
            >
              <img
                src="/static/img/kyc/step3.svg"
                className="verificacao__item__icon verificacao__item__icon--documents"
              />
              <h2 className="verificacao__item__title">Documentos</h2>

              {accountVerifications.done !== 1 &&
              !accountVerifications.documents &&
              accountVerifications.identificator ? (
                <Link prefetch href="/verificacao-documentos">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button"
                  >
                    Preencher
                  </a>
                </Link>
              ) : (
                <Link prefetch href="">
                  <a
                    href="#"
                    className="primary-button primary-button--continue verificacao__item__button filled"
                    disabled
                  >
                    Preenchido!
                  </a>
                </Link>
              )}

              <div className="verificacao__item__status">
                <span
                  className={`verificacao__item__status__approved ${accountVerifications.documents &&
                    'checked'}`}
                >
                  Enviado
                </span>
                <span
                  className={`verificacao__item__status__${
                    isAproved(accountVerifications.done).color
                  } ${isAproved(accountVerifications.done).checked &&
                    'checked'}`}
                >
                  {isAproved(accountVerifications.done).text}
                </span>
              </div>
            </li>
          </ul>
        )}
      </div>
    );
  };

  render() {
    const { userProfile } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        <ContextAside page={20} />
        <main className="main">
          <ContextHeader page="7" />
          <div className="content_wrap">
            <div className="container-content">
              <div className="page-title">
                <h1 className="page-title__name">Verificação de Conta</h1>
              </div>
              <div className="verificacao">
                {this.state.isFetching ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div className="loading-icon">
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>
                ) : (
                  <div>
                    {Object.keys(userProfile).length > 0 &&
                    userProfile.verified !== 1 ? (
                      <div
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <img
                          src="/static/img/double_check.svg"
                          style={{ width: '10%' }}
                        />
                        <h1 style={{ fontWeight: '200' }}>
                          Conta verificada com sucesso!
                        </h1>
                        <p style={{ marginTop: '10px' }}>
                          <Link prefetch href="/limites-operacionais">
                            <a
                              style={{
                                cursor: 'pointer',
                                color: '#333',
                                textDecoration: 'underline',
                              }}
                            >
                              Clique aqui para ver os novos limites da sua
                              conta.
                            </a>
                          </Link>
                        </p>
                      </div>
                    ) : (
                      this.renderVerification()
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = ({ users }) => {
  const { accountVerifications, userProfile, appConfig } = users;
  return { accountVerifications, userProfile, appConfig };
};
export default connect(mapStateToProps)(Verification);
