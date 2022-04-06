import Link from 'next/link';
import { connect } from 'react-redux';
import dynamic from 'next/dynamic';
import ContextAsideTrade from '../components/context/asideTrade';
import ContextHeader from '../components/context/header';
import ModalDepositReceipt from '../components/carteira/ModalDepositReceipt';
import { fetchMyBalance, fetchMyDeposits } from '../actions/users';
import { fetchAllBankAccounts } from '../actions/bank';
import { sendDeposit } from '../actions/orders';
import has from 'lodash/has';
import { Form, Icon, Alert, Button, message } from 'antd';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import currencyFormatter from 'currency-formatter';
import MaskedInput from 'react-text-mask';
import ModalWithdrawBrl from '../components/carteira/ModalWithdrawBrl';
import { formatarCpfCnpj } from '../utils/formatCpfCnpj';
import Loader from '../components/Loader';
import ModalDepositCrypto from '../components/carteira/ModalDepositCrypto';
import ContextAsideSimples from '../components/context/asideSimples';
import React from 'react';

const FormItem = Form.Item;

const TableDepositsWithdraws = dynamic(() =>
  import('../components/carteira/tableDepositsWithdraws')
);
const ModalSaqueCripto = dynamic(() =>
  import('../components/carteira/ModalSaqueCripto')
);

const fiatMask = createNumberMask({
  prefix: 'R$ ',
  suffix: '',
  includeThousandsSeparator: true,
  allowDecimal: true,
  decimalSymbol: ',',
  thousandsSeparatorSymbol: '.',
  decimalLimit: 2,
});

const banks = [
  {
    bank_id: '033',
    bank: 'Banco Santander',
    agency: '0913',
    account: '13000917-2',
  },
];

const findBank = bankId => {
  const bank = banks.find(item => item.bank_id === bankId);

  if (bank) {
    return bank;
  }

  return banks[0];
};

const findCurrency = (pair, balance) => {
  const currency = pair.split('/')[0];
  const data = balance.find(item => item.currency === currency);

  if (data) {
    return data;
  }

  return {
    currency: '',
    currency_symbol: '',
    currency_name: '',
  };
};

