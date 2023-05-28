import {SessionProvider} from "next-auth/react";
import {AppProps} from "next/app";
import {ThemeProvider} from "next-themes"
import "../styles/globals.css";
import ThemeButton from "../components/ThemeButton";

const App = ({Component, pageProps}: AppProps) => {
    return (
        <SessionProvider session={pageProps.session}>
            <ThemeProvider attribute="class">
                <ThemeButton/>
                <Component {...pageProps} />
            </ThemeProvider>
        </SessionProvider>

    );
};

export default App;
