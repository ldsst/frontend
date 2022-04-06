import { connect } from 'react-redux';
import { fetchAllBankAccounts } from '../../actions/bank';
import { Spin } from 'antd';

const banksImg = (bank) => {
    switch (bank) {
        case 1:
            return "/static/img/banco-do-brasil.svg";
        case 33:
            return "/static/img/santander-logo.svg";
        default:
            return "/static/img/bank.svg";
    }
};

class PagamentoLista extends React.Component {
    state = {
        isFetching: true,
    }

    async componentDidMount() {
        await this.props.dispatch(fetchAllBankAccounts());
        this.setState({ isFetching: false })

    }

    render() {
        if (this.state.isFetching) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <div className="loading-icon"><div></div><div></div><div></div><div></div></div>
                </div>
            )
        }

        return (
            <div>
                <ul className="pagamento__list">
                    {this.props.bankAccounts.length > 0 &&
                        this.props.bankAccounts.map((p) =>
                            <li
                                key={p.bank}
                                onClick={() => this.props.handleOpenModal(true, p, "editar")}
                                className={'pagamento__item'}>
                                <h3 className="pagamento__name">{p.bank_name}</h3>

                                <div className="pagamento__infos">
                                    <div
                                        style={{ background: `url(${banksImg(p.bank)})`, backgroundSize: '60px 60px' }}
                                        className="pagamento__image"></div>
                                    <div className="pagamento__account">
                                        <p><strong>Agência</strong> {p.agency}</p>
                                        <p><strong>Conta</strong> {p.account_number}</p>
                                    </div>
                                </div>
                            </li>
                        )
                    }

                    <li
                        onClick={() => this.props.handleOpenModal(true, null, "novo")}
                        className="pagamento__item pagamento__item-add">
                        <img src="/static/img/plus.svg" />
                    </li>
                </ul>
            </div>
        );
    }
};

const mapStateToProps = (state) => {
    const { bankAccounts } = state.bank;
    return { bankAccounts };
}
export default connect(mapStateToProps)(PagamentoLista);
