import Router from 'next/router';
import BoxTrade from './boxTrade';
import { connect } from 'react-redux';
import currencyFormatter from 'currency-formatter';
import has from 'lodash/has';
import { capitalizeFirstLetter } from '../utils/functions';
import ReactTooltip from 'react-tooltip';
import { changeCurrentPair } from '../actions/orders';
import { AppSuperVariables } from '../components/layouts/app';
import { Icon } from 'antd';

const basePair = (currentPair, balance) => {
  const coin = currentPair.split('/')[0].toLowerCase();

  const currency = balance.find(item => item.currency.toLowerCase() === coin);

  if (currency) {
    return {
      currency_name: capitalizeFirstLetter(currency.currency_name),
      currency_symbol: currency.currency_symbol,
      balance: currency.available_balance,
    };
  }

  return {
    currency_name: '',
    currency_symbol: '',
    balance: '',
  };
};

const targetPair = (currentPair, balance) => {
  const coin = currentPair.split('/')[1].toLowerCase();

  const currency = balance.find(item => item.currency.toLowerCase() === coin);

  if (currency) {
    return {
      currency_name: capitalizeFirstLetter(currency.currency_name),
      currency_symbol: currency.currency_symbol,
      balance: currency.available_balance,
      fiat: currency.currency_is_fiat,
    };
  }

  return {
    currency_name: '',
    currency_symbol: '',
    balance: '',
    fiat: '',
  };
};

class AsideTrade extends React.Component {
  constructor(props) {
    super(props);
    this.aside = React.createRef();

    this.state = {
      showCash: false,
      isFetching: true,
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.menu != nextState.menu) {
      this.props.context.closeAside();
    }
  }

  async componentDidUpdate() {
    this.props.context.asideIsOpened
      ? this.aside.current.classList.add('opened')
      : this.aside.current.classList.remove('opened');
  }

