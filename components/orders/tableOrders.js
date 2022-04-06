import React from 'react';
import { Table, Select } from 'antd';
import { connect } from 'react-redux';
import { fetchAllOrders } from '../../actions/orders';
import { shouldUpdateMyOrders } from '../../actions';
import moment from 'moment';
import { ordersState } from '../../utils/functions';
import currencyFormatter from 'currency-formatter';
import Loader from '../Loader';

const Option = Select.Option;

class TableOrders extends React.Component {
  state = {
    pagination: {},
    loading: true,
    filter: {},
    minhasOrdens: [],
  };

  handleChange = (value, name) => {
    const filter = { ...this.state.filter };
    filter[name] = value;

    const minhasOrdens = this.props.minhasOrdens.filter(item => {
      return Object.keys(filter).every(fil => {
        if (filter[fil] === 'all') {
          return true;
        }

        if (item[fil] == filter[fil]) {
          return true;
        }
      });
    });

    this.setState({ minhasOrdens, filter });
  };
  // @todo find a way to this function work
  formatValue = async (value, pair, coinPosition = 0) => {
    if (!pair) {
      return value;
    }
    const item = this.props.balance.find(
      item => item.currency === pair.split('/')[coinPosition],
    );
    let cur = '';
    let rounded = '0';
    if (item) {
      cur = item.currency_symbol;
      rounded = item.currency_is_fiat;
    }
    const format = currencyFormatter.format(value, {
      symbol: cur,
      format: '%s %v',
      decimal: ',',
      thousand: '.',
      precision: rounded === '1' ? 2 : 8,
    });
    return format;
  };
  columns = () => [
    {
      title: 'Tipo',
      dataIndex: 'side',
      key: 'side',
      width: '10%',
      render: side => {
        if (side == 'buy') {
          return (
            <span className="buy-text">
              {side.replace('buy', 'Compra').replace('sell', 'Venda')}
            </span>
          );
        } else {
          return (
            <span className="sell-text">
              {side.replace('buy', 'Compra').replace('sell', 'Venda')}
            </span>
          );
        }
      },
    },
    {
      title: 'Quantidade',
      dataIndex: 'initial_amount',
      key: 'initial_amount',
      width: '13%',
      render: (initial_amount, { pair }) => {
        if (!pair) {
          return initial_amount;
        }
        const item = this.props.balance.find(
          item => item.currency === pair.split('/')[0],
        );
        let cur = '';
        let rounded = '0';
        if (item) {
          cur = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }

        return currencyFormatter.format(initial_amount, {
          symbol: cur,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded === '1' ? 2 : 8,
        });
      },
    },
    {
      title: 'Preço Unitário',
      dataIndex: 'price_unity',
      key: 'price_unity',
      render: (price_unity, { pair }) => {
        return currencyFormatter.format(price_unity, {
          symbol: 'R$',
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: 2,
        });
      },
      width: '15%',
    },
    {
      title: 'Total Executado',
      dataIndex: '',
      key: 'total_executed',
      render: ({ initial_amount = 0, avaliable_amount = 0, pair }) => {
        if (!pair) {
          return initial_amount - avaliable_amount;
        }
        const item = this.props.balance.find(
          item => item.currency === pair.split('/')[0],
        );
        let cur = '';
        let rounded = '0';
        if (item) {
          cur = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }

        return currencyFormatter.format(initial_amount - avaliable_amount, {
          symbol: cur,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded === '1' ? 2 : 8,
        });
      },
      width: '13%',
    },
    {
      title: 'Total Executado',
      dataIndex: '',
      key: 'total_executed2',
      render: ({ total_executed, pair }) => {
        if (!pair) {
          return 0;
        }

        const item = this.props.balance.find(
          item => item.currency === pair.split('/')[1],
        );
        let currency_symbol = '';
        let rounded = '0';
        if (item) {
          currency_symbol = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }
        return currencyFormatter.format(total_executed, {
          symbol: currency_symbol,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded === '1' ? 2 : 8,
        });
      },
      width: '13%',
    },
    {
      title: 'Restante',
      dataIndex: 'avaliable_amount',
      key: 'avaliable_amount',
      width: '15%',
      render: (avaliable_amount, { pair }) => {
        if (!pair) {
          return avaliable_amount;
        }
        const item = this.props.balance.find(
          item => item.currency === pair.split('/')[0],
        );
        let cur = '';
        let rounded = '0';
        if (item) {
          cur = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }

        return currencyFormatter.format(avaliable_amount, {
          symbol: cur,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded === '1' ? 2 : 8,
        });
      },
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      render: state => ordersState(state),
      key: 'state',
      width: '20%',
    },
    {
      title: 'Data/Hora',
      dataIndex: 'time',
      key: 'time',
      width: '20%',
      sorter: (a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0),
      defaultSortOrder: 'descend',
      render: time => `${moment(time).format('DD/MM/YYYY HH:mm')}`,
    },
    {
      title: 'Ações',
      dataIndex: 'identificator',
      key: 'identificator',
      render: (identificator, { ...rest }) => {
        if (rest.state === 'pending' || rest.state === 'executed_partially') {
          const order = {
            ...rest,
            orderIdentificator: rest.identificator,
            amount: parseFloat(rest.initial_amount),
            price: parseFloat(rest.price_unity),
          };
          return (
            <a
              href="javascript:void(0)"
              onClick={() => this.props.handleOpenDeleteModal(true, order)}
            >
              Deletar
            </a>
          );
        } else {
          return null;
        }
      },
      width: '30%',
    },
  ];

