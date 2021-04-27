// configurar o formato do doc que fica por volta da aplicação
// se importar a fonte no app ele vai recarregar a cada pagina
// chamado uma unica vez

import Document, { Html, Head, Main, NextScript} from 'next/document';

// escrever apenas em formato de classe 
export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Inter&family=Lexend:wght@500;600&display=swap" rel="stylesheet" /> 
                
                    <link ref="shortcut icon" href="/favicon.png" type="image/png" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
