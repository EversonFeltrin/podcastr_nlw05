// importa a tipagem da função
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link'; // Mantém o funcionamento de SPA, muda somente o que precisa, n precisa recarregar tudo
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import { api } from "../services/app";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import { usePlayer } from "../contexts/PlayerContext";

import styles from './home.module.scss';

// tipagem interface ou type
type Episode = {
	id: string,
	title: string,
	thumbnail: string,
	members: string,
	publishedAt: string,
	duration: number,
	durationAsString: string,
	url: string
};

type HomeProps = {
	latestEpisodes: Episode[]; // outro jeito de declarar -> Array<Episode>
	allEpisodes: Episode[]; // outro jeito de declarar -> Array<Episode>
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
	const { playList } = usePlayer();

	// criou nova informação, copiando a origem
	// principio da imutabilidade
	const episodeList = [...latestEpisodes, ...allEpisodes]; 

	return (
		<div className={styles.homePage}>
			<Head>
				<title>Home | Podcstr</title>
			</Head>	
			
			<section className={styles.latestEpisodes}>
				<h2>Últimos lançamentos</h2>

				<ul>
					{
						latestEpisodes.map((episode, index) => {
							// key precisa ser no peimeiro elemento que vem no map, referencia para o react se achar
							// sem a key ele deletaria tudo e recriaria tudo
							// Image do next (apenas no next) otimiza as imagens, trata a imagem de forma automatizada
							// width e height da Image são as dimensões que se deseja carregar a imagem, não o que será mostradpo em tela
							// objectFit faz com que a imagem se ajuste sem distorções
							return (
								<li key={episode.id}> 								    
									<Image 
										width={192} 
										height={192} 
										src={episode.thumbnail} 
										alt={episode.title}
										objectFit="cover" 
									/>

									<div className={styles.episodeDetails}>
										<Link href={`/episodes/${episode.id}`}>
											<a>{episode.title}</a>
										</Link>
										<p>{episode.members}</p>
										<span>{episode.publishedAt}</span>
										<span>{episode.durationAsString}</span>
									</div>

									<button 
										type='button'
										onClick={() => playList(episodeList, index)}
									>
										<img src="/play-green.svg" alt="Tocar episódio" />
									</button>
								</li>
							);
						})
					}
				</ul>
			</section>
			<section className={styles.allEpisodes}>
				<h2>Todos episódios</h2>
				<table cellSpacing={0}>
					<thead>
						<tr>
							<th></th>
							<th>podcast</th>
							<th>Integrantes</th>
							<th>Data</th>
							<th>Duração</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{
							allEpisodes.map((episode, index) => {
								return (
									<tr key={episode.id}>
										<td style={{ width: 72}}>
											<Image 
												width={120}
												height={120}
												src={episode.thumbnail}
												alt={episode.title}
												objectFit="cover"
											/>
										</td>
										<td>
											<Link href={`/episodes/${episode.id}`}>
												<a>{episode.title}</a>
											</Link>
										</td>
										<td>{episode.members}</td>
										<td style={{ width: 100}}>{episode.publishedAt}</td>
										<td>{episode.duration}</td>
										<td>
											<button 
												type='button'
												onClick={() => playList(episodeList, index + latestEpisodes.length)}
											>
												<img src="/play-green.svg" alt="Tocar episódio" />
											</button> 
										</td>
						
									</tr>
								);
							})
						}
					</tbody>

				</table>
			</section>
		</div>
	)
};

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at', 
			_order: 'desc'
		}
	});

	// formatar antes de renderizar
	const episodes = data.map(episode => {
		return {
			id: episode.id,
			title: episode.title,
			thumbnail: episode.thumbnail,
			members: episode.members,
			publishedAt: format(parseISO(episode.published_at), `d MMM yy`, { locale: ptBR }),
			duration: Number(episode.file.duration),
			durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
			url: episode.file.url
		}
	});

	const latestEpisodes = episodes.slice(0, 2);
	const allEpisodes = episodes.slice(2, episodes.length);

	return {
		// props pq a função vai buscar props -> precisa sempre retornar props, restante nomeia como quiser
		props: {
			latestEpisodes,
			allEpisodes
		}, 
		// segundos para ver de quanto em quanto tempo a página é recarregada, gerar uma nova versão
		revalidate: 60 * 60 * 8 // a cada 8 horas, ou seja a pagina recarrega 3 vezes ao dia e todo mundo que acessar nos intervalos recebe a versão estática
	};
};













// SPA
// SSR
// SSG
// // SPA -> método tradicional -> {} o que executar - [] quando executar
// // dados carregados somente no momento que as pessoas acessa a tela da aplicação
// // Se a gente precisa que as informações sejam indexadas por um crowler, ele n vai esperar que a requisição responda
// // com JS desabilitado as informações n seriam carregadas, pq roda no borwnser
// useEffect(() => {
//   fetch('http://localhost:3333/episodes')
//     .then(response  => response.json())
//     .then(data => console.log(data));
// }, []);

// SSG - assim que alguém acessa a página, uma versão estatíca é gerada que será servida a todos que acessarem após o primeiro usuário acessar
// Não tem a necessidade de toda vez que alguém acessar, buscar as informações na api, sendo que os dados na home são atualizados de tempos em tempos
// Só funciona em produção, precisa ser gerado a build


// // SSR -> Next entende que precisa executar a função antes de exibir o conteúdo ao usuário final
// // Carrega na camada do servidor e n no brownser
// // executa toda a vez que alguém acessa a home 
// export async function getServerSideProps() {

//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();

//   return {
//     // props pq a função vai buscar props -> precisa sempre retornar props, restante nomeia como quiser
//     props: {
//       episodes: data
//     }
//   };
// }