  columnsSecondTable = () => [{
    title: 'Executada em',
    dataIndex: 'time_executed',
    key: 'time_executed',
    width: '20%',
    sorter: (a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0),
    defaultSortOrder: 'descend',
    render: time_executed => `${moment(time_executed).format('DD/MM/YYYY HH:mm')}`,
  }, {
    title: 'Quantidade',
    dataIndex: 'amount_executed',
    key: 'amount_executed',
    width: '13%',
    render: (amount_executed, { pair }) => {
      if (!pair) {
        return amount_executed;
      }
      const item = this.props.balance.find(
        item => item.currency === pair.split('/')[0],
      );
      let cur = '';
      let rounded = '0';
      if (item) {
        cur = item.currency_symbol;
        rounded = item.currency_is_fiat;
      }

      return currencyFormatter.format(amount_executed, {
        symbol: cur,
        format: '%s %v',
        decimal: ',',
        thousand: '.',
        precision: rounded === '1' ? 2 : 8,
      });
    },
  }, {
    title: 'Preço Unitário',
    dataIndex: 'price_unity',
    key: 'price_unity',
    width: '13%',
    render: (price_unity, { pair }) => {
      if (!pair) {
        return price_unity;
      }
      const item = this.props.balance.find(
        item => item.currency === pair.split('/')[1],
      );
      let cur = '';
      let rounded = '0';
      if (item) {
        cur = item.currency_symbol;
        rounded = item.currency_is_fiat;
      }

      return currencyFormatter.format(price_unity, {
        symbol: cur,
        format: '%s %v',
        decimal: ',',
        thousand: '.',
        precision: rounded === '1' ? 2 : 8,
      });
    },
  }, {
    title: 'Valor Total',
    dataIndex: 'total',
    key: 'total',
    width: '13%',
    render: (total, { pair }) => {
      if (!pair) {
        return total;
      }
      const item = this.props.balance.find(
        item => item.currency === pair.split('/')[1],
      );
      let cur = '';
      let rounded = '0';
      if (item) {
        cur = item.currency_symbol;
        rounded = item.currency_is_fiat;
      }

      return currencyFormatter.format(total, {
        symbol: cur,
        format: '%s %v',
        decimal: ',',
        thousand: '.',
        precision: rounded === '1' ? 2 : 8,
      });
    },
  }, {
    title: '%',
    dataIndex: 'percentage',
    key: 'percentage',
    width: '13%',
    render: (percentage) => `${percentage}%`,
  },
  ];


  expandedRowRender = (record) => (
      <div>
        <div style={{"padding-top":"3em","padding-bottom":"3em"}}>
            <span className={record.side === 'buy' ? 'buy-text' : 'sell-text'} style={{"font-size":"2em"}}>ORDEM DE {record.side === 'buy' ? 'COMPRA' : 'VENDA'}</span>
            <span style={{float:"right","font-size":"2em"}}><b>Identificador:</b> {record.identificator}</span>
        </div>
        
        <Table
          columns={this.columnsSecondTable()}
          rowKey={record => record.identificator}
          dataSource={record.executed_orders || []}
          locale={{ emptyText: 'Nenhum registro encontrado.' }}
        />
      </div>
  );

  async componentDidMount() {
    await this.props.dispatch(fetchAllOrders());
    if (this.props.minhasOrdens) {
      this.setState({
        loading: false,
        minhasOrdens: JSON.parse(JSON.stringify(this.props.minhasOrdens)),
      });
    } else {
      this.setState({
        loading: false,
        minhasOrdens: [],
      });
    }
  }

  componentDidUpdate() {
    if (this.props.updateMyOrders) {
      this.setState({
        loading: false,
        minhasOrdens: JSON.parse(JSON.stringify(this.props.minhasOrdens)),
      });

      this.props.dispatch(shouldUpdateMyOrders());
    }
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <Loader/>
        ) : (
          <div className="dark-theme">
            <Select
              value={this.state.filter.pair || 'BTC/BRL'}
              style={{ width: 120 }}
              onChange={value => this.handleChange(value, 'pair')}
            >
              {this.props.pairs.length > 0 &&
              this.props.pairs.map((pair, index) => (
                <Option key={index} value={pair.pair}>
                  {pair.target_currency}/{pair.base_currency}
                </Option>
              ))}
            </Select>

            <Select
              value={this.state.filter.side || 'all'}
              style={{ width: 120 }}
              onChange={value => this.handleChange(value, 'side')}
            >
              <Option value="all">Todos</Option>
              <Option value="buy">Compra</Option>
              <Option value="sell">Venda</Option>
            </Select>

            <Select
              value={this.state.filter.state || 'all'}
              style={{ width: 220 }}
              onChange={value => this.handleChange(value, 'state')}
            >
              <Option value="all">Todos</Option>
              <Option value="executed_int">Executado Totalmente</Option>
              <Option value="executed_partially">Executado Parcialmente</Option>
              <Option value="pending">Não executado (pendente)</Option>
              <Option value="deleted">Cancelado</Option>
            </Select>

            <Table
              columns={this.columns()}
              pagination={{ position: 'top' }}
              expandedRowRender={this.expandedRowRender}
              rowKey={record => record.identificator}
              dataSource={this.state.minhasOrdens || []}
              onChange={this.handleTableChange}
              locale={{ emptyText: 'Nenhum registro encontrado.' }}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { minhasOrdens, updateMyOrders, pairs } = state.orders;
  const {
    myBalance: { balance = [] },
  } = state.users;
  return { minhasOrdens, balance, updateMyOrders, pairs };
};
export default connect(mapStateToProps)(TableOrders);
