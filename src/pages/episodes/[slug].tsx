import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
// import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import { api } from '../../services/app';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import Head from 'next/head';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

// n reaproveitar o código, otimização prematura
type Episode = {
    id: string,
    title: string,
    thumbnail: string,
    members: string,
    publishedAt: string,
    duration: number,
    durationAsString: string,
    description: string,
    url: string
};

type EpisodeProps = {
    episode;
}

export default function Episode({ episode }: EpisodeProps ) {
    // n precisa no fallback blocking
    // const router = useRouter();

    // if(router.isFallback) {
    //     return <p>Carregando...</p>
    // }

    const { play } = usePlayer();
    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcstr</title>
            </Head>	
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>

                <Image 
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    // alt={episode.title}
                    objectFit="cover" 
                />
                <button 
                    type='button'
                    onClick={()=> play(episode)}
                >
                    <img src="/play.svg" alt="Tocar" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            {/* Cuidar -> Texto no react por segurança não são convertidas em  html, para evitar injeções de código script*/}
            {/* <div className={styles.description}>
                {episode.description}
            </div> */}
            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{ __html: episode.description }} 
            />
        </div>
    );
};

// obrigatório ser usado em rotas que usam geração estaática e [ ] na rota
// toda vez que estamos gerando de forma dinâmica uma página estática, (página estática com parametros), preciso informar este método
// retorn quais episodios eu quero gerar de forma estática no momento da build, como está [] ele não gera de forma estática nenhum episódio na hora da build
// se quisessemos gerar um episodio seria: 
// paths: [
//     {
//         params: {
//             slug: 'slug_episodio'
//         }
//     }
// ]
/**
 * fallback: 
 * blocking --> 
 * false --> retorna 404
 * true --> ele busca os dados (executa no lado do client) -> demoraria os 750s pra ir buscar no servidor
 * next carrega os dados da página quando usuário acessar
 * 
 * incremental static regeneration -> fallback blocking e true
 * 
 * client(browser) - next.js (node.js) - server (back-end)
 *      true            blocking(melhor para crowling)
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    });

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    });

    return {
        paths,
        fallback: 'blocking'
    }
};

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params; // contexto
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), `d MMM yy`, { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    };

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24 // 24 horas 
    }
}