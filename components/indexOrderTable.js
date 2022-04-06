import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import math from 'mathjs';
import { Icon } from 'antd';
import has from 'lodash/has';
import currencyFormatter from 'currency-formatter';

import { updateBoxTrades } from '../actions/orders';

class IndexOrderTable extends React.Component {
  state = {
    isAcumulado: false,
    isMyBuyOrder: false,
    isMySellOrder: false,
  };

  trTableOrder = ({
    user_id,
    amount,
    price,
    orderIdentificator,
    currencySymbol,
    pair,
    side,
    total,
  }) => {
    const userId = this.props.userProfile.uid ? this.props.userProfile.uid : 0;
    const isMyOrder = user_id === userId;
    const order = {
      amount,
      price,
      orderIdentificator,
      currencySymbol,
      pair,
      side,
    };
    return (
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() =>
          this.props.dispatch(updateBoxTrades({ update: true, values: order }))
        }
      >
        <td>
          {!this.state.isAcumulado && isMyOrder && (
            <a
              style={{ cursor: 'pointer' }}
              onClick={() => this.props.handleOpenDeleteModal(true, order)}
            >
              <Icon
                type="delete"
                style={{
                  position: 'absolute',
                  color: '#ff6060',
                  left: '0.3rem',
                  marginTop: '0.1rem',
                }}
              />
            </a>
          )}{' '}
          {currencyFormatter.format(total, {
            symbol: 'R$',
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 2,
          })}
        </td>
        <td className="table-main__azul">
          {currencyFormatter.format(price, {
            symbol: 'R$',
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 2,
          })}
        </td>
        <td>
          {currencyFormatter.format(amount, {
            symbol: currencySymbol,
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 8,
          })}
        </td>
      </tr>
    );
  };

  trTableOrder2 = ({
    amount,
    user_id,
    price,
    orderIdentificator,
    currencySymbol,
    pair,
    side,
    total,
  }) => {
    const userId = this.props.userProfile.uid ? this.props.userProfile.uid : 0;
    const isMyOrder = user_id === userId;
    const order = {
      amount,
      price,
      orderIdentificator,
      currencySymbol,
      pair,
      side,
    };
    return (
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() =>
          this.props.dispatch(updateBoxTrades({ update: true, values: order }))
        }
      >
        <td>
          {currencyFormatter.format(parseFloat(amount), {
            symbol: currencySymbol,
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 8,
          })}
        </td>
        <td className="table-main__red">
          {currencyFormatter.format(price, {
            symbol: 'R$',
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 2,
          })}
        </td>
        <td>
          {currencyFormatter.format(total, {
            symbol: 'R$',
            format: '%s %v',
            decimal: ',',
            thousand: '.',
            precision: 2,
          })}{' '}
          {!this.state.isAcumulado && isMyOrder && (
            <a
              style={{ cursor: 'pointer' }}
              onClick={() => this.props.handleOpenDeleteModal(true, order)}
            >
              <Icon
                type="delete"
                style={{
                  position: 'absolute',
                  color: '#ff6060',
                  right: '0.3rem',
                  marginTop: '0.1rem',
                }}
              />
            </a>
          )}{' '}
        </td>
      </tr>
    );
  };

  render() {
    const { currentPair, currencySymbol } = this.props;
    const { isAcumulado, isMySellOrder, isMyBuyOrder } = this.state;
    const userId = this.props.userProfile.uid ? this.props.userProfile.uid : 0;

    const livroOrdens = this.state.isAcumulado
      ? this.props.livroOrdensAcumulado
      : this.props.livroOrdens;

    const ordersSell =
      Object.keys(livroOrdens).length > 0 &&
      has(livroOrdens[currentPair], 'orderBook')
        ? livroOrdens[currentPair].orderBook
            .filter(item => item.side === 'sell')
            .slice(0, 50)
        : [];

    const myOrdersSell =
      Object.keys(livroOrdens).length > 0 &&
      has(livroOrdens[currentPair], 'orderBook')
        ? livroOrdens[currentPair].orderBook.filter(
            item => item.side === 'sell' && item.user_id === userId
          )
        : [];

    const ordersSellMap = isMySellOrder ? myOrdersSell : ordersSell;

    const ordersBuy =
      Object.keys(livroOrdens).length > 0 &&
      has(livroOrdens[currentPair], 'orderBook')
        ? livroOrdens[currentPair].orderBook
            .filter(item => item.side === 'buy')
            .slice(0, 50)
        : [];

    const myOrdersBuy =
      Object.keys(livroOrdens).length > 0 &&
      has(livroOrdens[currentPair], 'orderBook')
        ? livroOrdens[currentPair].orderBook.filter(
            item => item.side === 'buy' && item.user_id === userId
          )
        : [];

    const ordersBuyMap = isMyBuyOrder ? myOrdersBuy : ordersBuy;

    return (
      <div className="table-main--order">
        <h3 className="table-main__caption">LIVRO DE ORDENS</h3>
        <div className="table-main__buttons">
          <button
            onClick={() => this.setState({ isMyBuyOrder: !isMyBuyOrder })}
            className={`table-main__cap-button ${isMyBuyOrder &&
              'table-main__cap-button--selected'}`}
          >
            MINHAS ORDENS DE COMPRA
          </button>
          <button
            onClick={() => this.setState({ isMySellOrder: !isMySellOrder })}
            className={`table-main__cap-button ${isMySellOrder &&
              'table-main__cap-button--selected'}`}
          >
            MINHA ORDENS DE VENDA
          </button>
          <button
            onClick={() => this.setState({ isAcumulado: !isAcumulado })}
            className={`table-main__cap-button ${isAcumulado &&
              'table-main__cap-button--selected'}`}
          >
            ACUMULADO
          </button>
        </div>
        <div className="table-main" style={{ display: 'flex' }}>
          <table className="table-main__inside table-main__inside--border">
            <thead>
              <tr className="table-main__tr">
                <th className="middle">Valor Total</th>
                <th>Preço Unitário</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <ReactCSSTransitionGroup
              component="tbody"
              transitionName="blink"
              transitionEnter={!this.props.initialMount}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {ordersBuyMap
                .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
                .map(info => (
                  <React.Fragment key={info.orderIdentificator}>
                    {this.trTableOrder({
                      currencySymbol,
                      ...info,
                    })}
                  </React.Fragment>
                ))}
            </ReactCSSTransitionGroup>
          </table>

          <table className="table-main__inside table-main__inside--border">
            <thead>
              <tr className="table-main__tr">
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <ReactCSSTransitionGroup
              component="tbody"
              transitionName="blink"
              transitionEnter={!this.props.initialMount}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {ordersSellMap
                .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                .map(info => (
                  <React.Fragment key={info.orderIdentificator}>
                    {this.trTableOrder2({
                      currencySymbol,
                      ...info,
                    })}
                  </React.Fragment>
                ))}
            </ReactCSSTransitionGroup>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ users, orders }) => {
  const { userProfile } = users;
  const { livroOrdens, livroOrdensAcumulado, currentPair } = orders;
  return { userProfile, livroOrdens, livroOrdensAcumulado, currentPair };
};
export default connect(mapStateToProps)(IndexOrderTable);
