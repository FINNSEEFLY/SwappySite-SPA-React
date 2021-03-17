import React from 'react'
import {AuthContext} from "../context/AuthContext";
import {useContext, useState, useEffect} from 'react'
import {useMessage} from "../hooks/materialToast";
import {useHttp} from "../hooks/httpUtils";

export const RegisterPage = () => {
    const auth = useContext(AuthContext)
    const message = useMessage()
    const {loading, request, error, clearError} = useHttp()
    const [form, setForm] = useState({
        email: '', password: '', login: ''
    })

    document.title = 'Регистрация';

    async function registerButtonClickHandler(event) {
        try {
            const data = await request("/system/auth/register", "POST", {...form})
            message(data.message)
            auth.login(data.token, data.userId)
        } catch (e) {
        }
    }

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])


    function changeHandler(event) {
        setForm({...form, [event.target.name]: event.target.value})
    }

    return (
        <article className="content">
            <section className="AuthBox">
                <h1 id="bannerMainMessage" className="bannerMessage">
                    Регистрация
                </h1>
                <form
                    className="inputForm"
                    id="registerForm"
                    name="registerForm"
                >
                    <div className="input-field">
                        <input
                            type="email"
                            id="emailInput"
                            name="email"
                            className="blue-input"
                            value={form.email}
                            onChange={changeHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Email
                        </label>
                    </div>
                    <div className="input-field">

                        <input
                            type="text"
                            id="loginInput"
                            name="login"
                            className="blue-input"
                            value={form.login}
                            onChange={changeHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Логин
                        </label>
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            id="passwordInput"
                            name="password"
                            className="blue-input"
                            value={form.password}
                            onChange={changeHandler}
                        />
                        <label htmlFor="passwordInput" className="labelBeforeInputUrl">
                            Пароль
                        </label>
                    </div>
                    <button
                        type="button"
                        className="buttonForm"
                        onClick={registerButtonClickHandler}
                        disabled={loading}
                    >
                        Зарегистрироваться
                    </button>

                </form>
            </section>
            <section id="wannaMore" className="largeBanner">
                <div className="largeBannerContainer">
                    <h2 id="wannaMoreFirst" className="bannerMessage">Полный контроль</h2>
                    <h3 id="wannaMoreSecond" className="bannerMessage">
                        Статистика по каждому клику и система управления каждой ссылкой!
                    </h3>
                </div>
            </section>
        </article>
    )
}