  render() {
    const { showCash, isFetching } = this.state;
    const {
      ticker,
      currentPair,
      myBalance: { balance },
    } = this.props;

    if (isFetching) {
      <div className="aside__base-div">
        <div className="loading-icon">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>;
    }

    return (
      <AppSuperVariables.Consumer>
        {context => (
          <aside className="aside" ref={this.aside}>
            <div className="close just_mobile">
              <Icon type="close" onClick={context.closeAside} />
            </div>
            <div
              className="closebox just_mobile"
              onClick={context.closeAside}
            />
            <header
              onClick={() => Router.push('/')}
              style={{ padding: '0.833rem' }}
              className="aside__header aside__container"
            >
              <img className="aside__logo" src={this.props.appConfig.logo}  />
            </header>
            {has(ticker, currentPair) && balance.length > 0 && (
              <React.Fragment>
                <section
                  onClick={() => this.setState({ showCash: !showCash })}
                  style={{ cursor: 'pointer' }}
                  className="aside__container aside__container--flex"
                >
                  <h2>{ticker[currentPair].pair}</h2>
                  <button className="aside__drop">
                    <img
                      src={
                        showCash
                          ? '/static/img/up-arrow.svg'
                          : '/static/img/down-arrow.svg'
                      }
                    />
                  </button>
                  <ul
                    className={`aside__overlay ${!showCash &&
                      'aside__overlay--hide'}`}
                  >
                    {this.props.pairs.map((item, index) => (
                      <li
                        data-tip={
                          item.active == 0
                            ? 'As negociações neste par estão desativadas temporariamente.'
                            : ''
                        }
                        key={index}
                        onClick={() => {
                          if (item.active == 1) {
                            this.setState({ showCash: false });
                            this.props.dispatch(changeCurrentPair(item.pair));
                            this.props.handleChangeGraph(item.pair);
                          }
                        }}
                        className={`aside__item aside__item--cursor aside__item--hover
                                             ${item && 'aside__item--hover'}`}
                      >
                        <p
                          className={`${item.active == 0 && 'par-disabled'}`}
                          style={{ textTransform: 'uppercase' }}
                        >
                          {item.pair}
                        </p>

                        <ReactTooltip
                          effect={'solid'}
                          place={'right'}
                          border={true}
                          className={'tooltip'}
                        />

                        {has(ticker, item.pair) && (
                          <p
                            className={`aside__right-txt aside__${
                              ticker[item.pair].var_type === 'up'
                                ? 'blue-txt'
                                : 'red-txt'
                            } ${!item && 'par-disabled'}`}
                          >
                            {ticker[item.pair].last
                              ? currencyFormatter.format(
                                  ticker[item.pair].last,
                                  {
                                    symbol: 'R$',
                                    format: '%s %v',
                                    decimal: ',',
                                    thousand: '.',
                                    precision: 2,
                                  }
                                )
                              : 'R$ 0,00'}
                            {ticker[item.pair].var_type && (
                              <img
                                src={
                                  ticker[item.pair].var_type === 'up'
                                    ? '/static/img/up-arrow_blue.svg'
                                    : '/static/img/down-arrow_red.svg'
                                }
                              />
                            )}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="aside__container">
                  <ul>
                    <li className="aside__item">
                      <p>ÚLTIMA NEG.</p>
                      <p className="aside__right-txt">
                        {ticker[currentPair].last
                          ? currencyFormatter.format(ticker[currentPair].last, {
                              symbol: 'R$',
                              format: '%s %v',
                              decimal: ',',
                              thousand: '.',
                              precision: 2,
                            })
                          : 'R$ 0,00'}
                      </p>
                    </li>
                    <li className="aside__item">
                      <p>VAR 24H</p>
                      <p
                        className={`aside__right-txt aside__${
                          ticker[currentPair].var_type === 'up' ? 'blue' : 'red'
                        }-txt`}
                      >
                        {ticker[currentPair].var_type && (
                          <img
                            src={
                              ticker[currentPair].var_type === 'up'
                                ? '/static/img/up-arrow_blue.svg'
                                : '/static/img/down-arrow_red.svg'
                            }
                          />
                        )}
                        {ticker[currentPair].var_24
                          ? currencyFormatter.format(
                              ticker[currentPair].var_24,
                              {
                                symbol: '%',
                                format: '%v%s',
                                decimal: ',',
                                thousand: '.',
                                precision: 2,
                              }
                            )
                          : '0,00%'}
                      </p>
                    </li>
                    <li className="aside__item">
                      <p>MÁXIMO</p>
                      <p className="aside__right-txt">
                        {ticker[currentPair].high
                          ? currencyFormatter.format(ticker[currentPair].high, {
                              symbol: 'R$',
                              format: '%s %v',
                              decimal: ',',
                              thousand: '.',
                              precision: 2,
                            })
                          : 'R$ 0,00'}
                      </p>
                    </li>
                    <li className="aside__item">
                      <p>MÍNIMO</p>
                      <p className="aside__right-txt">
                        {ticker[currentPair].low
                          ? currencyFormatter.format(ticker[currentPair].low, {
                              symbol: 'R$',
                              format: '%s %v',
                              decimal: ',',
                              thousand: '.',
                              precision: 2,
                            })
                          : 'R$ 0,00'}
                      </p>
                    </li>
                    <li className="aside__item">
                      <p>VOLUME</p>
                      <p className="aside__right-txt">
                        {currencyFormatter.format(
                          ticker[currentPair].volume || 0,
                          {
                            symbol: basePair(currentPair, balance)
                              .currency_symbol,
                            format: '%s %v',
                            decimal: ',',
                            thousand: '.',
                            precision: 8,
                          }
                        )}
                      </p>
                    </li>
                  </ul>
                </section>
                <section className="aside__container">
                  <h4>
                    <b>SALDO DISPONÍVEL</b>
                  </h4>
                  <ul className="aside__list">
                    <li className="aside__item aside__item--hover">
                      <p>{targetPair(currentPair, balance).currency_name}</p>
                      <p className="aside__right-txt">
                        {parseInt(targetPair(currentPair, balance).fiat) == 1
                          ? currencyFormatter.format(
                              targetPair(currentPair, balance).balance,
                              {
                                symbol: targetPair(currentPair, balance)
                                  .currency_symbol,
                                format: '%s %v',
                                decimal: ',',
                                thousand: '.',
                                precision: 2,
                              }
                            )
                          : currencyFormatter.format(
                              targetPair(currentPair, balance).balance,
                              {
                                symbol: targetPair(currentPair, balance)
                                  .currency_symbol,
                                format: '%s %v',
                                decimal: ',',
                                thousand: '.',
                                precision: 8,
                              }
                            )}
                      </p>
                    </li>
                    <li className="aside__item aside__item--hover">
                      <p>{basePair(currentPair, balance).currency_name}</p>
                      <p className="aside__right-txt">
                        {parseInt(basePair(currentPair, balance).fiat) == 1
                          ? currencyFormatter.format(
                              basePair(currentPair, balance).balance,
                              {
                                symbol: basePair(currentPair, balance)
                                  .currency_symbol,
                                format: '%s %v',
                                decimal: ',',
                                thousand: '.',
                                precision: 2,
                              }
                            )
                          : currencyFormatter.format(
                              basePair(currentPair, balance).balance,
                              {
                                symbol: basePair(currentPair, balance)
                                  .currency_symbol,
                                format: '%s %v',
                                decimal: ',',
                                thousand: '.',
                                precision: 8,
                              }
                            )}
                      </p>
                    </li>
                  </ul>
                </section>
              </React.Fragment>
            )}
          </aside>
        )}
      </AppSuperVariables.Consumer>
    );
  }
}

const mapStateToProps = state => ({
  ticker: state.orders.ticker,
  livroOrdens: state.orders.livroOrdens,
  currentPair: state.orders.currentPair,
  pairs: state.orders.pairs,
  myBalance: state.users.myBalance,
  appConfig: state.users.appConfig,
});
export default connect(mapStateToProps)(AsideTrade);
