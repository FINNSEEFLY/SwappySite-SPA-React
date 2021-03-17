import React from 'react'
import {LinkControlPanel} from "../components/LinkControlPanel";

export const MyLinksPage = () => {
    document.title = 'Мои ссылки';
    return (
        <article className="container">
         <LinkControlPanel/>
        </article>
    )
}