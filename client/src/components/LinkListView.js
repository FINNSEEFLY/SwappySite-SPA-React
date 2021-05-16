import React, {useEffect} from "react";

export const LinkListView = ({params}) => {
    useEffect(()=>{
        console.log(params)
    })
    if (params.links===undefined || params.links.length===0)
        return(
            <div className="linkViewContainer">
            <div className="linksContainer">
                <h3 className="header-in-link-container">Нет ссылок для отображения</h3>
            </div>
            <div className="buttonUpdate">
                <button type="button" className="buttonForm" onClick={params.updateInfo}>Обновить</button>
            </div>
        </div>);
    else
    return (
        <div className="linkViewContainer">
            <div className="linksContainer">
                {params.links.map((link, index) => {
                    return (
                        <div onClick={() => params.openDetailView(index)}
                             className={`${params.selectedIndex === index ? "active-link-box" : ""} oneLink`}>
                            <div>
                                <div className="linkFromListViewLine"><span>{index + 1}</span> ссылка (создана: {link.creationTime})</div>
                            </div>
                            <div>
                                <div
                                    className="linkFromListViewLine">Короткая: <span>https://{window.location.hostname + "/" + link.shortUrl}</span>
                                </div>
                            </div>
                            <div>
                                <div className="linkFromListViewLine">Длинная: <span>{link.longUrl}</span></div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="buttonUpdate">
                <button type="button" className="buttonForm" onClick={params.updateInfo}>Обновить</button>
            </div>
        </div>
    )


}