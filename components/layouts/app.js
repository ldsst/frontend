import withNProgress from 'next-nprogress';
import Loading from '../loading';
import { fetchUserProfile, fetchAppConfig } from '../../actions/users';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import Router from 'next/router';
import Head from 'next/head';

const AppSuperVariables = React.createContext();

class App extends React.Component {
  constructor(props) {
    super(props);

    //Here all super variables I can use with Context API
    this.state = {
      asideIsOpened: false,
      openAside: () => this.setState({ asideIsOpened: true }),
      closeAside: () => this.setState({ asideIsOpened: false }),
      toggleAside: () =>
        this.state.asideIsOpened
          ? this.state.closeAside()
          : this.state.openAside(),
      navIsOpened: false,
      openNav: () => this.setState({ navIsOpened: true }),
      closeNav: () => this.setState({ navIsOpened: false }),
      toggleNav: () =>
        this.state.navIsOpened ? this.state.closeNav() : this.state.openNav(),
      buyAsideStatus: true,
      buyAsideTrue: () => this.setState({ buyAsideStatus: true }),
      buyAsideFalse: () => this.setState({ buyAsideStatus: false }),
    };
  }
  async componentDidMount() {
    if (!localStorage.getItem('auth_token')) {
      Router.push('/login');
    }
    await this.props.dispatch(fetchAppConfig());
    await this.props.dispatch(fetchUserProfile());

    await import('moment/locale/pt-br');
  }

  render() {
    const { authenticated, children, appConfigured, appConfig } = this.props;
    return (
      <AppSuperVariables.Provider value={this.state}>
        <Head>
          <title>{appConfig.name}</title>
        </Head>
        {!authenticated && !appConfigured ? <Loading /> : children}
      </AppSuperVariables.Provider>
    );
  }
}

const mapStateToProps = state => ({
  authenticated: !!Object.keys(state.users.userProfile).length,
  appConfigured: !!Object.keys(state.users.appConfig).length,
  appConfig: state.users.appConfig,
});

export default withNProgress(200, { showSpinner: false })(
  connect(mapStateToProps)(App)
);
export { AppSuperVariables };
