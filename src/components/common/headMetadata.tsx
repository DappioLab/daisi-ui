import Head from "next/head";

const HeadMetadata = () => {
  return (
    <Head>
      <title>Daisi</title>
      <meta name="description" content="Efficient way to curate and discover" />
      <meta property="og:title" content="Daisi" />
      <meta
        property="og:description"
        content="Efficient way to curate and discover"
      />
      <meta property="og:url" content="https://beta.daisi.social" />
      <meta
        property="og:image"
        content="https://beta.daisi.social/og_image.png"
      />
      <meta property="twitter:title" content="Daisi" />
      <meta
        property="twitter:description"
        content="Efficient way to curate and discover"
      />
      <meta property="twitter:site" content="@daisisocial" />
      <meta property="twitter:url" content="https://beta.daisi.social" />
      <meta property="twitter:creator" content="@daisisocial" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:image"
        content="https://beta.daisi.social/og_image.png"
      />
      <link rel="shortcut icon" href="https://beta.daisi.social/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
    </Head>
  );
};

export default HeadMetadata;
