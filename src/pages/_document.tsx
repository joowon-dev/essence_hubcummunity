import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko" dir="ltr">
      <Head>
        <style>{`
          @font-face {
            font-family: 'Wanted Sans';
            src: url('https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.0/packages/wanted-sans/webfonts/static/woff2/WantedSans-Thin.woff2') format('woff2');
            font-weight: 100;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Wanted Sans';
            src: url('https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.0/packages/wanted-sans/webfonts/static/woff2/WantedSans-Regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Wanted Sans';
            src: url('https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.0/packages/wanted-sans/webfonts/static/woff2/WantedSans-SemiBold.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Wanted Sans';
            src: url('https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.0/packages/wanted-sans/webfonts/static/woff2/WantedSans-Bold.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Wanted Sans';
            src: url('https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.0/packages/wanted-sans/webfonts/static/woff2/WantedSans-ExtraBold.woff2') format('woff2');
            font-weight: 800;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
