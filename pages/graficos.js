import ContextAside from '../components/context/aside';
import ContextHeader from '../components/context/header';
import { connect } from 'react-redux';
import { Select } from 'antd';
import has from 'lodash/has';
import currencyFormatter from 'currency-formatter';

const Option = Select.Option;

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPair: this.props.currentPair || 'BTC/BRL',
    };
  }

  async componentDidMount() {
    this.handleChangeGraph();
  }

  handleChangeGraph = (pair = null) => {
    const symbol = pair ? pair.replace('/', '') : 'BTCBRL';

    if (TradingView && Datafeeds) {
      new TradingView.widget({
        fullscreen: true,
        symbol,
        interval: 'D',
        container_id: 'tradingview_e47e3',
        theme: 'Dark',
        datafeed: new Datafeeds.UDFCompatibleDatafeed(
          this.props.appConfig.chart
        ),
        library_path: '/static/tv/charting_library/',
        locale: 'pt',
        drawings_access: {
          type: 'black',
          tools: [{ name: 'Regression Trend' }],
        },
        enabled_features: ['study_templates'],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user',
        toolbar_bg: '#222222',
        loading_screen: {
          backgroundColor: '#222222',
          foregroundColor: '#222222',
        },
        overrides: {
          'mainSeriesProperties.style': 1,
          'symbolWatermarkProperties.color': '#00BE96',
          'paneProperties.background': '#000000',
          'paneProperties.vertGridProperties.color': '#111',
          'paneProperties.horzGridProperties.color': '#111',
          'symbolWatermarkProperties.transparency': 99,
          'scalesProperties.textColor': '#AAA',
        },
      });

      this.graph.childNodes[0].childNodes[0].style.width = '100%';
    }
  };

  handleLastValue = (pair = 'BTC/BRL') => {
    let totalPerPair = 0;
    if (Object.keys(this.props.ticker).length > 0) {
      if (has(this.props.ticker, pair)) {
        totalPerPair = this.props.ticker[pair].last;
      }
    }

    return totalPerPair;
  };

  render() {
    return (
      <div style={{ display: 'flex' }} className={this.state.styles}>
        <ContextAside handleChangeGraph={() => ({})} />
        <main className="main">
          <ContextHeader page="3" />
          <div
            className="content_wrap container-content"
            style={{ paddingTop: '1rem' }}
          >
            <div className="grafico">
              <React.Fragment>
                <header className="grafico__header">
                  <div
                    className="grafico__container-select"
                    className="dark-theme"
                  >
                    <Select
                      defaultValue={{ key: 'BTC/BRL' }}
                      labelInValue
                      style={{ width: 120 }}
                      onChange={({ key }) => {
                        this.setState({ currentPair: key });
                        this.handleChangeGraph(key);
                      }}
                    >
                      {this.props.pairs.length > 0 ? (
                        this.props.pairs.map((v, i) => {
                          return (
                            <Option key={i} value={v.pair}>
                              {v.pair}
                            </Option>
                          );
                        })
                      ) : (
                        <Option value="">Nenhuma moeda encontrada</Option>
                      )}
                    </Select>
                  </div>
                  <p className="grafico__txt">
                    {currencyFormatter.format(
                      this.handleLastValue(this.state.currentPair),
                      {
                        symbol: 'R$',
                        format: '%s %v',
                        decimal: ',',
                        thousand: '.',
                        precision: 2,
                      }
                    )}
                  </p>
                </header>

                <div
                  style={{ height: '300px' }}
                  className="tradingview-widget-container"
                >
                  <div ref={el => (this.graph = el)} id="tradingview_e47e3" />
                </div>
              </React.Fragment>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { pairs, ticker, currentPair } = state.orders;
  const { appConfig } = state.users;
  return { pairs, ticker, appConfig, currentPair };
};
export default connect(mapStateToProps)(Index);
