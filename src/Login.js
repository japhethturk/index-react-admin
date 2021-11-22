import {InputText} from 'primereact/inputtext';
import React, {useContext, useRef, useState} from 'react';
import {Card} from 'primereact/card';
import {Password} from "primereact/password";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";
import {Messages} from "primereact/messages";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import DispatchContext from './util/context/DispatchContext';
import {AuthService} from './service/AuthService';
import {Functions} from './util/Functions';


const Login = () => {
    const {t} = useTranslation()
    const appDispatch = useContext(DispatchContext)
    const authService = new AuthService()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemmeber] = useState(false)
    const [emailClass, setEmailClass] = useState('')
    const [passwordClass, setPasswordClass] = useState('')
    const messages = useRef(null)


    const onSubmit = (e) => {
        setEmailClass("");
        setPasswordClass("");
        let haveProblem = false;
        if (email === "") {
            haveProblem = true;
            setEmailClass("p-invalid");
        } else {
            if (!email.includes("@")) {
                haveProblem = true;
                setEmailClass("p-invalid");
            }
        }
        if (password.length < 5) {
            haveProblem = true;
            setPasswordClass("p-invalid");
        }

        if (!haveProblem) {
            let requestBody = {email, password};
            messages.current.clear();
            authService
                .login(requestBody)
                .then((response) => {
                    if (response.status !== undefined) {
                        if (response.status === "ok") {
                            if (remember === true) {
                                let cipher = Functions.cipher(process.env.REACT_APP_NAME);
                                Cookies.set("ADMIN_MAIL", email, {expires: parseInt(process.env.REACT_APP_EXPIRE_COOKIE_DAY),});
                                Cookies.set("ADMIN_PASSWORD", cipher(password), {expires: parseInt(process.env.REACT_APP_EXPIRE_COOKIE_DAY),});
                            }
                            appDispatch({type: "loginAdmin", data: response.user,});
                        } else {
                            messages.current.show([response.message]);
                        }
                    } else {
                        messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                    }
                })
                .catch((e) => {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
                })
        }
        e.preventDefault();
    }

    const inputGroupStyle = {marginTop: 25}

    return (
        <div className="grid">
            <div className="col-12 md:col-2 lg:col-4"/>
            <div className="col-12 md:col-8 lg:col-4">
                <Card style={{marginTop: "20%"}}>
                    <div className="p-mb-3 p-text-center">
                        <h2>{t('login')}</h2>
                    </div>
                    <div className="p-mb-3">
                        <Messages ref={messages}/>
                    </div>
                    <div className="p-inputgroup" style={inputGroupStyle}>
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-envelope"/>
                        </span>
                        <InputText className={emailClass} placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="p-inputgroup" style={inputGroupStyle}>
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-key"/>
                        </span>
                        <Password className={passwordClass} placeholder={t("password")} feedback={false} toggleMask value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="p-inputgroup" style={inputGroupStyle}>
                        <div className="p-field-checkbox">
                            <Checkbox inputId="binary" checked={remember} onChange={e => setRemmeber(e.checked)}/>
                            <label htmlFor="binary">{t("remember_me")}</label>
                        </div>
                    </div>
                    <div className="p-inputgroup" style={inputGroupStyle}>
                        <Button onClick={(e) => {
                            onSubmit(e)
                        }} style={{width: "100%"}} label={t("login")} className="p-button-outlined"/>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-2 lg:col-4"/>
        </div>
    );
}

export default Login;
