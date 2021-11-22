import React, {useContext, useRef, useState} from 'react';
import {Card} from 'primereact/card';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import StateContext from '../util/context/StateContext';
import {Button} from 'primereact/button';
import SelectLanguage from './layout/SelectLanguage';

export const Hadithes = () => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext);
    const messages = useRef(null);
    const [langId, setLangId] = useState(appState.langId)

    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">{t('hadithes')}</h5>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
            <Button icon="pi pi-plus" className="p-button-text" onClick={(e) => history.push('/hadith/add')}/>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card header={cardHeader}>
                    <p>Use this page to start from scratch and place your custom content.</p>
                </Card>
            </div>
        </div>
    );
}
