import Link from 'next/link';
import Router from 'next/router';
import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import SelfieTutorialModal from '../components/verificacao/SelfieTutoriaModal';
import { connect } from 'react-redux';
import { sendDocumentImg } from '../actions/users';
import { Alert, Icon, message, Spin } from 'antd';
import {
  fetchUserVerifications,
  fetchValidateTokenSelfie,
} from '../actions/users';
import { toast } from 'react-toastify';

const antIcon = (
  <Icon
    type="loading"
    style={{ fontSize: 20, color: '#333', margin: '0', padding: '0' }}
    spin
  />
);

const findDocument = type => {
  if (type === 'address') {
    return 'Comprovante de Endereço';
  }

  if (type === 'idfront') {
    return 'Documento de identificação - Frente';
  }

  if (type === 'idback') {
    return 'Documento de identificação - Verso';
  }

  if (type === 'selfie') {
    return 'Selfie';
  }

  return '';
};

class VerifyDocument extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      documentSelected: '',
      idfront: 'Selecione a frente',
      idback: 'Selecione o verso',
      address: 'Selecione o comprovante',
      showSelfie: true,
      showPreviewButtonDocumentFront: false,
      showPreviewButtonDocumentBack: false,
      showPreviewButtonSelfie: false,
      showPreviewButtonAddress: false,
      previewDocument: false,
      selfiePreview: null,
      idfrontPreview: null,
      idbackPreview: null,
      addressPreview: null,
      documentsToSend: {},
      errors: {},
      addressType: false,
      errorImg: '',
      errorMsg: '',
      successMsg: '',
      loadingSubmit: false,
      isOpenTutorial: false,
    };
  }

  fixPath(value) {
    return value.replace(/C:\\fakepath\\/, '');
  }

  handleChangeImage = e => {
    e.preventDefault();

    // Tamanho máximo do arquivo (em Bytes)
    const maxSize = 1024 * 1024 * 15; // 15Mb
    const fileType = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'application/pdf',
    ];

    let reader = new FileReader();
    let file = e.target.files[0];

    if (file) {
      if (!fileType.includes(file.type)) {
        return this.setState({
          errorImg: 'Somente é permitido imagens PNG, JPEG, JPG, PDF',
        });
      }

      if (file.size > maxSize) {
        return this.setState({
          errorImg: 'Somente é permitido imagens com no máximo: 7MB',
        });
      }

      const { documentsToSend } = this.state;
      documentsToSend[e.target.name] = file;
      const previewImg = `${e.target.name}Preview`;

      if (e.target.name === 'idback') {
        this.setState({
          showPreviewButtonDocumentBack: true,
          idback: file.name,
        });
      }

      if (e.target.name === 'idfront') {
        this.setState({
          showPreviewButtonDocumentFront: true,
          idfront: file.name,
        });
      }

      if (e.target.name === 'address') {
        this.setState({ showPreviewButtonAddress: true, address: file.name });
      }

      if (e.target.name === 'selfie') {
        this.setState({ showPreviewButtonSelfie: true });
      }

      reader.onloadend = () => {
        this.setState({
          [previewImg]: reader.result, // atualiza o preview
          documentsToSend, // atualiza o objeto que será enviado
        });
      };
      reader.readAsDataURL(file);
    }
  };

  isValidForm = () => {
    const documentsToSend = { ...this.state.documentsToSend };
    const errors = {};
    let isValid = true;

    if (!documentsToSend.idback) {
      errors.idback = 'Selecione um arquivo';
      isValid = false;
    }

    if (!documentsToSend.idfront) {
      errors.idfront = 'Selecione um arquivo';
      isValid = false;
    }

    if (!documentsToSend.address) {
      errors.address = 'Selecione um arquivo';
      isValid = false;
    }

    if (!documentsToSend.selfie) {
      errors.selfie = 'Selecione um arquivo';
      isValid = false;
    }

    if (!isValid) {
      toast.error('Envie todos documentos solicitados');
    }

    this.setState({ errors });
    return isValid;
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (this.isValidForm()) {
      const data = Object.keys(this.state.documentsToSend);

      if (data.length === 0) {
        this.setState({ errorImg: 'Nenhuma imagem selecionada' });
      }

      let isAllDone = false;
      let errorMsg = '';

      this.setState({ loadingSubmit: true, errorImg: '' });
      for (let reg in data) {
        const type = data[reg];

        const response = await this.props.dispatch(
          sendDocumentImg(
            this.state.documentsToSend[type],
            type,
            this.props.accountVerifications.identificator
          )
        );

        if (response.success) {
          isAllDone = true;
        } else {
          isAllDone = false;
          errorMsg = response.message;
          break;
        }
      }

      this.setState({ loadingSubmit: false });
      if (!isAllDone) {
        return this.setState({ errorMsg });
      }

      this.setState({ errorImg: '' });
      message.success('Documentos enviados com sucesso');
      Router.push('/verificacao');
    }
  };

  handleOpenVisualization = (previewDocument, documentSelected) => {
    this.setState({ previewDocument, documentSelected });
  };

  async componentDidMount() {
    await this.props.dispatch(fetchUserVerifications());
    if (this.props.accountVerifications.done !== 1) {
      await this.props.dispatch(fetchValidateTokenSelfie());
    }
    this.setState({ isFetching: false });
  }

  render() {
    const {
      showSelfie,
      showPreviewButtonSelfie,
      showPreviewButtonAddress,
      showPreviewButtonDocumentFront,
      showPreviewButtonDocumentBack,
      previewDocument,
      addressType,
      selfiePreview,
      documentSelected,
      isOpenTutorial,
    } = this.state;
    return (
      <div style={{ display: 'flex' }}>
        <ContextAside page={20} />
        <main className="main">
          <ContextHeader page="7" />
          <div className="container-content verificacao docs">
            <div className="page-title">
              <h1 className="page-title__name">
                <Link prefetch href="/verificacao">
                  <a>Verificação de Conta</a>
                </Link>
                <span>Documentos</span>
              </h1>
              <Link prefetch href="/verificacao">
                <a
                  href="javascript:void()"
                  className="dark-button"
                  style={{ position: 'absolute', right: '9rem' }}
                >
                  <Icon type="swap-left" style={{ marginRight: '5px' }} />{' '}
                  Voltar
                </a>
              </Link>
              <button
                style={
                  this.state.loadingSubmit
                    ? { pointerEvents: 'none', width: '8rem', height: '1.8rem' }
                    : { width: '8rem', height: '1.8rem' }
                }
                onClick={e => this.handleSubmit(e)}
                className="success-button"
              >
                {this.state.loadingSubmit ? (
                  <Spin indicator={antIcon} />
                ) : (
                  <div>
                    <Icon type="check" style={{ marginRight: '5px' }} /> Enviar
                  </div>
                )}
              </button>
            </div>
            <div className="verificacao__content verificacao__content--inside">
              <h2 className="verificacao__item__title">Envio de documentos</h2>

              {this.state.errorMsg && (
                <Alert
                  message={this.state.errorMsg}
                  type="error"
                  closeText="Fechar"
                  onClose={() => this.setState({ errorMsg: '' })}
                />
              )}

              {this.props.accountVerifications.identificator ? (
                <form className="verificacao__form">
                  <div className="verificacao__input">
                    <label className="verificacao__input__label">
                      <span>Documento de identificação (frente)</span>
                      <small>RG, Passaporte, CNH ou RNE</small>
                    </label>
                    <div>
                      <div className="input-file-container">
                        <input
                          className="input-file js-input-file"
                          id="documento"
                          type="file"
                          name="idfront"
                          onChange={this.handleChangeImage}
                          type="file"
                        />
                        <div className="file-return">{this.state.idfront}</div>
                        <label
                          htmlFor="documento"
                          className="primary-button primary-button--upload input-file-trigger"
                        >
                          Selecionar
                        </label>
                      </div>

                      <div style={{ paddingBottom: 2 }} />

                      {this.state.errors.idfront && (
                        <Alert
                          message={this.state.errors.idfront}
                          type="error"
                        />
                      )}

                      {showPreviewButtonDocumentFront && (
                        <a
                          href="#"
                          onClick={() =>
                            this.handleOpenVisualization(true, 'idfront')
                          }
                          className="verificacao__view-document"
                        >
                          Visualizar Documento
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="verificacao__input">
                    <label className="verificacao__input__label">
                      <span>Documento de identificação (verso)</span>
                      <small>RG, Passaporte, CNH ou RNE</small>
                    </label>
                    <div>
                      <div className="input-file-container">
                        <input
                          className="input-file js-input-file"
                          id="documento"
                          type="file"
                          name="idback"
                          onChange={this.handleChangeImage}
                          type="file"
                        />
                        <div className="file-return">{this.state.idback}</div>
                        <label
                          htmlFor="documento"
                          className="primary-button primary-button--upload input-file-trigger"
                        >
                          Selecionar
                        </label>
                      </div>

                      <div style={{ paddingBottom: 2 }} />

                      {this.state.errors.idback && (
                        <Alert
                          message={this.state.errors.idback}
                          type="error"
                        />
                      )}

                      {showPreviewButtonDocumentBack && (
                        <a
                          href="#"
                          onClick={() =>
                            this.handleOpenVisualization(true, 'idback')
                          }
                          className="verificacao__view-document"
                        >
                          Visualizar Documento
                        </a>
                      )}
                    </div>
                  </div>

                  {this.state.errorImg && (
                    <Alert
                      message={this.state.errorImg}
                      type="error"
                      closeText="Fechar"
                      onClose={() => this.setState({ errorImg: '' })}
                    />
                  )}

                  {showSelfie && (
                    <div className="verificacao__input verificacao__input--selfie">
                      <label
                        className="verificacao__input__label"
                        style={{ width: '100%' }}
                      >
                        <span>Selfie conforme o passo a passo abaixo:</span>
                        <small style={{ lineHeight: '1.5', marginTop: '10px' }}>
                          <b>1.</b> Segure seu documento de identificação.
                          <br />
                          <b>2.</b> Pegue uma folha branca e escreva o seguinte:
                          <br />- QUERO NEGOCIAR CRIPTOMOEDAS NA{' '}
                          {this.props.appConfig.name} + data do dia + números
                          abaixo
                          <br />
                          <b>3.</b> Tire uma foto segurando seu documento e a
                          folha escrita. Se preferir, peça alguém
                          <br />
                          para tirar a foto para você. Esteja em um lugar bem
                          iluminado.
                          <br />
                          <b>Os 4 números que você vai escrever são:</b>
                        </small>
                        <div className="verificacao__input__code">
                          {this.props.selfieToken}
                        </div>
                        <div className="verificacao__input__selfie" />
                        <div className="verificacao__drop" htmlFor="selfie">
                          <input
                            name="selfie"
                            id="selfie"
                            onChange={this.handleChangeImage}
                            type="file"
                          />
                          <div className="verificacao__drop__return">
                            {selfiePreview ? (
                              <img
                                style={{
                                  maxWidth: '100%',
                                  height: '100%',
                                }}
                                src={selfiePreview}
                              />
                            ) : (
                              <span style={{ fontWeight: 'bold' }}>FOTO</span>
                            )}
                          </div>

                          <div style={{ paddingBottom: 2 }} />

                          {this.state.errors.selfie && (
                            <Alert
                              message={this.state.errors.selfie}
                              type="error"
                            />
                          )}
                        </div>
                      </label>
                      <div>
                        <div className="verificacao__input__selfie" />
                      </div>
                    </div>
                  )}

                  <div className="verificacao__input">
                    <label className="verificacao__input__label">
                      <span>
                        <span>Comprovante de Residência</span>
                        <svg
                          viewBox="0 0 34 34"
                          onClick={e => this.setState({ addressType: true })}
                        >
                          <g>
                            <path
                              d="M17.123,9.2c-1.44,0-2.642,0.503-3.604,1.32S11.994,12,11.832,14h2.937c0.064-1,0.303-1.231,0.716-1.611   s0.926-0.618,1.541-0.618c0.615,0,1.116,0.174,1.504,0.571c0.389,0.396,0.583,0.882,0.583,1.48s-0.187,1.094-0.558,1.499   l-1.772,1.769c-0.518,0.518-0.626,0.934-0.78,1.249C15.849,18.654,16,19.133,16,19.78V21h2v-0.832c0-0.646,0.289-1.148,0.581-1.504   c0.112-0.129,0.333-0.287,0.521-0.473c0.186-0.187,0.448-0.405,0.715-0.656c0.267-0.25,0.5-0.457,0.662-0.619   c0.161-0.161,0.404-0.437,0.712-0.825c0.533-0.647,0.805-1.456,0.805-2.427c0-1.408-0.45-2.503-1.356-3.289   C19.732,9.592,18.563,9.2,17.123,9.2z"
                              fill="#ffffff"
                            />
                            <path
                              d="M16.94,22.145c-0.51,0-0.946,0.179-1.311,0.534c-0.364,0.356-0.546,0.78-0.546,1.274   c0,0.493,0.186,0.914,0.558,1.262c0.372,0.348,0.813,0.521,1.322,0.521c0.51,0,0.947-0.178,1.311-0.533   c0.363-0.356,0.546-0.781,0.546-1.274s-0.187-0.914-0.559-1.263C17.891,22.318,17.45,22.145,16.94,22.145z"
                              fill="#ffffff"
                            />
                            <path
                              d="M17,0C7.611,0,0,7.611,0,17s7.611,17,17,17s17-7.611,17-17S26.389,0,17,0z M17,31C9.268,31,3,24.732,3,17   C3,9.268,9.268,3,17,3c7.732,0,14,6.268,14,14C31,24.732,24.732,31,17,31z"
                              fill="#ffffff"
                            />
                          </g>
                        </svg>
                      </span>
                      <small>Aceitamos apenas .jpg .jpeg .png e .pdf</small>
                    </label>
                    <div>
                      <div className="input-file-container">
                        <input
                          className="input-file js-input-file"
                          id="comprovante"
                          name="address"
                          onChange={this.handleChangeImage}
                          type="file"
                        />
                        <div className="file-return">{this.state.address}</div>
                        <label
                          htmlFor="comprovante"
                          className="primary-button primary-button--upload input-file-trigger"
                        >
                          Selecionar
                        </label>
                      </div>

                      <div style={{ paddingBottom: 2 }} />

                      {this.state.errors.address && (
                        <Alert
                          message={this.state.errors.address}
                          type="error"
                        />
                      )}

                      {showPreviewButtonAddress && (
                        <a
                          href="#"
                          onClick={() =>
                            this.handleOpenVisualization(true, 'address')
                          }
                          className="verificacao__view-document"
                        >
                          Visualizar Documento
                        </a>
                      )}
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  <h2>Conclua as etapas anteriores antes de prosseguir.</h2>
                </div>
              )}
            </div>
          </div>

          {previewDocument && (
            <div className="screen-overlay">
              <div
                onClick={e => e.stopPropagation()}
                className="overlay-deposito"
              >
                <header className="overlay-deposito__header">
                  <h3>{findDocument(documentSelected)}</h3>
                  <button
                    onClick={() => this.handleOpenVisualization(false, null)}
                    className="overlay-deposito__close"
                  >
                    <img src="/static/img/cancel.svg" />
                  </button>
                </header>
                <div className="overlay-deposito__content">
                  <p
                    className="overlay-deposito__label"
                    style={{ textAlign: 'center' }}
                  >
                    Verifique e confirme a visualização:
                  </p>
                  <div
                    className="verificacao__preview"
                    style={{ textAlign: 'center' }}
                  >
                    <img
                      style={{
                        maxWidth: '100%',
                        width: 'auto',
                        height: '50vh',
                        margin: 'auto',
                        textAlign: 'center',
                      }}
                      src={this.state[`${documentSelected}Preview`]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!!addressType && (
            <div
              onClick={() => this.setState({ addressType: false })}
              className="screen-overlay"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="overlay-deposito"
              >
                <header className="overlay-deposito__header">
                  <h3>Comprovante de Residência</h3>
                  <button
                    onClick={() => this.setState({ addressType: false })}
                    className="overlay-deposito__close"
                  >
                    <img src="/static/img/cancel.svg" />
                  </button>
                </header>
                <div className="overlay-deposito__content">
                  <p className="overlay-deposito__label">
                    Lista de <strong>comprovantes aceitos</strong> pela{' '}
                    {this.props.appConfig.name}:
                  </p>
                  <ul className="verificacao__docs">
                    <li>• Contas água, luz, telefone (celular ou fixo);</li>
                    <li>
                      • Contrato de aluguel com firma reconhecida em cartório;
                    </li>
                    <li>• Declaração do Imposto elativo ao último;</li>
                    <li>• Contracheque emitido por órgão público;</li>
                    <li>• Demonstrativos enviados pelo INSS ou SRF;</li>
                    <li>• Termo de rescisão de contrato de trabalho;</li>
                    <li>
                      • Boleto de cobrança de plano de saúde, condomínio,
                      financiamento imobiliário ou mensalidade escolar;
                    </li>
                    <li>• Fatura de cartão de crédito;</li>
                    <li>
                      • Extrato do FGTS enviado pelo Caixa Econômica Federal;
                    </li>
                    <li>• Carnê de cobrança de IPTU ou IPVA;</li>
                    <li>• Registro de Licenciamento de veículos;</li>
                    <li>• Multa de trânsito;</li>
                    <li>
                      • Laudo de avaliação de imóvel emitido pela Caixa
                      Econômica Federal;
                    </li>
                    <li>• Escritura de imóvel.</li>
                  </ul>
                </div>
                <footer className="overlay-deposito__footer">
                  <button
                    onClick={() => this.setState({ addressType: false })}
                    className="primary-button primary-button--text"
                    style={{ display: 'none' }}
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => this.setState({ addressType: false })}
                    className="primary-button primary-button--continue"
                  >
                    ENTENDIDO
                  </button>
                </footer>
              </div>
            </div>
          )}

          <div className="verificacao__actions" />
        </main>

        {isOpenTutorial && (
          <SelfieTutorialModal
            handleClose={() => this.setState({ isOpenTutorial: false })}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { accountVerifications, selfieToken, appConfig } = state.users;
  return { accountVerifications, selfieToken, appConfig };
};
export default connect(mapStateToProps)(VerifyDocument);
