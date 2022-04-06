import React from 'react';
import { Table, Select } from 'antd';
import { connect } from 'react-redux';
import { fetchLoginHistory } from '../../actions/users';
import moment from 'moment';
import Loader from '../Loader';

const columns = [
	{
		title: 'Data/hora',
		dataIndex: 'time',
		key: 'time',
		render: time => (time ? moment(time).format('DD/MM/YYYY HH:mm') : ''),
		sorter: (a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0),
		defaultSortOrder: 'descend',
		width: '25%',
	},
	{
		title: 'Sistema Operacional',
		key: 'os',
		dataIndex: 'os',
		width: '25%',
	},
	{
		title: 'Navegador',
		key: 'browser',
		dataIndex: 'browser',
		width: '25%',
	},
	{
		title: 'IP',
		key: 'user_ip',
		dataIndex: 'user_ip',
		width: '25%',
	},
];

class HistoryList extends React.Component {
	state = {
		pagination: {},
		loading: true,
	};

	async componentDidMount() {
		await this.props.dispatch(fetchLoginHistory());
		this.setState({ loading: false });
	}

	render() {
		return (
			<section style={{ marginTop: '2rem' , padding: '0'}}>
				<div className="page-title" style={{ marginBottom: '20px' }}>
					<h1 className="page-title__name">HISTÓRICO DE ACESSO</h1>
				</div>

				<div>
					{this.state.loading ? (
						<Loader />
					) : (
						<div className="dark-theme">
							<Table
								columns={columns}
								pagination={{ position: 'top' }}
								rowKey={record => record.identificator}
								dataSource={this.props.loginHistory}
								pagination={this.state.pagination}
								locale={{ emptyText: 'Nenhum registro encontrado.' }}
							/>
						</div>
					)}
				</div>
			</section>
		);
	}
}

const mapStateToProps = state => {
	const { loginHistory = [] } = state.users;
	return { loginHistory };
};
export default connect(mapStateToProps)(HistoryList);
