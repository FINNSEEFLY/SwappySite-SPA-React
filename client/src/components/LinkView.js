import React from "react";

export const LinkView = ({links}) => {
    return (
        <div className="linksContainer">
            {links.map((link, index) => {
                return (
                    <div className='oneLink'>
                        <div>
                            <div>{index + 1}</div>
                        </div>
                        <div>
                            <div>{link.shortUrl}</div>
                        </div>
                        <div>
                            <div>{link.longUrl}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )


}