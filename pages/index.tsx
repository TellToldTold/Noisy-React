import styles from '@/styles/Home.module.css'
import Background from "./Background";


const Home = () => {

    return (
        <Background>

            <div className={styles.home}>
                <text className={styles.title}>Francesco Baldini</text>
                <div className={styles.scrollDiv}>
                    <text className={styles.scrollText}>SCROLL</text>
                    <div className={styles.scrollArrow}/>
                </div>
            </div>

        </Background>
    )
}

export default Home;