import React, {useContext, useEffect, useRef, useState} from 'react';
import {Card} from 'primereact/card';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import StateContext from '../util/context/StateContext';
import {Button} from 'primereact/button';
import SelectLanguage from './layout/SelectLanguage';
import {InputText} from 'primereact/inputtext';
import {Editor} from 'primereact/editor';
import {TreeTable} from 'primereact/treetable';
import {Column} from 'primereact/column';
import {HadithService} from '../service/HadithService';
import {Functions} from '../util/Functions';
import {Toast} from 'primereact/toast';
import {ProgressBar} from "primereact/progressbar";
import {Messages} from "primereact/messages";
import {Dialog} from 'primereact/dialog';
import {HadithEditor} from './layout/HadithEditor';
import {ProductService} from "../service/ProductService";
import {DataTable} from "primereact/datatable";
import {Divider} from "primereact/divider";
import {Accordion, AccordionTab} from "primereact/accordion";

export const HadithDetail = () => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext)
    const messages = useRef(null)
    const [displayBasic, setDisplayBasic] = useState(false)
    const [langId, setLangId] = useState(appState.langId)
    const childFunc = useRef(null)
    const [hadithText, setHadithText] = useState('')
    const [source, setSource] = useState('')
    const [explanation, setExplanation] = useState('')
    const [selectedNodeKeys, setSelectedNodeKeys] = useState([])
    const [hadithParts, setHadithParts] = useState([])
    const [showProgress, setShowProgress] = useState(false)

    const hadithService = new HadithService();


    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <div className="flex align-items-center justify-content-between">
                <Button icon="pi pi-arrow-left" className="p-button-text" onClick={(event) => history.goBack()}/>
                <h5 className="m-0">{t('hadithes')}</h5>
            </div>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
        </div>
    )


    const onSubmitHadith = (data) => {

        let hadith = Functions.clone(data)
        hadith.childiren = hadithParts
        console.log(hadith)
        // hadithService.store(hadith, appState.admin.token).then((response) => {
        //     if (response.status !== undefined) {
        //         if (response.status === "ok") {
        //             setHadithText('')
        //             setSource('')
        //             setExplanation('')
        //             setSelectedNodeKeys([])
        //         }
        //         messages.current.show([response.message]);
        //     } else {
        //         messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
        //     }
        // }).catch((e) => {
        //     messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
        // }).finally(() => {
        //     setShowProgress(false);
        // });
    }

    const onAddHadithPart = (hadith) => {
        setHadithParts(prevArray => [...prevArray, hadith])
        setDisplayBasic(false)
        // console.log([...[], hadith])
    }

    // useEffect(() => {
    //     console.log(hadithParts)
    // }, [hadithParts])

    return (
        <div className="grid">

            <Button label="Long Content" icon="pi pi-external-link" onClick={() => setDisplayBasic(true)}/>

            <Dialog header="Header" visible={displayBasic} style={{width: '50vw'}} onHide={() => setDisplayBasic(false)}>
                <HadithEditor langId={langId}
                              saveHadith={hadith => onSubmitHadith(hadith)} saveHadithPart={hadith => onAddHadithPart(hadith)}
                              childFunc={childFunc} />
                <br/>
            </Dialog>

            <div className="col-12">
                <Card header={cardHeader}>

                    {showProgress ? (
                        <ProgressBar mode="indeterminate" style={{height: "3px"}}/>
                    ) : (
                        <></>
                    )}

                    <Messages ref={messages}/>

                    <HadithEditor langId={langId} hadithParts={hadithParts}
                                  saveHadith={hadith => onSubmitHadith(hadith)} saveHadithPart={hadith => onAddHadithPart(hadith)}
                                  childFunc={childFunc} isMain={true}/>

                    <div className="field col-12">
                        <Accordion>
                            {
                                hadithParts.map((item, index)=>{
                                    return (
                                        <AccordionTab key={index} header="Mehdi, Cikis">
                                            <div>
                                                <b>{t('hadith')}:</b> <br/>
                                                {item.hadith_text}
                                                <br/>
                                                ({item.source})
                                            </div>
                                            <Divider />
                                            <div>
                                                <b>{t('explanation')}:</b>  <br/>
                                                {item.explanation}
                                            </div>
                                            <Divider />
                                            <div>
                                                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" />
                                                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" style={{marginLeft: 5}}/>
                                            </div>
                                        </AccordionTab>
                                    );
                                })
                            }
                        </Accordion>

                    </div>


                    <div className="field col-12">
                        <Button onClick={() => childFunc.current()} label={t('add')} className="p-button-outlined"/>
                    </div>
                </Card>
            </div>

        </div>
    );
}
