import { createContext, useState, ReactNode, useContext } from 'react';

// valor passado aqui seria um indicativo do comportamento, o valor padrão seria apenas para definir 
// o formato dos dados a salvar no contexto
// mesma informação compartilhada em vários componentes -> reconciliação

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
};

type PlayerContextData = {
    episodeList: Episode[];
    currentEpisodeIndex: number;
    isPlaying: boolean;
    isLooping: boolean;
    isShuffling: boolean;
    play: (episode: Episode) => void;
    playList: (list: Episode[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    setPlayingState: (state: boolean) => void;
    togglePlay: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    clearPlayerState: () => void;
};

export const PlayerContext = createContext({} as PlayerContextData);


type PlayerContextProviderProps = {
    children: ReactNode; // pode ser qualquer coisa, tipagem interna do React
};

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
    const [episodeList, setEpidodeList] = useState([]);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    function play(episode: Episode) {
        setEpidodeList([episode]);
        setCurrentEpisodeIndex(0);
        setIsPlaying(true);
    };

    function playList(list: Episode[], index: number) {
        setEpidodeList(list);
        setCurrentEpisodeIndex(index);
        // se o player estava pausado e a pessoa clicar para outro episódio ela tem que começar a tocar
        setIsPlaying(true); 
    };

    function togglePlay() {
        setIsPlaying(!isPlaying);
    };

    function toggleLoop() {
        setIsLooping(!isLooping);
    };

    function toggleShuffle() {
        setIsShuffling(!isShuffling);
    };

    function setPlayingState(state: boolean) {
        setIsPlaying(state);
    };

    function clearPlayerState() {
        setEpidodeList([]);
        setCurrentEpisodeIndex(0);
    };

    const hasPrevious = currentEpisodeIndex > 0;
    const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

    function playNext() {  
        if(isShuffling) {
            // pegar Math.random dentro de um intervalo (numero máximo), floor arredonda
            const nextHandleEpisodeIndex = Math.floor(Math.random() * episodeList.length);

            setCurrentEpisodeIndex(nextHandleEpisodeIndex);
        } else if(hasNext) {
            setCurrentEpisodeIndex(currentEpisodeIndex + 1);
        }
    };

    function playPrevious() {
        if(hasPrevious) setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    };

    return (
        // Preciso envolver os componentes que irão utilizar o contexto com o componente e passar um value
        <PlayerContext.Provider 
            value={{ 
                    episodeList, 
                    currentEpisodeIndex, 
                    play, 
                    playList,
                    playNext,
                    playPrevious,
                    hasNext,
                    hasPrevious,
                    isPlaying,
                    isLooping, 
                    isShuffling,
                    togglePlay,
                    toggleLoop, 
                    toggleShuffle,
                    setPlayingState,
                    clearPlayerState
                }}
        >
            { children }
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    return useContext(PlayerContext);
};