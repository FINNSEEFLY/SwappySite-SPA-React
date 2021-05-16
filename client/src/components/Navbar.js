import React, {useContext} from 'react'
import {NavLink, useHistory} from 'react-router-dom'
import {AuthContext} from '../context/AuthContext'

export const Navbar = () => {
    const history = useHistory()
    const auth = useContext(AuthContext)

    const logoutHandler = event => {
        event.preventDefault()
        auth.logout()
        history.push('/')
    }

    if (auth.isAuthenticated) {
        return (
            <header>
                <nav style={{background: "#2B8DFF"}}>
                    <div className="nav-wrapper container">
                        <img className="brand-logo logo" src="/system/img/Swappybw.svg" alt="Swappy"/>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <li>
                                <NavLink
                                    id="mainPageButton"
                                    className="buttonNav"
                                    to="/"
                                >
                                    Главная страница
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    id="createLinkButton"
                                    className="buttonNav"
                                    to="/system/createLinks"
                                >
                                    Создать ссылку
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    id="myCabButton"
                                    className="buttonNav greenButton"
                                    to="/system/myLinks"
                                >
                                    Мои ссылки
                                </NavLink>
                            </li>
                            <li>
                                <a id="exitButton"
                                   className="buttonNav redButton"
                                   href="/"
                                   onClick={logoutHandler}
                                >
                                    Выход
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        )
    }
    return (
        <header>
            <nav style={{background: "#2B8DFF"}}>
                <div className="nav-wrapper container">
                    <img className="brand-logo logo" src="/system/img/Swappybw.svg" alt="Swappy"/>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li>
                            <NavLink
                                id="mainPageButton"
                                className="buttonNav"
                                to="/"
                            >
                                Главная страница
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                id="registerButton"
                                className="buttonNav greenButton"
                                to="/system/register"
                            >
                                Зарегистрироваться
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                id="authButton"
                                className="buttonNav redButton"
                                to="/system/login"
                            >
                                Авторизоваться
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    )
}

