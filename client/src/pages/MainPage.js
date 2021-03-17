import React from 'react'
import {useHttp} from "../hooks/httpUtils";
import {useMessage} from "../hooks/materialToast"
import {useState} from 'react'
import {useEffect} from 'react'

export const MainPage = () => {
    const [longLink, setLongLink] = useState('')
    const [shortLink, setShortLink] = useState('')
    const {loading, request, error, clearError} = useHttp()
    const message = useMessage()
    document.title = 'Сокращатель Swappy';
    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])

    const copyButtonClickHandler = async event=> {
        if (shortLink) {
            try {
                await navigator.clipboard.writeText(`${shortLink}`)
            }
            catch (e){
                console.log('Something went wrong', e);
            }
        }
    }

    const getShortLinkButtonClick = async event => {
        try {
            const data = await request('/system/randomShortLinkModel', "POST", {link: longLink})
            setShortLink(`http://swappy.site/${data.message}`)
        }
        catch (e) {}

    }

    return (

        <article className="content">
            <section id="CutItSwappyMessage" className="largeBanner">
                <div className="largeBannerContainer">
                    <h1 id="bannerMainMessage" className="bannerMessage">
                        Режь ссылки с <span className="bolder">Swappy</span>!
                    </h1>
                    <h2 id="bannerOtherMessage" className="bannerMessage">
                        Получи все приемущества от сокращенных ссылок! Просто попробуй в форме снизу!
                    </h2>
                </div>
            </section>
            <section id="linkCutterBox" className="linkCutter">
                <h2 id="headerPromptUrl" className="bannerMessage">Вставь большую ссылку и получи поменьше =D</h2>
                <form
                    action="/system/randomShortLinkModel"
                    method="post"
                    className="inputForm"
                    id="randomShortLinkForm"
                    name="urlForm"
                >
                    <div className="flexRowContainer">
                        <label htmlFor="inputUrl" className="labelBeforeInputUrl">Длинный URL</label>
                        <input
                            type="url"
                            id="inputUrl"
                            name="urlForCut"
                            className="inputForUrl blue-input"
                            onChange={e=>setLongLink(e.target.value)}
                            required
                            placeholder="https://some.long.link.com/Some/Kind/Of/Long/Long/Url"
                        />
                        <button
                            type="button"
                            id="getShortUrl"
                            className="buttonMainForm"
                            onClick={getShortLinkButtonClick}
                        >
                            Укоротить
                        </button>
                    </div>
                    <div className="flexRowContainer">
                        <label htmlFor="outputUrl" className="labelBeforeInputUrl">Короткий URL</label>
                        <input
                            type="url"
                            id="outputUrl"
                            name="shortUrl"
                            className="inputForUrl"
                            value={shortLink}
                            readOnly
                            placeholder="https://swappy.site/qwerty1337"
                        />
                        <button
                            type="button"
                            id="copyButton"
                            className="buttonMainForm"
                            onClick={copyButtonClickHandler}
                        >
                            Копировать
                        </button>
                    </div>
                </form>
            </section>
            <section id="wannaMore" className="largeBanner">
                <div className="largeBannerContainer">
                    <h2 id="wannaMoreFirst" className="bannerMessage">Хочешь большего?</h2>
                    <h3 id="wannaMoreSecond" className="bannerMessage">Зарегистрируйся или авторизуйся и получи полный
                        контроль над созданными ссылками!</h3>
                </div>
            </section>
        </article>
    )
}