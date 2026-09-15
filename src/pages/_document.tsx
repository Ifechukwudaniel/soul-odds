import { Html, Head, Main, NextScript } from "next/document";


export default function Document() {
  return (
    <Html lang="en">
      <Head>
       <meta name="viewport" content="user-scalable=no"/>
       <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
       <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>
       <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('touchmove', function (event) {
                if (event.scale !== 1) { event.preventDefault(); }
              }, { passive: false });
            `,
          }}
        />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
