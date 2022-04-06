import ContextAsideSimples from '../components/context/asideSimples';
import ContextHeader from '../components/context/header';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import { changeCurrentPair } from '../actions/orders';
import has from 'lodash/has';
import currencyFormatter from 'currency-formatter';
import PlaceOrderModal from '../components/orders/placeOrderModal';
import Loader from '../components/Loader';
import math from 'mathjs';
import React from 'react';

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

const unformatCurrency = (val = '', symbol) => {
  return val
    .replace(/\./g, '')
    .replace(symbol, '')
    .replace(/\,/g, '.')
    .replace(/\s/g, '');
};

class Simples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBuy: true,
      price: '0,00',
      amountCrypto: '0,00000000',
      amount: 0,
      isOpenModal: false,
      value: 0,
    };
  }

  calcMarket = (value, pair) => {
    const { livroOrdens } = this.props;
    const currentPair = pair ? pair : this.props.currentPair;

    if (typeof value === 'string') {
      value = value
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.');
    }

    let price = 0;
    let amount = 0;
    let orderTotal = 0;
    let orders = [];

    if (value < 1) {
      return {
        price,
        amount,
        orderTotal,
      };
    }

    if (
      Object.keys(livroOrdens).length === 0 &&
      !has(livroOrdens, currentPair)
    ) {
      return {
        price,
        amount,
        orderTotal,
      };
    }
    const side = this.state.isBuy ? 'sell' : 'buy';
    orders = livroOrdens[currentPair].orderBook.filter(
      item => item.side === side,
    );

    let foundAmount = 0;

    for (const reg in orders) {
      foundAmount += parseFloat(orders[reg].amount * orders[reg].price);

      if (foundAmount >= value) {
        price = parseFloat(orders[reg].price);
        amount = parseFloat(orders[reg].amount);

        orderTotal = value / price;
        break;
      }
    }

    return {
      price,
      amount,
      orderTotal,
    };
  };

  calcMarketByAmount = (amountCrypto = null) => {
    const { livroOrdens, currentPair: pair } = this.props;
    const amount = amountCrypto ? amountCrypto : 1;

    if (Object.keys(livroOrdens).length === 0 || !has(livroOrdens, pair)) {
      return 0;
    }

    const side = this.state.isBuy ? 'sell' : 'buy';
    const orders = livroOrdens[pair].orderBook.filter(
      item => item.side === side,
    );

    let foundAmount = 0;
    let value = 0;

    for (const reg in orders) {
      foundAmount += parseFloat(orders[reg].amount);
      if (foundAmount >= amount) {
        value = parseFloat(orders[reg].price);
        break;
      }
    }

    return currencyFormatter.format(value, {
      format: '%v',
      decimal: ',',
      thousand: '.',
      precision: 2,
    });
  };

  handleOpenModal = (isOpenModal, price, amount) => {
    if (this.props.userProfile.verified === 0) {
      return message.error('Verifique sua conta antes de criar uma ordem');
    }

    if (typeof price === 'string') {
      price = price
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.');
    }
    this.setState({ isOpenModal, value: price, amount });
  };

  handleCalculatePrices = (pair, amount) => {
    const {
      myBalance: { balance = [] },
    } = this.props;
    const currencySymbol = findCurrency(pair, balance).currency_symbol;
    const amountCrypto = parseFloat(unformatCurrency(amount, currencySymbol));
    const price = this.calcMarketByAmount(amountCrypto);
    const tBruto = math.multiply(amountCrypto, unformatCurrency(price, ''));
    const priceTotal = currencyFormatter.format(tBruto, {
      format: '%v',
      decimal: ',',
      thousand: '.',
      precision: 2,
    });
    this.setState({ price: priceTotal });
  };

  handleChangeAmount = (value, pair) => {
    this.setState({ amountCrypto: value }, () => {
      this.handleCalculatePrices(pair, this.state.amountCrypto);
    });
  };
  handleChangeAmount2 = (event) => {
    this.setState({ price: event.target.value }, () => {
      let amountCrypto = this.calcMarket(this.state.price).orderTotal.toString().replace('.',',');
      this.setState({ amountCrypto });
    });
  };

  render() {
    const {
      myBalance: { balance = [] },
      currentPair,
      ticker,
      livroOrdens,
    } = this.props;
    const { isBuy } = this.state;

    const currency = findCurrency(currentPair, balance);
    const currencySymbol = currency.currency_symbol;
    const currencyName = currency.currency_name;
    return (
      <div style={{ display: 'flex' }}>
        <ContextAsideSimples/>
        <main className="main">
          <ContextHeader page="6"/>
          <div className="content_wrap">
            <div
              className="carteira container-content"
              style={{ width: '100%', padding: '0' }}
            >
              {balance.length > 0 &&
              Object.keys(livroOrdens).length > 0 &&
              has(livroOrdens, currentPair) ? (
                <React.Fragment>
                  <section>
                    <h1
                      className="carteira__title"
                      style={{ fontSize: '1.2rem' }}
                    >
                      {`(${findCurrency(currentPair, balance).currency})`}{' '}
                      {findCurrency(
                        currentPair,
                        balance,
                      ).currency_name.toUpperCase()}
                    </h1>
                  </section>
                  <section>
                    <div id="currency_select">
                      <div>
                        {balance.map((item, index) => {
                          if (item.currency === 'BRL') {
                            return;
                          }
                          return (
                            <React.Fragment key={index}>
                              <Button
                                className={`simple-pair-button ${currentPair.split(
                                  '/',
                                )[0] === item.currency && 'active'}`}
                                onClick={() =>
                                  this.props.dispatch(
                                    changeCurrentPair(`${item.currency}_BRL`),
                                  )
                                }
                              >
                                <img
                                  src={`/static/img/coins/${item.currency.toLowerCase()}.svg`}
                                />
                                <span
                                  style={{
                                    textTransform: 'uppercase',
                                    fontWeight: '600',
                                  }}
                                >
																	{item.currency_name}
																</span>
                                <p>
                                  {has(ticker, `${item.currency}/BRL`) &&
                                  currencyFormatter.format(
                                    ticker[`${item.currency}/BRL`].last,
                                    {
                                      symbol: 'R$',
                                      format: '%s %v',
                                      decimal: ',',
                                      thousand: '.',
                                      precision: 2,
                                    },
                                  )}
                                </p>
                              </Button>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="simple-trade">
                      <div
                        className={`sliding-background ${!isBuy && 'right'}`}
                      >
                        {isBuy ? 'COMPRAR' : 'VENDER'}
                      </div>
                      <div style={{ zIndex: '999' }}>
                        <button
                          onClick={() =>
                            this.setState({
                              isBuy: true,
                              comission: '0',
                              totalLiquido: '0',
                              amount: '0',
                              amountCrypto: '0,00000000',
                              price: '0,00',
                              totalBruto: 0,
                            })
                          }
                          className={`aside__button-switch ${!!isBuy &&
                          'aside__button-switch--selected'}`}
                        >
                          COMPRAR
                        </button>
                        <button
                          onClick={() =>
                            this.setState({
                              isBuy: false,
                              comission: '0',
                              totalLiquido: '0',
                              amount: '0',
                              price: '0,00',
                              amountCrypto: '0,00000000',
                              totalBruto: 0,
                            })
                          }
                          className={`aside__button-switch ${!isBuy &&
                          'aside__button-switch--selected'}`}
                        >
                          VENDER
                        </button>
                      </div>
                    </div>

                    <div className="plans-area">
                      <div className={`plan ${!isBuy && 'sell'}`}>
                        <header>
                          <h2 className="plan-title">
                            {isBuy ? 'Comprar' : 'Vender'}
                          </h2>
                          <div className="plan-cost">
														<span className="plan-price">
															{currencyFormatter.format(
                                this.calcMarket(100).orderTotal,
                                {
                                  symbol: currencySymbol,
                                  format: '%s %v',
                                  decimal: ',',
                                  thousand: '.',
                                  precision: 8,
                                },
                              )}
														</span>
                            <span className="plan-type"/>
                          </div>
                        </header>
                        <div className="plan-features">
                          <h4>por</h4>
                          <h1>R$ 100,00</h1>
                        </div>
                        <div className="plan-select">
                          <a
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              this.handleOpenModal(
                                true,
                                this.calcMarket(100).price,
                                this.calcMarket(100).orderTotal,
                              )
                            }
                          >
                            {isBuy ? 'Comprar' : 'Vender'}
                          </a>
                        </div>
                      </div>

                      <div className={`plan ${!isBuy && 'sell'}`}>
                        <header>
                          <h2 className="plan-title">
                            {isBuy ? 'Comprar' : 'Vender'}
                          </h2>
                          <div className="plan-cost">
														<span className="plan-price">
															{currencyFormatter.format(
                                this.calcMarket(200).orderTotal,
                                {
                                  symbol: currencySymbol,
                                  format: '%s %v',
                                  decimal: ',',
                                  thousand: '.',
                                  precision: 8,
                                },
                              )}
														</span>
                            <span className="plan-type"/>
                          </div>
                        </header>
                        <div className="plan-features">
                          <h4>por</h4>
                          <h1>R$ 200,00</h1>
                        </div>
                        <div className="plan-select">
                          <a
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              this.handleOpenModal(
                                true,
                                this.calcMarket(200).price,
                                this.calcMarket(200).orderTotal,
                              )
                            }
                          >
                            {isBuy ? 'Comprar' : 'Vender'}
                          </a>
                        </div>
                      </div>

                      <div className={`plan ${!isBuy && 'sell'}`}>
                        <header>
                          <h2 className="plan-title">
                            {isBuy ? 'Comprar' : 'Vender'}
                          </h2>
                          <div className="plan-cost">
														<span className="plan-price">
															{currencyFormatter.format(
                                this.calcMarket(500).orderTotal,
                                {
                                  symbol: currencySymbol,
                                  format: '%s %v',
                                  decimal: ',',
                                  thousand: '.',
                                  precision: 8,
                                },
                              )}
														</span>
                            <span className="plan-type"/>
                          </div>
                        </header>
                        <ul className="plan-features">
                          <h4>por</h4>
                          <h1>R$ 500,00</h1>
                        </ul>
                        <div className="plan-select">
                          <a
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              this.handleOpenModal(
                                true,
                                this.calcMarket(500).price,
                                this.calcMarket(500).orderTotal,
                              )
                            }
                          >
                            {isBuy ? 'Comprar' : 'Vender'}
                          </a>
                        </div>
                      </div>

                      <div className={`plan ${!isBuy && 'sell'}`}>
                        <header>
                          <h2 className="plan-title">
                            {isBuy ? 'Comprar' : 'Vender'}
                          </h2>
                          <div className="plan-cost">
                            <Cleave
                              onChange={e =>
                                this.handleChangeAmount(
                                  e.target.value,
                                  currentPair,
                                )
                              }
                              value={this.state.amountCrypto || ''}
                              options={{
                                numeral: true,
                                prefix: `${currencySymbol} `,
                                numeralDecimalMark: ',',
                                delimiter: '.',
                                numeralDecimalScale: 8,
                              }}
                              className="input-price"
                              style={{ marginTop: '-5px', padding: '2px 0' }}
                            />
                            <span className="plan-type"/>
                          </div>
                        </header>
                        <div className="plan-features">
                          <h4>por</h4>
                          <Cleave
                            onChange={this.handleChangeAmount2}
                            value={this.state.price || ''}
                            options={{
                              numeral: true,
                              prefix: 'R$ ',
                              numeralDecimalMark: ',',
                              delimiter: '.',
                              numeralDecimalScale: 2,
                            }}
                            className={`aside__form-input`}
                          />
                        </div>
                        <div className="plan-select">
                          <a
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              this.handleOpenModal(
                                true,
                                this.calcMarket(this.state.price).price,
                                this.calcMarket(this.state.price).orderTotal,
                              )
                            }
                          >
                            {isBuy ? 'Comprar' : 'Vender'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>
                </React.Fragment>
              ) : (
                <div>
                  <Loader/>
                </div>
              )}
            </div>
          </div>
        </main>

        {this.state.isOpenModal && (
          <PlaceOrderModal
            handleClose={() => this.handleOpenModal(false, 0, 0)}
            currencyName={currencyName}
            currencySymbol={currencySymbol}
            price={this.state.value}
            amount={this.state.amount}
            isBuy={isBuy}
            comissao={0}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  myBalance: state.users.myBalance,
  currentPair: state.orders.currentPair,
  ticker: state.orders.ticker,
  livroOrdens: state.orders.livroOrdens,
  userProfile: state.users.userProfile,
});
export default connect(mapStateToProps)(Simples);
