import React from 'react';
import { Table, Select } from 'antd';
import { connect } from 'react-redux';
import { fetchUserExtract, fetchMyBalance } from '../../actions/users';
import { capitalizeFirstLetter } from '../../utils/functions';
import moment from 'moment';
import currencyFormatter from 'currency-formatter';
import Loader from '../Loader';

const Option = Select.Option;

class ExtratosTable extends React.Component {
  state = {
    loading: true,
    userExtract: [],
    filter: {},
    pagination: {"pageSize":50}
  };
  getCategory = (type) => {
      switch(type){
        case "migration database":
          return "Início do saldo";
        case "automatic deposit confirmation":
          return "Depósito confirmado";
        case "deposit_done":
          return "Depósito confirmado";
          // this need to check!
        case "deposit":
          return "Depósito confirmado";
        case "order_created_buy":
          return "Envio de ordem de compra";
        case "order_created_sell":
          return "Envio de ordem de venda";
        case "order_execution_sell":
          return "Execução de ordem de venda";
        case "order_execution_buy":
          return "Execução de ordem de compra";
        case "order_execution_sell_fee":
          return "Comissão sobre execução de ordem de venda";
        case "order_execution_buy_fee":
          return "Comissão sobre execução de ordem de compra";
        case "withdraw_created":
          return "Retirada de fundos";
        case "withdraw_fee":
          return "Comissão sobre retirada de fundos";
        default:
          return type
      }
  };
  handleChange = (value, name) => {
    const filter = { ...this.state.filter };
    filter[name] = value;
    const userExtract = this.props.userExtract.filter(item => {
      return Object.keys(filter).every(fil => {
        if(Array.isArray(filter[fil])){
          if (filter[fil].includes('all')) {
            return true;
          }

          if (filter[fil].includes(item[fil])) {
            return true;
          }
        }
      });
    });

    this.setState({ userExtract, filter });
  };

  columns = () => [
    {
      title: 'Data',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0),
      defaultSortOrder: 'descend',
      render: time => (time ? moment(time).format('DD/MM/YYYY HH:mm') : ''),
      width: '25%',
    },
    {
      title: 'Moeda',
      dataIndex: 'currency',
      key: 'currency',
      render: currency => {
        const item = this.props.balance.find(
          item => item.currency === currency.toUpperCase(),
        );
        if (item) {
          return capitalizeFirstLetter(item.currency_name);
        }

        return '';
      },
      width: '25%',
    },
    {
      title: 'Categoria',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        return this.getCategory(type);
      },
      width: '25%',
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, { currency }) => {
        const item = this.props.balance.find(
          item => item.currency.toUpperCase() === currency.toUpperCase(),
        );
        let cur = '';
        let rounded = '0';
        if (item) {
          cur = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }

        const value = currencyFormatter.format(amount, {
          symbol: cur,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded=== "1" ? 2 : 8,
        });

        if (amount < 0) {
          return <span className="sell-text">{value}</span>;
        }
        return <span className="buy-text">{value}</span>;
      },
      sorter: (a, b) => a.amount - b.amount,
      width: '20%',
    },
    {
      title: 'Saldo Após',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (balanceAfter, { currency }) => {
        const item = this.props.balance.find(
          item => item.currency.toUpperCase() === currency.toUpperCase(),
        );
        let cur = '';
        let rounded = '0';
        if (item) {
          cur = item.currency_symbol;
          rounded = item.currency_is_fiat;
        }
        return currencyFormatter.format(balanceAfter, {
          symbol: cur,
          format: '%s %v',
          decimal: ',',
          thousand: '.',
          precision: rounded === "1" ? 2 : 8,
        });
      },
      width: '15%',
    },
  ];

  async componentDidMount() {
    await this.props.dispatch(fetchMyBalance());
    await this.props.dispatch(fetchUserExtract());
    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const timeA = a.time;
      const timeB = b.time;

      let comparison = 0;
      if (timeA > timeB) {
        comparison = 1;
      } else if (timeA < timeB) {
        comparison = -1;
      }
      return comparison;
    }
    this.props.userExtract.sort(compare);
    this.setState({
      loading: false,
      userExtract: JSON.parse(JSON.stringify(this.props.userExtract)),
    });
  }

  render() {
    return (
      <div style={{ padding: '20px 32px' }}>
        {this.state.loading ? (
          <Loader/>
        ) : (
          <div className="dark-theme">
            <Select
              className="select-extrato"
              defaultValue="all"
              mode="multiple"
              style={{ width: 270 }}
              onChange={value => this.handleChange(value, 'type')}
            >
              <Option value="all">Todos</Option>
              <Option value="order_execution_buy">Compra</Option>
              <Option value="order_execution_sell">Venda</Option>
              <Option value="order_execution_sell_fee">Comissão sobre venda</Option>
              <Option value="order_execution_buy_fee">Comissão sobre compra</Option>
              <Option value="deposit">Depósito/Recebimento</Option>
              <Option value="deposit_fee">Comissão sobre depósito</Option>
              <Option value="withdraw_created">Saque/Transferência</Option>
              <Option value="withdraw_fee">Comissão sobre retirada</Option>
            </Select>

            <Select
              defaultValue="all"
              mode="multiple"
              style={{ width: 220 }}
              onChange={value => this.handleChange(value, 'currency')}
            >
              <Option value="all">Todas as moedas</Option>
              {this.props.balance.length > 0 &&
              this.props.balance.map((item, index) => (
                <Option key={index} value={item.currency}>
                  {capitalizeFirstLetter(item.currency_name)}
                </Option>
              ))}
            </Select>

            <Table
              columns={this.columns()}
              rowKey={(record, index) => index}
              pagination={this.state.pagination}
              dataSource={
                this.props.balance.length === 0
                  ? []
                  : this.state.userExtract || []
              }
              locale={{ emptyText: 'Nenhum registro encontrado.' }}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    userExtract,
    myBalance: { balance = [] },
  } = state.users;
  return { userExtract, balance };
};
export default connect(mapStateToProps)(ExtratosTable);
