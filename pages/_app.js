import App, { Container } from 'next/app';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import Head from 'next/head';
import HeadMetaTags from '../components/head';
import AppLayout from '../components/layouts/app';
import LoginLayout from '../components/layouts/login';
import { ToastContainer } from 'react-toastify';
import { configureStore } from '../store';
import Raven from 'raven-js';

import '../scss/pages/login.scss';
import '../static/antd-imports';
import '../scss/style.scss';
import '../scss/dark_antd.scss';

Raven.config(process.env.REACT_APP_SENTRY_DNS).install();

class MyApp extends App {
  render() {
    const { Component, pageProps, store, router } = this.props;

    return (
      <Container>
        <Provider store={store}>
          <React.Fragment>
            <Head>
              <HeadMetaTags />
            </Head>
            {router.route !== '/login' &&
            router.route !== '/signup' &&
            router.route !== '/recovery' &&
            router.route !== '/reset-password' &&
            router.route !== '/verificacao-email' &&
            router.route !== '/block-account' ? (
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
            ) : (
              <LoginLayout route={router.route}>
                <Component {...pageProps} />
              </LoginLayout>
            )}

            <ToastContainer />
          </React.Fragment>
        </Provider>
      </Container>
    );
  }
}
export default withRedux(configureStore)(MyApp);
