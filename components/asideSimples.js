import Router from 'next/router';
import { connect } from 'react-redux';
import currencyFormatter from 'currency-formatter';
import { Icon } from 'antd';
import { capitalizeFirstLetter } from '../utils/functions';

class AsideSimples extends React.Component {
  constructor(props) {
    super(props);
    this.aside = React.createRef();

    this.state = {
      showCash: false,
      isFetching: true,
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
    const { isFetching } = this.state;
    const {
      myBalance: { balance = [] },
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
        {balance.length > 0 && (
          <React.Fragment>
            <section className="aside__container">
              <h4>
                <b>SALDO DISPONÍVEL</b>
              </h4>
              <ul className="aside__list">
                {balance.map((item, index) => (
                  <li key={index} className="aside__item aside__item--hover">
                    <p>{capitalizeFirstLetter(item.currency_name)}</p>
                    <p className="aside__right-txt">
                      {currencyFormatter.format(item.available_balance, {
                        symbol: item.currency_symbol,
                        format: '%s %v',
                        decimal: ',',
                        thousand: '.',
                        precision: item.currency === 'BRL' ? 2 : 8,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </React.Fragment>
        )}
      </aside>
    );
  }
}

const mapStateToProps = state => ({
  myBalance: state.users.myBalance,
  appConfig: state.users.appConfig,
});
export default connect(mapStateToProps)(AsideSimples);
