import { connect } from 'react-redux';
import currencyFormatter from 'currency-formatter';
    import socket from '../utils/socketConnection';
import has from 'lodash/has';
import { capitalizeFirstLetter } from '../utils/functions';
import { Alert } from 'antd';
import { fetchMyBalance } from '../actions/users';
import { message } from 'antd';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import MaskedInput from 'react-text-mask';
import * as math from 'mathjs';
import { updateBoxTrades } from '../actions/orders';

import '../scss/components/boxTrade.scss';

const fiatMask = (symbol = 'R$') =>
  createNumberMask({
    prefix: `${symbol} `,
    suffix: '',
    includeThousandsSeparator: true,
    allowDecimal: true,
    decimalSymbol: ',',
    thousandsSeparatorSymbol: '.',
    decimalLimit: symbol === 'R$' ? 2 : 8,
  });

const unformatCurrency = (val = '') => {
  const value = val ? val : '0';
  return value
    .toString()
    .replace(/\./g, '')
    .replace(/\,/g, '.')
    .replace(/\s/g, '')
    .replace('$', '')
    .replace(/[^\d.-]/g, '');
};

const basePair = (currentPair, balance) => {
  const pair = currentPair.split('/');

  if (balance.length === 0) {
    return {
      currency_name: '',
      currency_symbol: '',
      currency_decimals: 8,
      balance: '',
      fiat: 0,
    };
  }

  const currency =
    balance.length > 1
      ? balance.find(item => item.currency.toUpperCase() === pair[0].toUpperCase())
      : balance;

  if (currency) {
    return {
      currency_name: capitalizeFirstLetter(currency.currency_name),
      currency_symbol: currency.currency_symbol,
      currency_decimals: currency.currency_is_fiat == 1 ? 2 : 8,
      balance: currency.available_balance,
      fiat: currency.currency_is_fiat,
    };
  }

  return {
    currency_name: '',
    currency_symbol: '',
    currency_decimals: 8,
    balance: '',
    fiat: 0,
  };
};

const targetPair = (currentPair, balance) => {
  const pair = currentPair.split('/');

  if (balance.length === 0) {
    return {
      currency_name: '',
      currency_symbol: '',
      currency_decimals: 8,
      balance: '',
      fiat: 0,
    };
  }

  const currency =
    balance.length > 1
      ? balance.find(item => item.currency.toUpperCase() === pair[1].toUpperCase())
      : balance;

  if (currency) {
    return {
      currency_name: capitalizeFirstLetter(currency.currency_name),
      currency_symbol: currency.currency_symbol,
      currency_decimals: currency.currency_is_fiat == 1 ? 2 : 8,
      balance: currency.available_balance,
      fiat: currency.currency_is_fiat,
    };
  }

  return {
    currency_name: '',
    currency_symbol: '',
    currency_decimals: 8,
    balance: '',
    fiat: 0,
  };
};

