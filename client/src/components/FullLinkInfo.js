import React, {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/materialToast";
import {useHistory} from "react-router-dom";
import {useHttp} from "../hooks/httpUtils";

export const FullLinkInfo = ({params}) => {
    const auth = useContext(AuthContext)
    const message = useMessage()
    const history = useHistory()
    const {loading, request, error, clearError} = useHttp()
    const [form, setForm] = useState({
        longUrl: '',
        shortUrl: '',
        password: '',
        clicksToDisable: 0,
        datetimeToDisable: ''
    })
    const [flags, setFlags] = useState({
        hasPassword: false,
        hasClicksToDisable: false,
        hasDisabledOnDateTime: false,
        isDisabledLink: false
    })
    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])

    useEffect(() => {
        setForm({
            ...form,
            longUrl: params.detailInfo.info.longUrl,
            shortUrl: params.detailInfo.info.shortUrl,
            password: params.detailInfo.info.password,
            clicksToDisable: params.detailInfo.info.clicksToDisable,
            datetimeToDisable: params.detailInfo.info.datetimeToDisable,
        })
        window.M.updateTextFields()
    }, [params])

    useEffect(()=>{
        window.M.updateTextFields()
    },[])

    useEffect(()=>{
        setFlags({
            hasPassword: form.password!=undefined,
            hasClicksToDisable: form.clicksToDisable!=undefined,
            hasDisabledOnDateTime: form.datetimeToDisable!=undefined,
            isDisabledLink: form.isDisabledLink,
        })
    },[form])

    useEffect(()=>window.M.updateTextFields())


    function changeFormHandler(event) {
        setForm({...form, [event.target.name]: event.target.value})
    }

    function changeCheckBoxHandler(event) {
        setFlags({...flags, [event.target.name]: event.target.checked})
    }

    async function deleteLink() {
        const data = await request("/system/link/delete", "POST", {shortUrl: params.detailInfo.info.shortUrl},
            {Authorization: `Bearer ${auth.token}`})
        if (data.statusCode === 401) {
            auth.logout()
            history.push("/system/login")
        }
        message(data.message)
        params.updateInfo()
    }

    async function editLink() {
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
            if (flags.hasPassword && form.password === '') {
                message("Заполните пароль")
                abort = true
            } else if (flags.hasPassword) {
                body.password = form.password
            }
            if (flags.hasClicksToDisable && form.clicksToDisable < 0) {
                message('Ограничение кликов должно быть положительным')
                abort = true
            } else if (flags.hasClicksToDisable) {
                body.clickLimit = form.clicksToDisable
            }
            if (flags.hasDisabledOnDateTime && form.datetimeToDisable === '') {
                message('Заполните дату и время')
                abort = true
            } else if (flags.hasDisabledOnDateTime) {
                body.disabledOnDateTime = form.datetimeToDisable
            }
            if (!abort) {
                const data = await request("/system/link/create", "POST", body,
                    {Authorization: `Bearer ${auth.token}`})
                if (data.statusCode === 401) {
                    auth.logout()
                    history.push("/system/login")
                }
                message(data.message)
            }
        } catch (e) {
        }
    }

    return (
        <div className="fullLinkInfo">
            <div className="my-table">
                <table className="striped highlight centered">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th>Переход с</th>
                        <th>Дата и время клика</th>
                        <th>Платформа</th>
                        <th>Ширина экрана</th>
                        <th>Высота экрана</th>
                        <th>IP адрес</th>
                    </tr>
                    </thead>
                    <tbody>
                    {params.detailInfo?.stats.map((link, index) => {
                        return (
                            <tr>
                                <td>{index + 1}</td>
                                <td>{link.referrer === "" ? "-" : link.referrer}</td>
                                <td>{link.datetime}</td>
                                <td>{link.platform}</td>
                                <td>{link.screenWidth}</td>
                                <td>{link.screenHeight}</td>
                                <td>{link.ipAddress}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
            <section className="EditorBox">
                <form
                    className="editorForm"
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
                        <label htmlFor="longUrl" className="labelBeforeInputUrl">
                            Длинная ссылка (которую необходимо сократить)
                        </label>
                    </div>
                    <div className="input-field">
                        <input
                            type="url"
                            id="shortUrl"
                            name="shortUrl"
                            className="blue-input"
                            value={form.shortUrl}
                            onChange={changeFormHandler}
                        />
                        <label htmlFor="shortUrl" className="labelBeforeInputUrl">
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
                                checked={flags.hasPassword}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Установить пароль</span>
                        </label>
                    </p>
                    <p>
                        <label className={flags.hasClicksToDisable ? 'blue-text' : ""}>
                            <input
                                id="indeterminate-checkbox"
                                type="checkbox"
                                name='hasClicksToDisable'
                                value={flags.hasClicksToDisable}
                                checked={flags.hasClicksToDisable}
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
                                checked={flags.hasDisabledOnDateTime}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Выключить в определенный момент</span>
                        </label>
                    </p>
                    <p>
                        <label className={flags.isDisabledLink ? 'blue-text' : ""}>
                            <input
                                id="indeterminate-checkbox"
                                type="checkbox"
                                name='isDisabledLink'
                                value={flags.isDisabledLink}
                                checked={flags.isDisabledLink}
                                onChange={changeCheckBoxHandler}
                            />
                            <span>Выключить ссылку</span>
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
                        <label htmlFor="password" className="labelBeforeInputUrl">
                            {flags.hasPassword ? "Пароль" : ""}
                        </label>
                    </div>
                    <div className={flags.hasClicksToDisable ? 'input-field' : 'hide'}>

                        <input
                            type={flags.hasClicksToDisable ? "number" : "hidden"}
                            id="clickLimit"
                            name="clickLimit"
                            className="blue-input"
                            value={form.clicksToDisable}
                            onChange={changeFormHandler}
                            min='0'
                        />
                        <label htmlFor="clickLimit" className="labelBeforeInputUrl">
                            {flags.hasClicksToDisable ? "Ограничение по кликам" : ""}
                        </label>
                    </div>
                    <div className={flags.hasDisabledOnDateTime ? 'input-field' : 'hide'}>

                        <input
                            type={flags.hasDisabledOnDateTime ? "text" : "hidden"}
                            id="disabledOnDateTime"
                            name="disabledOnDateTime"
                            className="blue-input"
                            value={form.datetimeToDisable}
                            onChange={changeFormHandler}
                            onFocus={event => event.target.type = 'datetime-local'}
                            onBlur={event => event.target.type = flags.hasDisabledOnDateTime ? "text" : "hidden"}
                        />
                        <label htmlFor="disabledOnDateTime" className="labelBeforeInputUrl">
                            {flags.hasDisabledOnDateTime ? "Отключить ссылку..." : ""}
                        </label>
                    </div>
                    <button
                        type="button"
                        className="buttonForm"
                        onClick={editLink}
                        disabled={loading}
                    >
                        Изменить ссылку
                    </button>
                    <button
                        type="button"
                        className="buttonFormRed"
                        onClick={deleteLink}
                        disabled={loading}
                    >
                        Удалить ссылку
                    </button>
                </form>
            </section>
        </div>
    )
}