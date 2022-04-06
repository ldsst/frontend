import React from 'react';
import { Table, Select, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { capitalizeFirstLetter } from '../../utils/functions';
import moment from 'moment';
import currencyFormatter from 'currency-formatter';

const renderType = type => {
	if (type === 'withdraw') {
		return 'Retirada';
	}

	if (type === 'deposit') {
		return 'Depósito';
	}

	return '';
};

const blockExplorer = currency => {
	if (currency == 'BTC') {
		return 'https://blockchain.info/tx/';
	}
	if (currency == 'ETH') {
		return 'https://etherscan.io/tx/';
	}
	if (currency == 'LTC') {
		return 'https://insight.litecore.io/tx/';
	}
};

const renderDone = done => {
	if (done === 0) {
		return <span style={{ color: 'orange' }}>Pendente</span>;
	}

	if (done === 1) {
		return <span style={{ color: '#12AB68' }}>Confirmado</span>;
	}

	if (done === 2) {
		return <span style={{ color: 'red' }}>Negado</span>;
	}

	return '';
};

const Option = Select.Option;

class TableDepositsWithdraws extends React.Component {
	state = {
		pagination: {},
		myDeposits: [],
		filter: {},
	};

	rendeColumns = () => {
		return [
			{
				title: 'Estado',
				key: 'done',
				dataIndex: 'done',
				render: done => renderDone(done),
				width: '13%',
			},
			{
				title: 'Tipo',
				key: 'type',
				dataIndex: 'type',
				render: type => renderType(type),
				width: '10%',
			},
			{
				title: 'Moeda',
				dataIndex: 'currency',
				key: 'currency',
				render: currency => {
					const item = this.props.balance.find(
						item => item.currency.toLowerCase() === currency.toLowerCase()
					);

					return capitalizeFirstLetter(item ? item.currency_name : '');
				},
				width: '10%',
			},
			{
				title: 'Valor liquido',
				dataIndex: 'liquid_amount',
				key: 'liquid_amount',
				render: (liquid_amount, { currency }) => {
					const item = this.props.balance.find(
						item => item.currency.toLowerCase() === currency.toLowerCase()
					);

					return currencyFormatter.format(liquid_amount, {
						symbol: item ? item.currency_symbol : '',
						format: '%s %v',
						decimal: ',',
						thousand: '.',
						precision: currency === 'BRL' ? 2 : 8,
					});
				},
				sorter: (a, b) => a.liquid_amount - b.liquid_amount,
				width: '15%',
			},
			{
				title: 'Registrado em',
				dataIndex: 'time',
				key: 'time',
				sorter: (a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0),
				defaultSortOrder: 'descend',
				render: time => (time ? moment(time).format('DD/MM/YYYY HH:mm') : ''),
				width: '16%',
			},
			{
				title: 'Confirmado em',
				dataIndex: 'time_done',
				key: 'time_done',
				render: time_done =>
					time_done ? moment(time_done).format('DD/MM/YYYY HH:mm') : '-',
				width: '16%',
			},
			{
				title: 'Ações/Informações',
				dataIndex: 'identificator',
				key: 'identificator',
				render: (identificator, { done, receipt, type, currency }) => {
					if (
						done == '0' &&
						!receipt &&
						type == 'deposit' &&
						currency === 'BRL'
					) {
						return (
							<Button
								type="primary"
								style={{ background: '#00BE96', border: 'none' }}
								onClick={() =>
									this.props.handleOpenDepositReceipt(true, identificator)
								}
							>
								<Icon type="upload" /> Enviar comprovante
							</Button>
						);
					}
					if (done == '0' && receipt && type == 'deposit') {
						return (
							<span style={{ color: 'rgb(0,190,150)' }}>
								Aguardando liberação...
							</span>
						);
					}
					if (done == '0' && type == 'withdraw') {
						return (
							<span style={{ color: 'rgb(0,190,150)' }}>
								Aguardando execução...
							</span>
						);
					}
					if (done == '0' && type == 'deposit' && currency != 'BRL') {
						return (
							<span style={{ color: 'rgb(0,190,150)' }}>
								Aguardando confirmação...
							</span>
						);
					}
					return '-';
				},
				width: '30%',
			},
		];
	};

	handleChange = (value, name) => {
		const filter = { ...this.state.filter };
		filter[name] = value;

		const myDeposits = this.props.myDeposits.filter(item => {
			return Object.keys(filter).every(fil => {
				if (filter[fil] === 'all') {
					return true;
				}

				if (item[fil] == filter[fil]) {
					return true;
				}
			});
		});

		this.setState({ myDeposits, filter });
	};

	handleUpdateTable = async () => {
		await this.props.handleUpdateUserBalance(false);
		this.setState({
			myDeposits: JSON.parse(JSON.stringify(this.props.myDeposits)),
		});
	};

	componentDidMount() {
		this.setState({
			myDeposits: JSON.parse(JSON.stringify(this.props.myDeposits)),
		});

		setInterval(this.handleUpdateTable, 60000);
	}

	render() {
		return (
			<div className="dark-theme">
				<Select
					className="depositsWithdraws"
					defaultValue="all"
					style={{ width: 200 }}
					onChange={value => this.handleChange(value, 'currency')}
				>
					<Option value="all">Todas as moedas</Option>
					{this.props.balance.map((item, index) => (
						<Option value={item.currency} key={index}>
							{capitalizeFirstLetter(item.currency_name)}
						</Option>
					))}
				</Select>

				<Select
					defaultValue="all"
					style={{ width: 200 }}
					onChange={value => this.handleChange(value, 'type')}
				>
					<Option value="all">Todas as operações</Option>
					<Option value="withdraw">Retirada</Option>
					<Option value="deposit">Depósito</Option>
				</Select>

				<Select
					defaultValue="all"
					style={{ width: 200 }}
					onChange={value => this.handleChange(value, 'done')}
				>
					<Option value="all">Todas as situações</Option>
					<Option value="1">Confirmado</Option>
					<Option value="0">Pendente</Option>
				</Select>

				<Button
					// type="primary"
					// style={{
					// 	background: '#c7c7c9',
					// 	borderColor: 'rgba(255,255,255,0.1)',
					// }}
					className="ant-select-icon"
					onClick={() => this.props.handleUpdateUserBalance()}
				>
					<Icon type="sync" />
				</Button>

				<div className="font-lg">
					<Table
						columns={this.rendeColumns()}
						expandedRowRender={record => (
							<p style={{ margin: 0, lineHeight: '2' }}>
								<b style={{ fontWeight: '500' }}>Identificador:</b>{' '}
								{record.identificator}
								<br />
								{record.tx_hash && (
									<div>
										<b style={{ fontWeight: '500' }}>
											Transação na Blockchain:
										</b>{' '}
										<a
											href={`${blockExplorer(record.currency)}${
												record.tx_hash
											}`}
											target="_blank"
											style={{ color: '#0099ff' }}
										>
											{record.tx_hash.substr(0, 20)}... <Icon type="link" />
										</a>{' '}
									</div>
								)}
							</p>
						)}
						rowKey={record => record.identificator}
						dataSource={this.state.myDeposits}
						pagination={this.state.pagination}
						onChange={this.handleTableChange}
						locale={{ emptyText: 'Nenhum registro encontrado.' }}
					/>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const {
		myBalance: { balance = [] },
	} = state.users;
	return { balance };
};
export default connect(mapStateToProps)(TableDepositsWithdraws);
