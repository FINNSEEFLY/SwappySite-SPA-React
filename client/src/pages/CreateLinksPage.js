import React, {useContext, useEffect, useState} from 'react'
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/materialToast";
import {useHttp} from "../hooks/httpUtils";

export const CreateLinksPage = () => {
    document.title = 'Создать ссылку';
    const auth = useContext(AuthContext)
    const message = useMessage()
    const {loading, request, error, clearError} = useHttp()
    const [form, setForm] = useState({
        longUrl: '',
        shortUrl: '',
        password: '',
        clickLimit: 0,
        disabledOnDateTime: ''
    })
    const [flags, setFlags] = useState({
        hasPassword: false,
        hasClicksLimit: false,
        hasDisabledOnDateTime: false
    })

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])



    async function createShortLinkButtonClickHandler() {
        try {
            let body = {}
            let abort = false;
            if (form.longUrl === '') {
                message('Заполните длинную ссылку')
                abort = true
            } else {
                body.longUrl = form.longUrl
            }
            if (form.shortUrl === '') {
                message('Заполните короткую ссылку')
                abort = true
            } else {
                body.shortUrl = form.shortUrl
            }
            if (flags.hasPassword && form.password==='') {
                message("Заполните пароль")
                abort = true
            } else if (flags.hasPassword) {
                body.password = form.password
            }
            if (flags.hasClicksLimit && form.clickLimit<0) {
                message('Ограничение кликов должно быть положительным')
                abort = true
            } else if (flags.hasClicksLimit) {
                body.clickLimit = form.clickLimit
            }
            if (flags.hasDisabledOnDateTime && form.disabledOnDateTime==='') {
                message('Заполните дату и время')
                abort = true
            } else if (flags.hasDisabledOnDateTime) {
                body.disabledOnDateTime = form.disabledOnDateTime
            }
            if (!abort) {
                const data = await request("/system/link/create", "POST", body,
                    {Authorization: `Bearer ${auth.token}`})
                message(data.message)
            }
        } catch (e) {
        }
    }

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])


    function changeFormHandler(event) {
        setForm({...form, [event.target.name]: event.target.value})
    }

    function changeCheckBoxHandler(event) {
        setFlags({...flags, [event.target.name]: event.target.checked})
    }

    return (

        <article className="content">
            <section className="AuthBox">
                <h1 id="bannerMainMessage" className="bannerMessage">
                    Создай свою ссылку!
                </h1>
                <form
                    className="inputForm"
                    id="createLinkForm"
                    name="createLinkForm"
                >
                    <div className="input-field">
                        <input
                            type="url"
                            id="longUrl"
                            name="longUrl"
                            className="blue-input"
                            value={form.longUrl}
                            onChange={changeFormHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Длинная ссылка (которую необходимо сократить)
                        </label>
                    </div>
                    <div className="input-field">
                        <input
                            type="url"
                            id="shortUrl"
                            name="shortUrl"
                            className="blue-input"
                            value={form.shortLink}
                            onChange={changeFormHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Короткая ссылка (итоговая ссылка)
                        </label>
                    </div>
                    <p>
                        <label className={flags.hasPassword ? 'blue-text' : ""}>
                            <input
                                id="indeterminate-checkbox"
                                type="checkbox"
                                name='hasPassword'
                                value={flags.hasPassword}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Установить пароль</span>
                        </label>
                    </p>
                    <p>
                        <label className={flags.hasClicksLimit ? 'blue-text' : ""}>
                            <input
                                id="indeterminate-checkbox"
                                type="checkbox"
                                name='hasClicksLimit'
                                value={flags.hasClicksLimit}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Ограничить по количеству кликов</span>
                        </label>
                    </p>
                    <p>
                        <label className={flags.hasDisabledOnDateTime ? 'blue-text' : ""}>
                            <input
                                id="indeterminate-checkbox"
                                type="checkbox"
                                name='hasDisabledOnDateTime'
                                value={flags.hasDisabledOnDateTime}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Выключить в определенный момент</span>
                        </label>
                    </p>
                    <div className={flags.hasPassword ? 'input-field' : 'hide'}>

                        <input
                            type={flags.hasPassword ? "password" : "hidden"}
                            id="password"
                            name="password"
                            className="blue-input"
                            value={form.password}
                            onChange={changeFormHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            {flags.hasPassword ? "Пароль" : ""}
                        </label>
                    </div>
                    <div className={flags.hasClicksLimit ? 'input-field' : 'hide'}>

                        <input
                            type={flags.hasClicksLimit ? "number" : "hidden"}
                            id="clickLimit"
                            name="clickLimit"
                            className="blue-input"
                            value={form.clickLimit}
                            onChange={changeFormHandler}
                            min='0'
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            {flags.hasClicksLimit ? "Ограничение по кликам" : ""}
                        </label>
                    </div>
                    <div className={flags.hasDisabledOnDateTime ? 'input-field' : 'hide'}>

                        <input
                            type={flags.hasDisabledOnDateTime ? "text" : "hidden"}
                            id="disabledOnDateTime"
                            name="disabledOnDateTime"
                            className="blue-input"
                            value={form.disabledOnDateTime}
                            onChange={changeFormHandler}
                            onFocus={event => event.target.type = 'datetime-local'}
                            onBlur={event => event.target.type = flags.hasDisabledOnDateTime ? "text" : "hidden"}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            {flags.hasDisabledOnDateTime ? "Отключить ссылку..." : ""}
                        </label>
                    </div>
                    <button
                        type="button"
                        className="buttonForm"
                        onClick={createShortLinkButtonClickHandler}
                        disabled={loading}
                    >
                        Создать короткую ссылку
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