import Router from 'next/router';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import { changeChatVisibility } from '../actions/users';

class AsideTrade extends React.Component {
  constructor(props) {
    super(props);
    this.aside = React.createRef();

    this.state = {
      value: '0.00',
      showCash: false,
      buy: true,
      orders: true,
      page: props.page,
    };
  }

  componentDidMount() {
    this.props.context.closeAside();
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
    const { page } = this.state;

    return (
      <aside className="aside" ref={this.aside}>
        <div className="close just_mobile">
          <Icon type="close" onClick={this.props.context.closeAside} />
        </div>
        <div
          className="closebox just_mobile"
          onClick={this.props.context.closeAside}
        />
        <header
          onClick={() => Router.push('/')}
          style={{ padding: '0.833rem' }}
          className="aside__header aside__container"
        >
          <img className="aside__logo" src={this.props.appConfig.logo}  />
        </header>
        <nav>
          <ul className="aside__list">
            <li
              className={`aside__item-menu ${page == 1 &&
                'aside__item-menu--selected'}`}
              onClick={() => Router.push('/perfil')}
            >
              MEU PERFIL
            </li>
            <li
              className={`aside__item-menu ${page == 20 &&
                'aside__item-menu--selected'}`}
              onClick={() => Router.push('/verificacao')}
            >
              VERIFICAÇÃO DE CONTA
            </li>
            <li
              className={`aside__item-menu ${page == 2 &&
                'aside__item-menu--selected'}`}
              onClick={() => Router.push('/limites-operacionais')}
            >
              LIMITES OPERACIONAIS
            </li>
            <li
              className={`aside__item-menu ${page == 3 &&
                'aside__item-menu--selected'}`}
              onClick={() => Router.push('/seguranca')}
            >
              SEGURANÇA
            </li>
            <li
              className={`aside__item-menu ${page == 4 &&
                'aside__item-menu--selected'}`}
              onClick={() => Router.push('/pagamento')}
            >
              MINHAS CONTAS BANCÁRIAS
            </li>
          </ul>
        </nav>
      </aside>
    );
  }
}
const mapStateToProps = ({ users }) => {
  const { appConfig } = users;
  return { appConfig };
};
export default connect(mapStateToProps)(AsideTrade);