class BoxTrade extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: '0.00000000',
      price: '0.00',
      buy: this.props.context.buyAsideStatus,
      orders: true,
      isMercado: true,
      showModal: false,
      confirm: false,
      errorPrice: false,
      errorAmount: false,
      errorValue: false,
      error: '',
      loadingSubmit: false,
      submitMessage: '',
      submitError: false,
      submitSuccess: false,
      comission: '0',
      totalBruto: 0,
      totalLiquido: 0,
    };
  }

  handlePlaceOrder = (e, currencySymbol) => {
    e.preventDefault();

    this.setState({ loadingSubmit: true });

    const data = {
      pair: this.props.currentPair,
      amount: parseFloat(unformatCurrency(this.state.amount)),
      price: parseFloat(unformatCurrency(this.state.price)),
      order_type: `${ this.state.buy ? 'buy' : 'sell'} ${this.state.isMercado ? 'market' : 'limit'} advanced`,
      token: `Bearer ${localStorage.getItem('auth_token')}`,
    };

    socket.emit('place_order', data, async response => {
      if (!response.success) {
        return this.setState({
          submitMessage: response.message,
          submitError: true,
          loadingSubmit: false,
        });
      }

      this.props.dispatch(fetchMyBalance());
      message.success(response.message);
      return this.setState({
        submitMessage: '',
        submitError: false,
        showModal: false,
        loadingSubmit: false,
        amount: '0.00000000',
        price: '0.00',
        comission: '0',
        totalBruto: 0,
        totalLiquido: 0,
      });
    });
  };

  calcMarket = (amount, orders) => {
    let amountRemaining = math.sum(0, amount);
    let foundAmount;
    let value = '0';
    let total= 0;
    let amountFounded= 0;
    if (amount && amount > 0) {
      for(let index=0;index<orders.length;index++){
        foundAmount = parseFloat(orders[index].amount);
        amountFounded= math.sum(amountFounded,foundAmount);
        if(foundAmount >= amountRemaining){
          total = math.sum(total,math.multiply(amountRemaining,parseFloat(orders[index].price)));
          break;
        }else{
          total = math.sum(total,math.multiply(foundAmount,parseFloat(orders[index].price)));
          amountRemaining = math.subtract(amountRemaining,foundAmount);
        }
      }
      if(amount>amountFounded){
        // @TODO criar metodo que mostre que ultrapassou a quantidade que existe no mercado e nao simplesmente zerar o value.
        value= 0;
      }else {
        value= math.divide(total,amount);
      }
    }


    return currencyFormatter.format(value, {
      format: '%v',
      decimal: ',',
      thousand: '.',
      precision: 2,
    });
  };

  calcMarketByTotal = (total, orders) => {
    let foundTotal = 0;
    let foundPrice = 0;
    let value = '0';
    let foundAmount = 0;
    let totalMissing = math.sum(0,total);
    let amount = 0;
    if (total || total > 0 ) {
      for(let index=0;index<orders.length;index++){
        foundAmount = parseFloat(orders[index].amount);
        foundPrice = parseFloat(orders[index].price);
        foundTotal =
          math.multiply(foundAmount , foundPrice);
        if (foundTotal >= totalMissing) {
          amount = math.sum(amount,math.divide(totalMissing,foundPrice));
          break;
        }else{
          totalMissing = math.subtract(totalMissing,foundTotal);
          amount = math.sum(amount,foundAmount);
        }
      }
      if(amount !== 0){
        value = math.divide(total,amount);
      }
    }

    return currencyFormatter.format(value, {
      format: '%v',
      decimal: ',',
      thousand: '.',
      precision: 2,
    });
  };

  handleCalculatePrices = (updateTotal = true, removeErrors = true) => {
    const { amount, buy, isMercado, price } = this.state;
    const { livroOrdens, currentPair, userProfile } = this.props;

    let comissao = '0';
    let tBruto = 0;
    const { fees } = userProfile;
    const pairLower = currentPair
      .split('/')
      .join('')
      .toLowerCase();

    let preco = parseFloat(unformatCurrency(price || '0'));

    let quantidade = parseFloat(unformatCurrency(amount || '0'));

    if (
      Object.keys(livroOrdens).length > 0 &&
      has(livroOrdens[currentPair], 'orderBook')
    ) {
      if (isMercado && updateTotal) {
        if (buy) {
          if (
            livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'sell'
            ).length > 0
          ) {
            preco = this.calcMarket(
              quantidade,
              livroOrdens[currentPair].orderBook.filter(
                item => item.side === 'sell'
              )
            );
          }
        } else {
          if (
            livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'buy'
            ).length > 0
          ) {
            preco = this.calcMarket(
              quantidade,
              livroOrdens[currentPair].orderBook.filter(
                item => item.side === 'buy'
              )
            );
          }
        }
        this.setState({ price: preco });
        preco = parseFloat(unformatCurrency(preco || '0'));
      }

      let taxa = 0;
      if (isMercado && preco && parseFloat(preco) > 0) {
        taxa = parseFloat(fees[`${pairLower}_taker`]) || 0;
      } else {
        const orderBook = buy
          ? livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'sell'
            )
          : livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'buy'
            );

        let high = orderBook.length > 0 ? orderBook[0].preco : 0;
        let low = orderBook.length > 0 ? orderBook[0].preco : 0;

        for (let reg in orderBook) {
          if (orderBook[reg].preco > high) {
            high = orderBook[reg].preco;
          } else if (orderBook[reg].preco < low) {
            low = orderBook[reg].preco;
          }
        }

        if (preco && parseFloat(preco) > 0) {
          if (preco >= parseFloat(low) && preco <= parseFloat(high)) {
            taxa = fees[`${pairLower}_taker`];
          } else {
            taxa = fees[`${pairLower}_maker`];
          }
        }
      }

      // sobrepõe as taxas se tiver o buy/sell cadastrado
      if (buy && parseFloat(fees.buy) >= 0) {
        taxa = parseFloat(fees.buy);
      }

      if (!buy && parseFloat(fees.sell) >= 0) {
        taxa = parseFloat(fees.sell);
      }

      tBruto = math.multiply(quantidade, preco);

      comissao = buy ? (quantidade / 100) * taxa : (tBruto / 100) * taxa;

      comissao = currencyFormatter.format(comissao, {
        format: '%v',
        decimal: ',',
        thousand: '.',
        precision: buy ? 8 : 2,
      });

      const tLiquido = currencyFormatter.format(
        buy
          ? parseFloat(unformatCurrency(amount || '0')) -
              parseFloat(unformatCurrency(comissao || '0'))
          : tBruto - unformatCurrency(comissao || '0'),
        { format: '%v', decimal: ',', thousand: '.', precision: buy ? 8 : 2 }
      );

      if (updateTotal) {
        tBruto = currencyFormatter.format(tBruto, {
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: 2,
        });
        this.setState({ totalBruto: tBruto });
      }

      if (removeErrors) {
        this.setState(
          { comission: comissao, totalLiquido: tLiquido },
          this.handleRemoveErrors
        );
      } else {
        this.setState({ comission: comissao, totalLiquido: tLiquido });
      }
    }
  };

  handleUseBalanceBuy = () => {
    const currency = this.props.currentPair.split('/')[1].toUpperCase();
    const balance = this.props.balance.find(
      item => item.currency.toUpperCase() === currency
    );

    this.setState(
      {
        totalBruto: currencyFormatter.format(
          basePair(this.props.currentPair, balance).balance,
          {
            symbol: basePair(this.props.currentPair, balance).currency_symbol,
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: basePair(this.props.currentPair, balance)
              .currency_decimals,
          }
        ),
      },
      this.handleCalculateByTotalBruto
    );
  };

  handleUseBalanceSell = () => {
    const currency = this.props.currentPair.split('/')[0].toUpperCase();

    const balance = this.props.balance.find(item => item.currency.toUpperCase() === currency);

    var value = currencyFormatter.format(
      targetPair(this.props.currentPair, balance).balance,
      {
        symbol: targetPair(this.props.currentPair, balance).currency_symbol,
        format: '%s %v',
        decimal: ',',
        thousand: '.',
        precision: targetPair(this.props.currentPair, balance)
          .currency_decimals,
      }
    );

    this.setState({ amount: value }, this.handleCalculatePrices);
  };

  handleCalculateByTotalBruto = () => {
    const { buy, isMercado, totalBruto } = this.state;
    const { currentPair, livroOrdens, balance = [] } = this.props;

    const totalFormated = parseFloat(unformatCurrency(totalBruto || '0'));

    let preco = null;

    if (isMercado) {
      if (buy) {
        if (
          this.props.livroOrdens[currentPair].orderBook.filter(
            item => item.side === 'sell'
          ).length > 0
        ) {
          preco = this.calcMarketByTotal(
            totalFormated,
            livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'sell'
            )
          );
        }
      } else {
        if (
          livroOrdens[currentPair].orderBook.filter(
            item => item.side === 'buy'
          ).length > 0
        ) {
          preco = this.calcMarketByTotal(
            totalFormated,
            livroOrdens[currentPair].orderBook.filter(
              item => item.side === 'buy'
            )
          );
        }
      }

      this.setState({
        price: preco,
      });
    }

    const currencySymbol = basePair(currentPair, balance).currency_symbol;

    const price = preco
      ? parseFloat(unformatCurrency(preco || '0'))
      : parseFloat(unformatCurrency(this.state.price || '0'));

    const amountValue = totalFormated / price;

    const amount = currencyFormatter.format(price !== 0 ? amountValue : '0', {
      symbol: currencySymbol,
      format: '%s %v',
      decimal: ',',
      thousand: '.',
      precision: 8,
    });

    this.setState({ amount }, () => this.handleCalculatePrices(false));
  };

  handleChangePrice = e => {
    this.setState({ price: e.target.value }, this.handleCalculatePrices);
  };

  handleChangeAmount = e => {
    this.setState({ amount: e.target.value }, this.handleCalculatePrices);
  };

  handleChangeTotalBruto = e => {
    this.setState(
      { totalBruto: e.target.value },
      this.handleCalculateByTotalBruto
    );
  };

  handleSendOperation = () => {
    if (this.props.userProfile.verified === 0) {
      return message.error('Verifique sua conta antes de criar uma ordem');
    }

    const pair = this.props.pairs.find(
      item => item.pair === this.props.currentPair
    );
    if (!pair || pair.active == 0) {
      return message.error('Par indisponível');
    }

    if (this.handleCheckErrors()) {
      this.setState({ showModal: true });
    }
  };

  componentDidMount() {
    this.handleCalculatePrices(true, false);
  }

  componentDidUpdate() {
    const { values, update } = this.props.boxTradeUpated;

    if (update) {
      const amount = currencyFormatter.format(values.amount, {
        format: '%v',
        decimal: ',',
        thousand: '.',
        precision: 8,
      });

      const price = currencyFormatter.format(values.price, {
        format: '%v',
        decimal: ',',
        thousand: '.',
        precision: 2,
      });

      values.side === 'buy'
        ? this.props.context.buyAsideFalse()
        : this.props.context.buyAsideTrue();

      this.props.context.toggleAside();

      this.setState(
        {
          amount,
          price,
          isMercado: false,
        },
        this.handleCalculatePrices
      );

      // zera o estado
      const data = {
        update: false,
        values: {},
      };
      this.props.dispatch(updateBoxTrades(data));
    }

    if (this.props.context.buyAsideStatus != this.state.buy) {
      this.setState({
        buy: this.props.context.buyAsideStatus,
      });
    }
  }

  handleRemoveErrors = () => {
    const orderMinimum = `${this.props.currentPair
      .toLowerCase()
      .replace('/', '_')}_minimum`;

    const minimum = has(this.props.orderLimits, orderMinimum)
      ? parseFloat(this.props.orderLimits[orderMinimum])
      : 0;

    const amount = parseFloat(unformatCurrency(this.state.amount));
    const price = parseFloat(unformatCurrency(this.state.price));
    const total = amount * price;

    if (amount && amount > 0) {
      this.setState({ errorAmount: false });
    }

    if (price && price > 0) {
      this.setState({ errorPrice: false });
    }

    if (total > minimum) {
      this.setState({ errorValue: false });
    }
  };

  handleCheckErrors = () => {
    const orderMinimum = `${this.props.currentPair
      .toLowerCase()
      .replace('/', '_')}_minimum`;

    const currencySymbolTarget = targetPair(
      this.props.currentPair,
      this.props.balance
    ).currency_symbol;

    const minimum = has(this.props.orderLimits, orderMinimum)
      ? parseFloat(this.props.orderLimits[orderMinimum])
      : 0;

    const minimumValue = currencyFormatter.format(minimum, {
      symbol: currencySymbolTarget,
      format: '%s %v',
      decimal: ',',
      thousand: '.',
      precision: currencySymbolTarget === 'R$' ? 2 : 8,
    });

    let errorAmount = false;
    let errorPrice = false;
    let errorValue = false;
    let error = '';
    let isValidForm = true;

    const amount = parseFloat(unformatCurrency(this.state.amount));
    const price = parseFloat(unformatCurrency(this.state.price));
    const total = amount * price;

    if (amount < 0 || !amount) {
      errorAmount = true;
      isValidForm = false;
    }

    if (price < 0 || !price) {
      errorPrice = true;
      isValidForm = false;
    }

    if (total < minimum) {
      error = `Mínimo de ${minimumValue}`;
      errorValue = true;
      isValidForm = false;
    }

    this.setState({
      errorAmount,
      errorValue,
      errorPrice,
      error,
    });

    return isValidForm;
  };

  render() {
    let {
      amount,
      buy,
      isMercado,
      price,
      showModal,
      errorPrice,
      errorAmount,
      totalBruto,
      errorValue,
    } = this.state;

    let { currentPair, balance } = this.props;

    const currencySymbol = basePair(currentPair, balance).currency_symbol;
    const currencyName = basePair(currentPair, balance).currency_name;

    const currencySymbolTarget = targetPair(currentPair, balance)
      .currency_symbol;

    return (
      <section className="aside__container">
        <div className="aside__internal-content">
          <header
            className="aside__container aside__header-but"
            style={{ borderBottomColor: 'transparent' }}
          >
            <button
              onClick={() => {
                this.props.context.buyAsideTrue();
                this.setState({
                  comission: '0',
                  totalLiquido: '0',
                  amount: '0',
                  price: 'R$ 0,00',
                  totalBruto: 0,
                  errorValue: false,
                  errorPrice: false,
                  errorAmount: false,
                  error: '',
                });
              }}
              className={`aside__button-border ${!!buy &&
                'aside__button-border--active active'} aside__button-border--blue`}
            >
              COMPRAR
            </button>
            <button
              onClick={() => {
                this.props.context.buyAsideFalse();
                this.setState({
                  comission: '0',
                  totalLiquido: '0',
                  amount: '0',
                  price: 'R$ 0,00',
                  totalBruto: 0,
                  errorValue: false,
                  errorPrice: false,
                  errorAmount: false,
                  error: '',
                });
              }}
              className={`aside__button-border ${!buy &&
                'aside__button-border--active active'} aside__button-border--red`}
            >
              VENDER
            </button>
          </header>
          <form onSubmit={e => e.preventDefault()} className="aside__form">
            <div
              style={{
                textAlign: 'center',
                marginBottom: '.5rem',
                position: 'relative',
              }}
              className="aside__buttons"
            >
              <div className={`sliding-background ${!isMercado && 'right'}`}>
                {isMercado ? 'MERCADO' : 'LIMITE'}
              </div>
              <div style={{ zIndex: '999' }}>
                <button
                  onClick={() =>
                    this.setState(
                      {
                        isMercado: true,
                        comission: '0',
                        totalLiquido: '0',
                        amount: '0',
                        price: 'R$ 0,00',
                        totalBruto: 0,
                        errorValue: false,
                        errorPrice: false,
                        errorAmount: false,
                        error: '',
                      },
                      this.handleCalculatePrices(true, false)
                    )
                  }
                  className={`aside__button-switch ${!!isMercado &&
                    'aside__button-switch--selected'}`}
                >
                  MERCADO
                </button>
                <button
                  onClick={() =>
                    this.setState({
                      isMercado: false,
                      comission: '0',
                      totalLiquido: '0',
                      amount: '0',
                      price: 'R$ 0,00',
                      totalBruto: 0,
                      errorValue: false,
                      errorPrice: false,
                      errorAmount: false,
                      error: '',
                    })
                  }
                  className={`aside__button-switch ${!isMercado &&
                    'aside__button-switch--selected'}`}
                >
                  LIMITE
                </button>
              </div>
            </div>

            <label className="aside__label">Quantidade</label>
            <span className="aside__form-field">
              <MaskedInput
                mask={fiatMask(this.props.currencySymbol)}
                onChange={this.handleChangeAmount}
                value={amount || ''}
                placeholder={`0,00000000`}
                className={`aside__form-input ` + errorAmount}
              />
              {!buy && (
                <button
                  onClick={() => this.handleUseBalanceSell()}
                  type="button"
                  style={{ position: 'absolute', top: '0', right: '0.6rem' }}
                >
                  Usar saldo
                </button>
              )}
            </span>
            {errorAmount && (
              <span className="box-trade">
                Valor inválido.
              </span>
            )}

            <p style={{ marginTop: '.5rem' }}>
              <label className="aside__label">Preço unitário</label>
              <span className="aside__form-field">
                <MaskedInput
                  mask={fiatMask()}
                  style={
                    isMercado
                      ? {
                          cursor: 'not-allowed',
                          backgroundColor: 'rgba(0,0,0,.05)',
                        }
                      : {}
                  }
                  onChange={this.handleChangePrice}
                  value={price || ''}
                  placeholder={'R$ 0,00'}
                  disabled={isMercado}
                  className={`aside__form-input ` + errorPrice}
                />
                {isMercado ? (
                  <button
                    onClick={() => this.handleCalculatePrices()}
                    type="button"
                    style={{ position: 'absolute', top: '0', right: '0.6rem' }}
                  >
                    Recalcular
                  </button>
                ) : (
                  ''
                )}
              </span>
              {errorPrice && (
                <span className="box-trade">
                  Valor inválido.
                </span>
              )}
            </p>

            <p style={{ marginTop: '.5rem' }}>
              <label className="aside__label">Total bruto</label>
              <span className="aside__form-field">
                <MaskedInput
                  mask={fiatMask()}
                  onChange={this.handleChangeTotalBruto}
                  value={totalBruto || '0'}
                  placeholder={'R$ 0,00'}
                  className={`aside__form-input ` + errorPrice}
                />
                {buy && (
                  <button
                    onClick={() => this.handleUseBalanceBuy()}
                    type="button"
                    style={{ position: 'absolute', top: '0', right: '0.6rem' }}
                  >
                    Usar saldo
                  </button>
                )}
              </span>
              {errorValue && (
                <span className="box-trade">
                  {this.state.error}
                </span>
              )}
            </p>

            <p className="aside__form-item">
              <span>Comissão</span>
              <span className="aside__right-txt">
                {buy ? currencySymbol : 'R$'} {this.state.comission}
              </span>
            </p>
            <p className="aside__form-item">
              <span>Total Líquido</span>
              <span className="aside__right-txt">
                {buy ? currencySymbol : 'R$'} {this.state.totalLiquido}
              </span>
            </p>
            <button
              onClick={() => this.handleSendOperation()}
              className={`aside__form-button ${!buy &&
                'aside__form-button--red'}`}
            >
              {buy
                ? `COMPRAR ${currencyName.toUpperCase()}`
                : `VENDER ${currencyName.toUpperCase()}`}
            </button>
          </form>
        </div>
        {!!showModal && (
          <div className="screen-overlay">
            <div
              onClick={e => e.stopPropagation()}
              className="overlay-deposito"
            >
              <header className="overlay-deposito__header">
                <h3>
                  Confirmação de {buy ? 'COMPRA' : 'VENDA'} de{' '}
                  <span style={{ textTransform: 'uppercase' }}>
                    {currencyName.toUpperCase()}
                  </span>
                </h3>
                <button
                  onClick={() =>
                    this.setState({
                      showModal: false,
                      confirm: false,
                      submitError: false,
                      submitSuccess: false,
                      submitMessage: '',
                    })
                  }
                  className="overlay-deposito__close"
                >
                  <img src="/static/img/cancel.svg" />
                </button>
              </header>
              <div className="overlay-deposito__content">
                {
                  <React.Fragment>
                    <p style={{ display: 'none' }}>
                      Deseja confirmar a {this.props.isBuy ? 'compra' : 'venda'}{' '}
                      de {currencyName.toUpperCase()}?
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <div className="row simple-row">
                        <div className="col-6">
                          <b>Par:</b> {currentPair}
                        </div>
                        <div className="col-6">
                          <b>Comissão:</b>{' '}
                          {currencyFormatter.format(
                            this.state.comission.replace(',', '.'),
                            {
                              symbol: buy ? currencySymbol : 'R$',
                              format: '%s %v',
                              decimal: ',',
                              thousand: '.',
                              precision: buy ? 8 : 2,
                            }
                          )}
                        </div>
                      </div>
                      <div className="row simple-row">
                        <div className="col-6">
                          <b>Tipo:</b> {isMercado ? 'Mercado' : 'Limite'}
                        </div>
                        <div className="col-6">
                          <b>Preço unitário:</b>{' '}
                          {currencyFormatter.format(unformatCurrency(price), {
                            symbol: currencySymbolTarget,
                            format: '%s %v',
                            decimal: ',',
                            thousand: '.',
                            precision: currencySymbolTarget === 'R$' ? 2 : 8,
                          })}
                        </div>
                      </div>
                      <div className="row simple-row">
                        <div className="col-6">
                          <b>Quantidade:</b>{' '}
                          {currencyFormatter.format(unformatCurrency(amount), {
                            symbol: currencySymbol,
                            format: '%s %v',
                            decimal: ',',
                            thousand: '.',
                            precision: currencySymbol === 'R$' ? 2 : 8,
                          })}
                        </div>
                        <div className="col-6">
                          <b>Valor Total:</b>{' '}
                          {currencyFormatter.format(
                            unformatCurrency(price) * unformatCurrency(amount),
                            {
                              symbol: currencySymbolTarget,
                              format: '%s %v',
                              decimal: ',',
                              thousand: '.',
                              precision: currencySymbolTarget === 'R$' ? 2 : 8,
                            }
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        {this.state.submitSuccess && (
                          <Alert
                            showIcon
                            type="success"
                            message={this.state.submitMessage}
                            closeText="Fechar"
                            onClose={() =>
                              this.setState({
                                submitSuccess: false,
                                submitMessage: '',
                              })
                            }
                          />
                        )}

                        {this.state.submitError && (
                          <Alert
                            showIcon
                            type="error"
                            message={this.state.submitMessage}
                            closeText="Fechar"
                            onClose={() =>
                              this.setState({
                                submitError: false,
                                submitMessage: '',
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                    <button
                      style={{ color: '#FFF' }}
                      onClick={() =>
                        this.setState({
                          showModal: false,
                          confirm: false,
                          submitError: false,
                          submitSuccess: false,
                          submitMessage: '',
                        })
                      }
                      className={`place-order-btn place-order-btn-no aside__form-button aside__form-button--red`}
                    >
                      NÃO
                    </button>
                    <button
                      style={
                        this.state.loadingSubmit
                          ? {
                              color: '#FFF',
                              cursor: 'not-allowed',
                              pointerEvents: 'none',
                            }
                          : { color: '#FFF' }
                      }
                      onClick={e => this.handlePlaceOrder(e, currencySymbol)}
                      className={`place-order-btn place-order-btn-yes aside__form-button`}
                    >
                      {this.state.loadingSubmit ? 'AGUARDE...' : 'SIM'}
                    </button>
                  </React.Fragment>
                }
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}

const mapStateToProps = state => {
  const {
    userProfile,
    myBalance: { balance },
  } = state.users;
  const {
    livroOrdens,
    currentPair,
    boxTradeUpated,
    orderLimits,
    currencySymbol,
    pairs,
  } = state.orders;
  return {
    livroOrdens,
    userProfile,
    currentPair,
    balance,
    boxTradeUpated,
    orderLimits,
    currencySymbol,
    pairs,
  };
};
export default connect(mapStateToProps)(BoxTrade);
