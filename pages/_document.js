import Document, { Head, Main, NextScript } from 'next/document';
import HeadMetaTags from '../components/head';

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <HeadMetaTags />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700"
            rel="stylesheet"
          />
          <script>TradingView = null; Datafeeds = null;</script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" />
          <script
            async
            defer
            type="text/javascript"
            src="https://s3.tradingview.com/tv.js"
          />
          <script
            async
            defer
            type="text/javascript"
            src="/static/tv/charting_library.min.js"
          />
          <script
            async
            defer
            type="text/javascript"
            src="/static/tv/datafeed/udf/datafeed.js"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>

        <script src="/static/login-functions.js" />
      </html>
    );
  }
}
