import React from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {MyLinksPage} from "./pages/MyLinksPage";
import {CreateLinksPage} from "./pages/CreateLinksPage";
import {MainPage} from "./pages/MainPage";
import {RegisterPage} from "./pages/RegisterPage";
import {LoginPage} from "./pages/LoginPage";

export const useRoutes = isAuthenticated => {
    if (isAuthenticated) {
        return (
            <Switch>
                <Route exact path="/system/myLinks">
                    <MyLinksPage/>
                </Route>
                <Route exact path="/system/createLinks">
                    <CreateLinksPage/>
                </Route>
                <Route exact path="/">
                    <MainPage/>
                </Route>
                <Redirect to="/">

                </Redirect>
            </Switch>
        )
    }
    return (
        <Switch>
            <Route exact path="/system/login">
                <LoginPage/>
            </Route>
            <Route exact path="/system/register" >
                <RegisterPage/>
            </Route>
            <Route path="/" exact>
                <MainPage/>
            </Route>
            <Redirect to="/"/>
        </Switch>
    )
}