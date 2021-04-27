// criar arquivos css especificos de um componente, nunca serão compartilhadas com outras
import styles from "./styles.module.scss";
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
// não precisa default para auxiliar nos auto imports do vscode, porém precisa nos components dentro das pages
export function Header() {
    const currentDate = format(new Date(), "EEEEEE, d MMMM", {locale: ptBR});
    return (
        <header className={styles.headerContainer} >
            <img src="/logo.svg" alt="Podcastr" />

            <p>O melhor para você ouvir, sempre</p>

            <span>{currentDate}</span>
        </header>
    );
}