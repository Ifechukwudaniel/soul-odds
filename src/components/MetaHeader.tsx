// Libs
import React from "react";
import Head from "next/head";

// Interface
interface IProps {
  title: string;
  description: string;
  image?: string | null;
  themeColor: string;
  locale: string;
  author?: string | null;
  twitterHandle?: string | null;
  keywords: string;
  domain: string;
}

// Component
const MetaHeader = ({
  title,
  description,
  image,
  themeColor,
  locale,
  author,
  twitterHandle,
  keywords,
  domain,
}: IProps) => {
  return (
    <Head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="content-language" content={locale} />
      <meta name="viewport" id="viewporttag" content="width=device-width, user-scalable=no, initial-scale=1" />

      <link rel="apple-touch-icon" sizes="57x57" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/img/logo.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/img/logo.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/img/logo.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/img/logo.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/img/logo.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/img/logo.png" />
      <link rel="manifest" href="/manifest.json" />

      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-TileImage" content="/static/img/favicons/ms-icon-144x144.png" />

      <meta name="theme-color" content="#ff5945" />

      <title>{title}</title>
      <meta name="description" content={description} />

      {image && <meta property="og:image" content={image} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={title} />
      <meta property="og:locale" content={locale} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={domain} />
      {author && <meta property="article:author" content={author} />}
      {author && <meta property="article:publisher" content={author} />}
      <meta name="keywords" content={keywords} />
      {image && <meta name="twitter:card" content={image} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={`${domain}${image}`} />}
    </Head>
  );
};

// Props
MetaHeader.defaultProps = {};

export default MetaHeader;
