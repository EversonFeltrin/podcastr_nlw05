// criar arquivos css especificos de um componente, nunca serão compartilhadas com outras
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import Slider from 'rc-slider';
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import 'rc-slider/assets/index.css'; // estilização padrão do slider, importando css apenas nessa página

import { usePlayer } from "../../contexts/PlayerContext";

import styles from "./styles.module.scss";

// não precisa default para auxiliar nos auto imports do vscode, porém precisa nos components dentro das pages
export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0); // vai guardar os tempos em segundos do progresso do epiśódio


    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        isLooping,
        isShuffling,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        setPlayingState,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        clearPlayerState
    } = usePlayer();

    useEffect(() => {
        if(!audioRef.current) {
            return;
        }

        if(isPlaying) {
            audioRef.current.play();
        }
        else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setupProgressListener() {
        audioRef.current.currentTime = 0; // sempre que muda de um som pra outro seta pra zero

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    };

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;

        setProgress(amount);
    };

    function handleEpisodeEnded() {
        if(hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    };

    const episode = episodeList[currentEpisodeIndex];
    
    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            {
                episode ? (
                    <div className={styles.currentEpisode}>
                        <Image 
                            width={592} 
                            height={592} 
                            src={episode.thumbnail}
                            objectFit="cover"
                        />
                        <strong>{episode.title}</strong>
                        <span>{episode.members}</span>
                    </div>
                ) : (
                    <div className={styles.emptyPlayer}>
                        <strong>Selecione um podcast para ouvir</strong>
                    </div>
                )
            }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    
                    <div className={styles.slider}>
                        {
                            episode ? (
                                <Slider 
                                    max={episode.duration}
                                    value={progress}
                                    onChange={handleSeek}
                                    trackStyle={{ backgroundColor: "#04d361" }}
                                    railStyle={{ backgroundColor: '#9f75ff'}} // ainda não sofreu progresso
                                    handleStyle={{ borderColor: "#04d361", borderWidth: 4}}
                                />
                            ) : (
                                <div className={styles.emptySlider} />
                            )
                        }
                    </div>

                    {/* episode?.duration senão existir n tenta pegar duration  */}
                    {/*  ?? 0 senáo tiver o valor seta pra zero*/}
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div> 

                {
                    episode && (
                        <audio 
                            src={episode.url} 
                            ref={audioRef}
                            autoPlay
                            loop={isLooping}
                            onLoadedMetadata={setupProgressListener}
                            onEnded={handleEpisodeEnded}
                            onPlay={() => setPlayingState(true)}
                            onPause={() => setPlayingState(false)}
                        />
                    )
                }

                <div className={styles.buttons}>
                    <button 
                        type='button'
                        disabled={!episode || episodeList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embarralhar" />
                    </button>

                    <button 
                        type='button'
                        onClick={playPrevious}
                        disabled={!episode || !hasPrevious}
                    >
                        <img src="/play-previous.svg" alt="Tocar anterior" />
                    </button>

                    <button 
                        type='button' 
                        className={styles.playButton}
                        disabled={!episode}
                        onClick={togglePlay}
                    >
                        {
                            isPlaying ? (
                                <img src="/pause.svg" alt="Tocar" />
                            ) : (
                                <img src="/play.svg" alt="Tocar" />
                            )

                        }
                    </button>

                    <button 
                        type='button'
                        onClick={playNext}
                        disabled={!episode || !hasNext}
                    >
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>

                    <button 
                        type='button'
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div>
    );
}