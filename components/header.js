import Link from 'next/link';
import { connect } from 'react-redux';
import {
  fetchMyBalance,
  logoutUser,
  fetchUserLimit,
  fetchSiteLoadSuccess,
} from '../actions/users';
import {
  fetchAvailablePairs,
  changeCurrentPair,
  dispatchTicker,
  fetchOrderLimits,
  dispatchTrades,
} from '../actions/orders';
import {
  setLivroOrdens,
  acumularOrdens,
  updateOrderBook,
  deleteOrder,
  placeNewOrder,
} from '../actions';
import socket from '../utils/socketConnection';
import { message } from 'antd';
import { AppSuperVariables } from '../components/layouts/app';
import { Icon } from 'antd';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.nav = React.createRef();
    this.hoverBox = React.createRef();

    this.state = {
      menu: this.props.page || 1,
      classSelected: 'header__button--select',
    };
  }

  async componentDidMount() {
    this.hoverOutLink();

    message.config({
      top: 10,
      duration: 3,
      maxCount: 2,
    });

    await this.props.dispatch(fetchAvailablePairs());
    await this.props.dispatch(fetchMyBalance());
    await this.props.dispatch(fetchUserLimit());
    await this.props.dispatch(fetchOrderLimits());
    this.setState({ isFetching: false });

    if (this.props.pairs.length > 0 && !this.props.isSiteLoaded) {
      this.props.pairs.map((item, index) => {
        const pair = item.pair;

        if (index === 0) {
          const newPair = localStorage.getItem('currentPair')
            ? localStorage.getItem('currentPair')
            : pair;
          this.props.dispatch(changeCurrentPair(newPair));
        }

        socket.emit(
          'order_book',
          {
            pair,
            token: localStorage.getItem('auth_token'),
          },
          async data => {
            await this.props.dispatch(setLivroOrdens(data));
            this.props.dispatch(acumularOrdens(pair));
          }
        );

        socket.emit(
          'ticker',
          {
            pair,
            token: localStorage.getItem('auth_token'),
          },
          async data => {
            await this.props.dispatch(dispatchTicker(data));
          }
        );

        socket.emit(
          'trades',
          {
            pair,
            token: localStorage.getItem('auth_token'),
          },
          async data => {
            await this.props.dispatch(dispatchTrades(data));
          }
        );
      });
    }

    this.props.dispatch(fetchSiteLoadSuccess(true));

    setInterval(() => {
      socket.emit('get-all-info');
    }, 5000);

    socket.on('ticker', async data => {
      await this.props.dispatch(dispatchTicker(data));
    });

    socket.on('trades', async data => {
      await this.props.dispatch(dispatchTrades(data));
    });

    socket.on('order_book', async ({ response, pair }) => {
      await this.props.dispatch(setLivroOrdens(response));
      this.props.dispatch(acumularOrdens(pair));
    });
    socket.on('update_admin_order', async (data) => {
      await this.props.dispatch(setLivroOrdens(data));
      this.props.dispatch(acumularOrdens(data['BTC/BRL']));
    });

    socket.on('update_order_book', ({ ordersExecuted }) => {
      this.props.dispatch(updateOrderBook(ordersExecuted));
    });

    socket.on('place_new_order', ({ newOrder }) => {
      this.props.dispatch(placeNewOrder(newOrder));
    });

    socket.on('order_delete_from_book', ({ orderDeleted }) => {
      this.props.dispatch(deleteOrder(orderDeleted));
    });

    socket.on(`order_execution_${this.props.userProfile.uid}`, async data => {
      if (data.success) {
        message.success(data.message);
        await this.props.dispatch(fetchMyBalance());
      }
    });
  }

  hoverLink = e => {
    this.setState({ classSelected: 'header__button' });
    this.hoverBox.current.classList.remove('__hide');
    this.hoverBox.current.style.left = e.target.offsetLeft + 'px';
    this.hoverBox.current.style.top =
      e.target.offsetTop + e.target.offsetHeight - 3 + 'px';
    this.hoverBox.current.style.width = e.target.offsetWidth + 'px';
  };

  hoverOutLink = () => {
    this.setState({ classSelected: 'header__button--select' });

    if ([6, 1, 2, 3, 10, 4, 8].includes(parseInt(this.state.menu))) {
      this.hoverBox.current.classList.remove('__hide');
      let elem = document.getElementById('nav_link_' + this.state.menu);
      this.hoverBox.current.style.left = elem.offsetLeft + 'px';
      this.hoverBox.current.style.top =
        elem.offsetTop + elem.offsetHeight - 3 + 'px';
      this.hoverBox.current.style.width = elem.offsetWidth + 'px';
    } else {
      this.hoverBox.current.classList.add('__hide');
    }
  };

  componentWillUpdate(nextProps, nextState) {
    if (this.state.menu != nextState.menu) {
      this.props.context.closeNav();
    }
  }

  async componentDidUpdate() {
    this.props.context.navIsOpened
      ? this.nav.current.classList.add('opened')
      : this.nav.current.classList.remove('opened');
  }

  render() {
    const { menu } = this.state;
    socket.on('order_book', async ({ response, pair }) => {
      await this.props.dispatch(setLivroOrdens(response));
      this.props.dispatch(acumularOrdens(pair));
    });
    return (
      <AppSuperVariables.Consumer>
        {context => (
          <header className="header">
            <div className="mobile_menu just_mobile">
              <button id="mobile_left_menu_bt" onClick={context.toggleAside}>
                <img src="/static/img/left-light.svg" />
              </button>
              <button
                id="mobile_centered_logo"
                onClick={() => Router.push('/')}
              >
                <img src={this.props.appConfig.logo}  />
              </button>
              <button id="mobile_right_menu_bt" onClick={context.toggleNav}>
                <img src="/static/img/right-light.svg" />
              </button>
            </div>
            <nav ref={this.nav}>
              <div className="close just_mobile">
                <Icon type="close" onClick={context.closeNav} />
              </div>
              <div
                className="closebox just_mobile"
                onClick={context.closeNav}
              />
              <div className="hoverbox __hide" ref={this.hoverBox} />
              <Link prefetch href="/">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_6"
                  onClick={() => this.setState({ menu: 6 })}
                  className={`header__button ${menu == 6 &&
                    this.state.classSelected}`}
                >
                  COMPRA/VENDA SIMPLES
                </a>
              </Link>
              <Link prefetch href="/carteira">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_2"
                  onClick={() => this.setState({ menu: 2 })}
                  className={`header__button ${menu == 2 &&
                    this.state.classSelected}`}
                >
                  MEUS SALDOS
                </a>
              </Link>
              <Link prefetch href="/graficos">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_3"
                  onClick={() => this.setState({ menu: 3 })}
                  className={`header__button ${menu == 3 &&
                    this.state.classSelected}`}
                >
                  GRÁFICOS
                </a>
              </Link>
              <Link prefetch href="/minhas-ordens">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_10"
                  onClick={() => this.setState({ menu: 10 })}
                  className={`header__button ${menu == 10 &&
                    this.state.classSelected}`}
                >
                  MINHAS ORDENS
                </a>
              </Link>
              <Link prefetch href="/extratos">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_4"
                  onClick={() => this.setState({ menu: 4 })}
                  className={`header__button ${menu == 4 &&
                    this.state.classSelected}`}
                >
                  EXTRATO
                </a>
              </Link>
              <Link prefetch href="/perfil">
                <a
                  onMouseOver={this.hoverLink}
                  onMouseOut={this.hoverOutLink}
                  id="nav_link_8"
                  onClick={() => this.setState({ menu: 8 })}
                  className={`header__button ${menu == 8 &&
                    this.state.classSelected}`}
                >
                  {Object.keys(this.props.userProfile).length > 0 &&
                    this.props.userProfile.name.split(' ')[0]}
                </a>
              </Link>
              <a
                onMouseOver={this.hoverLink}
                onMouseOut={this.hoverOutLink}
                onClick={() => this.props.dispatch(logoutUser())}
                className="header__button"
              >
                LOGOUT &nbsp;
                <Icon type="export" />
              </a>
            </nav>
          </header>
        )}
      </AppSuperVariables.Consumer>
    );
  }
}

const mapStateToProps = state => {
  const { pairs, ticker } = state.orders;
  const { userProfile, appConfig, isSiteLoaded } = state.users;
  return { pairs, ticker, userProfile, appConfig, isSiteLoaded };
};
export default connect(mapStateToProps)(Header);
