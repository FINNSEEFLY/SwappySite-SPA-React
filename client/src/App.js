import React from 'react'
import 'materialize-css'
import {AuthContext} from "./context/AuthContext";
import {BrowserRouter as Router} from "react-router-dom";
import {Navbar} from "./components/Navbar";
import {useRoutes} from "./routes";
import {Footer} from "./components/Footer";
import {useAuth} from "./hooks/useAuthHook";
import {Loader} from "./components/Loader";

function App() {
    const {token, login, logout, userId, ready} = useAuth()
    const isAuthenticated = Boolean(token);
    const routes = useRoutes(isAuthenticated)

    if (!ready) {
        return <Loader/>
    }

    return (
       <AuthContext.Provider value={{token, login, logout, userId, isAuthenticated}}>
            <Router>
                <Navbar/>
                {routes}
                <Footer/>
            </Router>
        </AuthContext.Provider>
    )
}

export default App;
