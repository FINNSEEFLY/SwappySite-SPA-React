import React, {useCallback, useContext, useEffect, useState} from 'react'
import {LinkListView} from "./LinkListView";
import {FullLinkInfo} from "./FullLinkInfo";
import {useHttp} from "../hooks/httpUtils"
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/materialToast";
import {useHistory} from "react-router-dom";

export const LinkControlPanel = () => {
    const history = useHistory()
    const {request, error, clearError} = useHttp()
    const [linksForListView, setLinksForListView] = useState()
    const [detailInfo, setDetailInfo] = useState([])
    const [selectedItem, setSelectedItem] = useState(0)
    const message = useMessage()
    const auth = useContext(AuthContext)

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])


    useEffect(async () => {
        await loadLinks();
    }, [])


    const loadLinks = useCallback(async () => {
        const data = await request("/system/link/getAllLinks", "POST", null,
            {Authorization: `Bearer ${auth.token}`})
        if (data.statusCode === 401) {
            auth.logout()
            history.push("/system/login")
        }
        setLinksForListView(data.forListInfo)
        setDetailInfo(data.detailInfo)
    }, [detailInfo, linksForListView, selectedItem])

    const openDetailView = (index) => {
        setSelectedItem(index)
    }
    const updateInfo = async () => {
        setSelectedItem(0);
        setDetailInfo([])
        await loadLinks();
    }

    return (
        <div className="controlPanel">
            <LinkListView
                params={{
                    links: linksForListView,
                    openDetailView: openDetailView,
                    selectedIndex: selectedItem,
                    updateInfo
                }}
            />
            <FullLinkInfo params={{detailInfo: detailInfo[selectedItem], updateInfo}}/>
        </div>
    )
}