import Head from 'next/head';
import HeadMetaTags from '../head';
import Router from 'next/router';

class Login extends React.Component {
  componentDidMount() {
    if (
      localStorage.getItem('auth_token') &&
      (this.props.route === '/login' || this.props.route === '/signup')
    ) {
      Router.push('/');
    }
  }

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <Head>
          <HeadMetaTags />
        </Head>

        <div>{children}</div>
      </React.Fragment>
    );
  }
}

export default Login;
