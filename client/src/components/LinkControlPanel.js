import React from 'react'
import {LinkView} from "./LinkView";
import {FullLinkInfo} from "./FullLinkInfo";

export const LinkControlPanel = () => {
    return (
        <div className="controlPanel">
            <LinkView links={
                [
                    {shortUrl: "sdfd", longUrl:"asdawdw"},
                    {shortUrl: "sdfd", longUrl:"asdawdw"},
                    {shortUrl: "sdfd", longUrl:"asdawdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                    {shortUrl: "sdfd", longUrl:"asdawkajlsdhfakjsfhasejkfhjaskefakjsefasekfhasejkfdw"},
                ]
            }/>
            <FullLinkInfo/>
        </div>
    )
}