class Carteira extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isFetchingDeposits: true,
      showCryptoDeposit: false,
      showModalReal: false,
      showConfirmation: false,
      currency: {},
      depositError: '',
      loadingSubmit: false,
      myDeposits: [],
      isCriptoModalOpen: false,
      currencySelected: '',
      currencySymbol: '',
      availableBanks: ['033'],
      bankSelected: '',
      depositValue: '',
      depositType: '',
      showModalWithdrawBRL: false,
      isOpenDepositReceipt: false,
      identificator: '',
    };
  }

  hasErrors = fieldsError => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  };

  handleOpenDepositReceipt = (isOpenDepositReceipt, identificator = '') => {
    this.setState({ isOpenDepositReceipt, identificator });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const value = this.state.depositValue
      .replace('R$ ', '')
      .replace(/\./g, '')
      .replace(',', '.');

    const type = this.state.availableBanks.includes(this.state.bankSelected)
      ? 'SAME_BANK'
      : this.state.depositType;

    this.setState({ loadingSubmit: true, depositError: '' });

    const data = {
      amount: parseFloat(value),
      type,
    };

    const depositResponse = await this.props.dispatch(sendDeposit(data));
    this.setState({ loadingSubmit: false });

    if (!depositResponse.success) {
      return this.setState({
        depositError: depositResponse.message,
      });
    }

    message.config({
      top: 70,
      duration: 5,
      maxCount: 1,
    });

    await this.handleUpdateUserBalance();

    message.success('Depósito enviado com sucesso!');

    return this.setState({
      showModalReal: false,
      depositValue: '',
      showConfirmation: false,
    });
  };

  handleOpenModal = data => {
    if (data.currency !== 'BRL') {
      return this.setState({
        showCryptoDeposit: true,
        currency: JSON.parse(JSON.stringify(data)),
      });
    }

    this.setState({
      showModalWithdrawBRL: true,
    });
  };

  handleOpenWithdrawCripto = (
    isCriptoModalOpen,
    currencySelected,
    currencySymbol
  ) => {
    if (this.props.profile.verified && !this.props.profile.is2FaActived) {
      return message.error(
        'Você precisa ter 2FA ativada para transferir criptomoedas'
      );
    }
    this.setState({ isCriptoModalOpen, currencySelected, currencySymbol });
  };

  handleOpenModalDeposit = data => {
    if (data.currency !== 'BRL') {
      return this.setState({
        showCryptoDeposit: true,
        currency: JSON.parse(JSON.stringify(data)),
      });
    }

    this.setState({
      showModalWithdrawBRL: true,
    });
  };

  handleContinueDeposit = () => {
    const value = this.state.depositValue
      .replace('R$ ', '')
      .replace('.', '')
      .replace(',', '.');

    const minimumLimit = this.props.userLimit.brl
      ? this.props.userLimit.brl.deposit_minimum
      : 0;

    if (!!value === false || parseFloat(value) < minimumLimit) {
      return this.setState({
        depositError: `O valor não pode ser menor do que R$ ${minimumLimit}`,
      });
    }

    if (!this.state.bankSelected) {
      return this.setState({ depositError: 'Selecione um banco' });
    }

    if (
      !this.state.availableBanks.includes(this.state.bankSelected) &&
      !this.state.depositType
    ) {
      return this.setState({ depositError: 'Selecione o tipo do depósito' });
    }

    const maximumLimit = this.props.userLimit.brl
      ? this.props.userLimit.brl.deposit_maximum
      : 0;

    if (parseFloat(value) > maximumLimit) {
      return this.setState({ depositError: 'Essa operação excede seu limite' });
    }

    this.setState({
      showModalReal: false,
      depositError: '',
      showConfirmation: true,
    });
  };

  shouldOpenModal = data => {
    if (data.active == 0) {
      return message.error('Moeda indisponível');
    }

    if (data.currency !== 'BRL') {
      return this.handleOpenModal(data);
    }

    return this.setState({ showModalReal: true });
  };

  shouldOpenTransferModal = data => {
    if (data.active == 0) {
      return message.error('Moeda indisponível');
    }

    if (data.currency !== 'BRL') {
      return this.handleOpenWithdrawCripto(
        true,
        data.currency,
        data.currency_symbol
      );
    }
    return this.handleOpenModal(data);
  };

  copyToClipboard = e => {
    document.getElementById(e).select();
    document.getElementById(e).focus();
    document.execCommand('copy');
  };

  handleCalculateBalance = () => {
    const {
      myBalance: { balance = [] },
      ticker = {},
    } = this.props;
    let balanceTotal = 0;

    balance.map(item => {
      const value = parseFloat(item.available_balance);

      if (item.currency.toUpperCase() === 'BRL') {
        balanceTotal += value;
      } else {
        const pair = item.currency.toUpperCase().concat('/BRL');

        if (has(ticker, pair)) {
          balanceTotal += parseFloat(value) * parseFloat(ticker[pair].buy);
        }
      }
    });

    return balanceTotal;
  };

  handleUpdateUserBalance = async (shouldStartFetching = true) => {
    if (shouldStartFetching) {
      this.setState({ isFetchingDeposits: true });
    }
    await this.props.dispatch(fetchMyBalance());
    await this.props.dispatch(fetchMyDeposits());
    const brlBalance =
      Object.keys(this.props.myBalance).length > 0
        ? this.props.myBalance.balance.find(item => item.currency === 'BRL')
        : null;

    this.handleCalculateBalance();

    this.setState({
      brlBalance: brlBalance ? brlBalance.available_balance : 0,
      myDeposits: [...this.props.myDeposits],
      loading: false,
      isFetchingDeposits: false,
    });
  };

  handleCalculatePercent = () => {
    const {
      myBalance: { balance = [] },
      ticker = {},
    } = this.props;
    const balanceTotal = this.handleCalculateBalance();
    const percent = {};

    balance.forEach(item => {
      const value = parseFloat(item.available_balance);

      if (item.currency.toUpperCase() === 'BRL') {
        percent['BRL'] = (value / balanceTotal) * 100 || 0;
      } else {
        const pair = item.currency.toUpperCase().concat('/BRL');

        if (has(ticker, pair)) {
          percent[item.currency] =
            ((value * ticker[pair].buy) / balanceTotal) * 100 || 0;
        }
      }
    });

    return percent;
  };

  async componentDidMount() {
    await this.props.dispatch(fetchAllBankAccounts());
    await this.handleUpdateUserBalance();
  }

  render() {
    const {
      loading,
      showCryptoDeposit,
      showModalReal,
      showModalWithdrawBRL,
      showConfirmation,
      currency,
      depositError,
      depositValue,
      depositType,
      bankSelected,
      availableBanks,
    } = this.state;
    const {
      myBalance: { balance = [] },
      profile,
    } = this.props;
    const { getFieldsError } = this.props.form;

    const percent = this.handleCalculatePercent();
    return (
      <div style={{ display: 'flex' }}>
        <ContextAsideSimples />
        <main className="main">
          <ContextHeader page="2" />
          <div className="content_wrap">
            {loading ? (
              <Loader />
            ) : (
              <div className="carteira container-content">
                <section style={{ marginBottom: '1rem' }}>
                  <h2 className="carteira__title">SALDO EQUIVALENTE</h2>
                  <div className="carteira__center">
                    <p className="carteira__cash">
                      <span>R$</span>
                      <b>
                        {currencyFormatter.format(
                          this.handleCalculateBalance(),
                          {
                            format: '%v',
                            decimal: ',',
                            thousand: '.',
                            precision: 2,
                          }
                        )}
                      </b>
                    </p>
                  </div>
                </section>
                <div>
                  <h3 className="table-strip__caption">MEUS SALDOS</h3>
                  {balance.length === 0 ? (
                    <h3
                      className="text-center"
                      style={{ fontWeight: 'normal' }}
                    >
                      Erro ao localizar saldos. Por favor, entre em contato o
                      suporte técnico.
                    </h3>
                  ) : (
                    <div className="wrap-table">
                      <table className="table-saldo">
                        <thead>
                          <tr className="table-saldo__tr-header">
                            <th>Moeda</th>
                            <th>Porcentagem</th>
                            <th>Saldo disponível</th>
                            <th>Saldo em uso</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {balance.map((data, index) => (
                            <tr key={index}>
                              <td
                                className="table-saldo__moeda"
                                style={{ textTransform: 'capitalize' }}
                              >
                                <span>{data.currency_symbol}</span>{' '}
                                {data.currency_name}
                              </td>
                              <td>
                                <p>
                                  {currencyFormatter.format(
                                    percent[data.currency],
                                    {
                                      format: '%v%',
                                      decimal: ',',
                                      thousand: '.',
                                      precision: 2,
                                    }
                                  )}
                                </p>
                                <div className="table-saldo__percent">
                                  <p
                                    style={{
                                      width: `${percent[data.currency]}%`,
                                    }}
                                    className="table-saldo__percent-inner"
                                  />
                                </div>
                              </td>
                              <td>
                                {currencyFormatter.format(
                                  data.available_balance,
                                  {
                                    symbol: data.currency_symbol,
                                    format: '%s %v',
                                    decimal: ',',
                                    thousand: '.',
                                    precision:
                                      data.currency_symbol === 'R$' ? 2 : 8,
                                  }
                                )}
                              </td>
                              <td>
                                {currencyFormatter.format(data.hold_balance, {
                                  symbol: data.currency_symbol,
                                  format: '%s %v',
                                  decimal: ',',
                                  thousand: '.',
                                  precision:
                                    data.currency_symbol === 'R$' ? 2 : 8,
                                })}
                              </td>
                              <td>
                                <button
                                  className={data.currency_is_fiat==="1" ?"table-saldo__button__disable" : "table-saldo__button"}
                                  onClick={() => this.shouldOpenModal(data)}
                                  disabled={data.currency_is_fiat==="1"}
                                >
                                  <Icon
                                    type="arrow-down"
                                    style={{ marginRight: '5px' }}
                                  />{' '}
                                  Receber
                                </button>
                                <button
                                  className="table-saldo__button"
                                  onClick={() =>
                                    this.shouldOpenTransferModal(data)
                                  }
                                >
                                  <Icon
                                    type="swap"
                                    style={{ marginRight: '5px' }}
                                  />{' '}
                                  Transferir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="page-title" style={{ marginBottom: '20px' }}>
                  <h1 className="page-title__name">DEPÓSITOS E RETIRADAS</h1>
                </div>

                {this.state.isFetchingDeposits ? (
                  <Loader />
                ) : (
                  <TableDepositsWithdraws
                    myDeposits={this.state.myDeposits}
                    handleUpdateUserBalance={this.handleUpdateUserBalance}
                    handleOpenDepositReceipt={this.handleOpenDepositReceipt}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {showCryptoDeposit && (
          <ModalDepositCrypto
            currency={currency}
            profile={profile}
            handleClose={() => this.setState({ showCryptoDeposit: false })}
          />
        )}

        {showModalReal && (
          <div className="screen-overlay">
            <div
              onClick={e => e.stopPropagation()}
              className="overlay-deposito"
            >
              <header className="overlay-deposito__header">
                <h3>Depósito em Reais</h3>
                <button
                  onClick={() => this.setState({ showModalReal: false })}
                  className="overlay-deposito__close"
                >
                  <img src="/static/img/cancel.svg" />
                </button>
              </header>
              <div className="overlay-deposito__content">
                {this.props.profile.verified === 1 ? (
                  <React.Fragment>
                    <p className="overlay-deposito__label">
                      Para qual banco deseja realizar o{' '}
                      <strong>depósito</strong>?
                    </p>
                    <ul className="overlay-deposito__banks">
                      <li
                        onClick={() =>
                          this.setState({
                            bankSelected: '033',
                            depositType: 'SAME_BANK',
                          })
                        }
                        className={`overlay-deposito__banks__item overlay-deposito__banks__item--santander ${bankSelected ===
                          '033' && 'selected'}`}
                      >
                        <span />
                      </li>
                      <li
                        onClick={() =>
                          this.setState({
                            bankSelected: '001',
                          })
                        }
                        className={`overlay-deposito__banks__item overlay-deposito__banks__item--bb ${bankSelected ===
                          '001' && 'selected'}`}
                      >
                        <span />
                      </li>
                      <li
                        onClick={() => this.setState({ bankSelected: '104' })}
                        className={`overlay-deposito__banks__item overlay-deposito__banks__item--caixa ${bankSelected ===
                          '104' && 'selected'}`}
                      >
                        <span />
                      </li>
                      <li
                        onClick={() =>
                          this.setState({ bankSelected: 'others' })
                        }
                        style={{ width: '38%' }}
                        className={`overlay-deposito__banks__item overlay-deposito__banks__item--others ${bankSelected ===
                          'others' && 'selected'}`}
                      >
                        <p>Outros bancos</p>
                      </li>
                    </ul>
                    <div className="overlay-deposito__container-input">
                      <div className="overlay-deposito__type">
                        {availableBanks.includes(bankSelected) ? (
                          <Button className="active full">
                            TRANSFERÊNCIA ENTRE CONTAS DE MESMO BANCO
                          </Button>
                        ) : (
                          <div>
                            <Button
                              className={depositType === 'TED' && 'active'}
                              onClick={() =>
                                this.setState({ depositType: 'TED' })
                              }
                            >
                              TED
                            </Button>
                            <Button
                              className={depositType === 'DOC' && 'active'}
                              onClick={() =>
                                this.setState({ depositType: 'DOC' })
                              }
                            >
                              DOC
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="overlay-deposito__container-input">
                      <label className="overlay-deposito__label">
                        Qual o valor do depósito?
                      </label>

                      <MaskedInput
                        mask={fiatMask}
                        onChange={e =>
                          this.setState({ depositValue: e.target.value })
                        }
                        onKeyUp={e =>
                          this.setState({ depositValue: e.target.value })
                        }
                        onKeyPress={this.handleKeyPress}
                        value={depositValue || ''}
                        placeholder={'R$ 0,00'}
                        className="primary-field overlay-deposito__input overlay-deposito__value"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    {depositError && (
                      <Alert
                        message={depositError}
                        type="error"
                        closeText="Fechar"
                        onClose={() => this.setState({ depositError: '' })}
                      />
                    )}
                  </React.Fragment>
                ) : (
                  <div>
                    <Alert
                      message="Verifique sua conta para executar esta ação."
                      type="error"
                      style={{ textAlign: 'center' }}
                    />
                    <Link prefetch href="/verificacao">
                      <a
                        href="#"
                        className="primary-button primary-button--continue verificacao__item__button"
                        style={{
                          width: '60%',
                          marginLeft: '20%',
                          padding: '10px 20px',
                          marginTop: '20px',
                          textAlign: 'center',
                        }}
                      >
                        Clique aqui para verificar sua conta
                      </a>
                    </Link>
                  </div>
                )}
              </div>
              {this.props.profile.verified === 1 && (
                <footer className="overlay-deposito__footer">
                  <button
                    onClick={() => this.setState({ showModalReal: false })}
                    className="primary-button primary-button--text"
                  >
                    Cancelar
                  </button>
                  <FormItem>
                    <Button
                      onClick={() => this.handleContinueDeposit()}
                      disabled={this.hasErrors(getFieldsError())}
                      type="primary"
                    >
                      Continuar
                    </Button>
                  </FormItem>
                </footer>
              )}
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="screen-overlay">
            <div
              onClick={e => e.stopPropagation()}
              className="overlay-deposito"
            >
              <header className="overlay-deposito__header">
                <h3>Confirmação do Depósito</h3>
                <button
                  onClick={() => this.setState({ showConfirmation: false })}
                  className="overlay-deposito__close"
                >
                  <img src="/static/img/cancel.svg" />
                </button>
              </header>
              <div
                className="overlay-deposito__content"
                style={{ paddingBottom: '0' }}
              >
                <div className="overlay-deposito__block">
                  <div className="overlay-deposito__block__item">
                    <h4 className="overlay-deposito__block__name">
                      Dados do Depósito
                    </h4>
                    <ul className="overlay-deposito__block__list">
                      <li>
                        <span>Origem</span>
                        {Object.keys(this.props.profile).length > 0 &&
                          this.props.profile.name}
                      </li>
                      <li>
                        <span>CPF/CNPJ de origem</span>
                        {Object.keys(this.props.profile).length > 0 &&
                          formatarCpfCnpj(this.props.profile.document)}
                      </li>
                      <li>
                        <span>Tipo</span>{' '}
                        {this.state.depositType.replace(
                          'SAME_BANK',
                          'Transferência de mesmo banco.'
                        )}
                      </li>
                      <li>
                        <span>Valor</span> R${' '}
                        {currencyFormatter.format(
                          this.state.depositValue
                            .replace('.', '')
                            .replace(',', '.'),
                          {
                            format: '%v',
                            decimal: ',',
                            thousand: '.',
                            precision: 2,
                          }
                        )}
                      </li>
                    </ul>
                  </div>
                  <div className="overlay-deposito__block__item">
                    <h4 className="overlay-deposito__block__name">
                      Dados do Destinatário
                    </h4>
                    <ul className="overlay-deposito__block__list">
                      <li>
                        <span>Titular</span> NOCTACOIN INTERMEDIAÇÕES LTDA
                      </li>
                      <li>
                        <span>CNPJ</span> 28.146.526/0001-01
                      </li>
                      <li>
                        <span>Banco</span>
                        {findBank(bankSelected).bank} (
                        {findBank(bankSelected).bank_id})
                      </li>
                    </ul>
                    <ul className="overlay-deposito__block__list overlay-deposito__block__list--inline">
                      <li>
                        <span>Agência</span>
                        {findBank(bankSelected).agency}
                      </li>
                      <li>
                        <span>Conta</span>
                        {findBank(bankSelected).account}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="overlay-deposito__warning">
                  <h4 className="overlay-deposito__warning__title">
                    Dados do Depósito
                  </h4>
                  <ul className="overlay-deposito__warning__list">
                    <li>
                      • Este depósito deve vir de uma conta bancária{' '}
                      <strong>de sua titularidade</strong>,<br />
                      pelo CPF/CNPJ{' '}
                      <strong>
                        {Object.keys(this.props.profile).length > 0 &&
                          formatarCpfCnpj(this.props.profile.document)}
                      </strong>
                      .
                    </li>
                    <li>
                      • Após prosseguir,{' '}
                      <strong>
                        envie imediatamente o comprovante da transferência.
                      </strong>
                    </li>
                  </ul>
                </div>

                <div style={{ paddingTop: '16px' }} />

                {depositError && (
                  <Alert
                    message={depositError}
                    type="error"
                    closeText="Fechar"
                    style={{ marginTop: '-5px', marginBottom: '10px' }}
                    onClose={() => this.setState({ depositError: '' })}
                  />
                )}
              </div>
              <footer className="overlay-deposito__footer">
                <button
                  onClick={() =>
                    this.setState({
                      showModalReal: true,
                      showConfirmation: false,
                    })
                  }
                  className="primary-button primary-button--text"
                >
                  Voltar
                </button>
                <Button
                  onClick={e => this.handleSubmit(e)}
                  type="primary"
                  loading={this.state.loadingSubmit}
                >
                  Enviar depósito
                </Button>
              </footer>
            </div>
          </div>
        )}

        {showModalWithdrawBRL && (
          <ModalWithdrawBrl
            handleClose={() => this.setState({ showModalWithdrawBRL: false })}
            handleUpdateUserBalance={this.handleUpdateUserBalance}
            brlBalance={this.state.brlBalance}
          />
        )}

        {this.state.isCriptoModalOpen && (
          <ModalSaqueCripto
            handleUpdateUserBalance={this.handleUpdateUserBalance}
            handleClose={() => this.handleOpenWithdrawCripto(false, '', '', '')}
            currency={this.state.currencySelected}
            currencyName={
              findCurrency(
                `${this.state.currencySelected}/BRL`,
                this.props.myBalance.balance
              ).currency_name
            }
            currencySymbol={this.state.currencySymbol}
          />
        )}

        {this.state.isOpenDepositReceipt && (
          <ModalDepositReceipt
            handleUpdateUserBalance={this.handleUpdateUserBalance}
            identificator={this.state.identificator}
            handleClose={() => this.handleOpenDepositReceipt(false)}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  profile: state.users.userProfile,
  userLimit: state.users.userLimit,
  myBalance: state.users.myBalance,
  bankAccounts: state.bank.bankAccounts,
  ticker: state.orders.ticker,
  currentPair: state.orders.currentPair,
  myDeposits: state.users.myDeposits,
  isFetchingDeposit: state.users.isFetchingDeposit,
});
const WrappedCarteira = Form.create()(Carteira);
export default connect(mapStateToProps)(WrappedCarteira);
