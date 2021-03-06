import React, {useContext, useEffect, useState} from "react";
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
            longUrl: params.detailInfo?.info.longUrl,
            shortUrl: params.detailInfo?.info.shortUrl,
            password: params.detailInfo?.info.password,
            clicksToDisable: params.detailInfo?.info.clicksToDisable,
            datetimeToDisable: params.detailInfo?.info.datetimeToDisable,
        })
        setFlags({
            hasPassword: params.detailInfo?.info.password !== undefined,
            hasClicksToDisable: params.detailInfo?.info.clicksToDisable !== undefined,
            hasDisabledOnDateTime: params.detailInfo?.info.datetimeToDisable !== undefined,
            isDisabledLink: params.detailInfo?.info.isDisabled,
        })
        window.M.updateTextFields()
    }, [params])

    useEffect(() => {
        window.M.updateTextFields()
    }, [])


    useEffect(() => {
        window.M.updateTextFields()
    })


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
        await params.updateInfo()
    }

    async function editLink() {
        try {
            let body = {}
            let abort = false;
            if (form.longUrl === '') {
                message('?????????????????? ?????????????? ????????????')
                abort = true
            } else {
                body.longUrl = form.longUrl
            }
            if (form.shortUrl === '') {
                message('?????????????????? ???????????????? ????????????')
                abort = true
            } else {
                body.shortUrl = form.shortUrl
            }
            if (flags.hasPassword && form.password === '') {
                message("?????????????????? ????????????")
                abort = true
            } else if (flags.hasPassword) {
                body.password = form.password
            }
            if (flags.hasClicksToDisable && form.clicksToDisable < 0) {
                message('?????????????????????? ???????????? ???????????? ???????? ??????????????????????????')
                abort = true
            } else if (flags.hasClicksToDisable) {
                body.clicksToDisable = form.clicksToDisable
            }
            if (flags.hasDisabledOnDateTime && form.datetimeToDisable === '') {
                message('?????????????????? ???????? ?? ??????????')
                abort = true
            } else if (flags.hasDisabledOnDateTime) {
                body.datetimeToDisable = form.datetimeToDisable
            }
            body.isDisabledLink = flags.isDisabledLink
            body.oldShortUrl = params.detailInfo?.info.shortUrl
            if (!abort) {
                console.log(body)
                const data = await request("/system/link/update", "POST", body,
                    {Authorization: `Bearer ${auth.token}`})
                if (data.statusCode === 401) {
                    auth.logout()
                    history.push("/system/login")
                }
                message(data.message)
                await params.updateInfo()
            }
        } catch (e) {
        }
    }

    if (params.detailInfo === undefined)
        return (
            <div className="fullLinkInfo">
            </div>
        )
    else
        return (
            <div className="fullLinkInfo">
                <div className="my-table">
                    <table className="striped highlight centered">
                        <thead>
                        <tr>
                            <th>???</th>
                            <th>?????????????? ??</th>
                            <th>???????? ?? ?????????? ??????????</th>
                            <th>??????????????????</th>
                            <th>???????????? ????????????</th>
                            <th>???????????? ????????????</th>
                            <th>IP ??????????</th>
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
                                ?????????????? ???????????? (?????????????? ???????????????????? ??????????????????)
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
                                ???????????????? ???????????? (???????????????? ????????????)
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
                                <span>???????????????????? ????????????</span>
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
                                <span>???????????????????? ???? ???????????????????? ????????????</span>
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
                                <span>?????????????????? ?? ???????????????????????? ????????????</span>
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
                                <span>?????????????????? ????????????</span>
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
                                {flags.hasPassword ? "????????????" : ""}
                            </label>
                        </div>
                        <div className={flags.hasClicksToDisable ? 'input-field' : 'hide'}>

                            <input
                                type={flags.hasClicksToDisable ? "number" : "hidden"}
                                id="clicksToDisable"
                                name="clicksToDisable"
                                className="blue-input"
                                value={form.clicksToDisable}
                                onChange={changeFormHandler}
                                min='0'
                            />
                            <label htmlFor="clicksToDisable" className="labelBeforeInputUrl">
                                {flags.hasClicksToDisable ? "?????????????????????? ???? ????????????" : ""}
                            </label>
                        </div>
                        <div className={flags.hasDisabledOnDateTime ? 'input-field' : 'hide'}>

                            <input
                                type={flags.hasDisabledOnDateTime ? "text" : "hidden"}
                                id="datetimeToDisable"
                                name="datetimeToDisable"
                                className="blue-input"
                                value={form.datetimeToDisable}
                                onChange={changeFormHandler}
                                onFocus={event => event.target.type = 'datetime-local'}
                                onBlur={event => event.target.type = flags.hasDisabledOnDateTime ? "text" : "hidden"}
                            />
                            <label htmlFor="datetimeToDisable" className="labelBeforeInputUrl">
                                {flags.hasDisabledOnDateTime ? "?????????????????? ????????????..." : ""}
                            </label>
                        </div>
                        <button
                            type="button"
                            className="buttonForm"
                            onClick={editLink}
                            disabled={loading}
                        >
                            ???????????????? ????????????
                        </button>
                        <button
                            type="button"
                            className="buttonFormRed"
                            onClick={deleteLink}
                            disabled={loading}
                        >
                            ?????????????? ????????????
                        </button>
                    </form>
                </section>
            </div>
        )
}