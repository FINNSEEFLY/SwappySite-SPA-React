import {useContext, useState, useEffect} from 'react'
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/materialToast";
import {useHttp} from "../hooks/httpUtils";

export const LoginPage = () => {
    document.title = 'Авторизация';
    const auth = useContext(AuthContext)
    const message = useMessage()
    const {loading, request, error, clearError} = useHttp()
    const [form, setForm] = useState({password: '', login: ''})

    async function loginButtonClickHandler(event) {
        try {
            const data = await request("/system/auth/login", "POST", {...form})
            auth.login(data.token, data.userId)
        } catch (e) {
        }
    }

    function changeHandler(event) {
        setForm({...form, [event.target.name]: event.target.value})
    }

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])


    return (
        <article className="content">
            <section className="AuthBox">
                <h1 id="bannerMainMessage" className="bannerMessage">
                    Авторизация
                </h1>
                <form
                    className="inputForm"
                    id="loginForm"
                    name="loginForm"
                >
                    <div className="input-field">
                        <input
                            type="text"
                            id="login"
                            name="login"
                            className="blue-input"
                            onChange={changeHandler}
                            required
                            value={form.login}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Логин
                        </label>
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="blue-input"
                            onChange={changeHandler}
                            required
                            value={form.password}
                        />
                        <label htmlFor="passwordInput" className="labelBeforeInputUrl">
                            Пароль
                        </label>
                    </div>
                    <button
                        type="button"
                        className="buttonForm"
                        onClick={loginButtonClickHandler}
                        disabled={loading}
                    >
                        Вход
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