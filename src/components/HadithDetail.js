import React, {useContext, useEffect, useRef, useState} from 'react';
import {Card} from 'primereact/card';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import StateContext from '../util/context/StateContext';
import {Button} from 'primereact/button';
import SelectLanguage from './layout/SelectLanguage';
import {HadithService} from '../service/HadithService';
import {Functions} from '../util/Functions';
import {ProgressBar} from "primereact/progressbar";
import {Messages} from "primereact/messages";
import {Dialog} from 'primereact/dialog';
import {HadithEditor} from './layout/HadithEditor';
import {Divider} from "primereact/divider";
import {Accordion, AccordionTab} from "primereact/accordion";
import {Tag} from "primereact/tag";

export const HadithDetail = () => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext)
    const messages = useRef(null)
    const [displayBasic, setDisplayBasic] = useState(false)
    const [langId, setLangId] = useState(appState.langId)
    const childFunc = useRef(null)
    const [hadithParts, setHadithParts] = useState([])
    const [showProgress, setShowProgress] = useState(false)
    const [hIndexNodes, setHIndexNodes] = useState([]);
    const emptyEditorData = {hadithText:'', source:'', explanation:'', selectedNodeKeys:[], selectedNodes:[]}
    const [dataAddHadithEditor, setDataAddHadithEditor] = useState(emptyEditorData)

    const hadithService = new HadithService()

    useEffect(() => {
        hadithService.allIndex(langId).then(response => {
            if (response.status === 'ok') {
                setHIndexNodes(Functions.clone(response.list))
            }
        }).finally(() => setShowProgress(false))
    }, [langId]); // eslint-disable-line react-hooks/exhaustive-deps

    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <div className="flex align-items-center justify-content-between">
                <Button icon="pi pi-arrow-left" className="p-button-text" onClick={(event) => history.goBack()}/>
                <h5 className="m-0">{t('hadithes')}</h5>
            </div>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
        </div>
    )

    const sendHadith = (typeMethod, data) => {
        if (typeMethod === "save") {
            let hadith = Functions.clone(data)
            if (hadithParts.length === 0 && hadith.hIndexNodes.length === 0) {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("index_must_select_or_add_hadith_part"), sticky: true,},])
            } else {
                hadith.childiren = hadithParts
                console.log(hadith)
                hadithService.store(hadith, appState.admin.token).then((response) => {
                    if(response.status === "ok") {

                    }
                }).catch((e) => {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
                }).finally(() => {
                    setShowProgress(false);
                });
            }
        }

        if (typeMethod === "addPart") {
            setHadithParts(prevArray => [...prevArray, data])
            setDisplayBasic(false)
        }

        if (typeMethod === "openAddPart") {
            setDataAddHadithEditor({hadithText: data.hadith_text , source:data.source, explanation:'', selectedNodeKeys:[], selectedNodes:[]})
            setDisplayBasic(true)
        }
    }


    const addNewIndex = (requestBody) => {
        hadithService.storeIndex(requestBody, appState.admin.token).then(response => {
            if (response.status === "ok") {
                setHIndexNodes(response.list)
            }
        })
    }

    const saveEditIndex = (id, requestBody) => {
        hadithService.updateIndex(id, requestBody, appState.admin.token).then(response => {
            if (response.status === "ok") {
                setHIndexNodes(response.list)
            }
        })
    }

    const confirmDeleteRow = (row) => {
        hadithService.removeIndex(row.id, langId, appState.admin.token).then((response) => {
            if (response.status === "ok") {
                setHIndexNodes(response.list)
            }
        })
    };


    return (
        <div className="grid">

            <Dialog header={t('hadith_part')} visible={displayBasic} style={{width: '60vw'}} onHide={() => setDisplayBasic(false)}>
                <HadithEditor langId={langId} data={dataAddHadithEditor} sendHadith={sendHadith}
                              nodes={hIndexNodes} childFunc={childFunc} addNewIndex={addNewIndex} saveEditIndex={saveEditIndex} confirmDeleteRow={confirmDeleteRow} />
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

                    <HadithEditor langId={langId} data={emptyEditorData}
                                  hadithParts={hadithParts} nodes={hIndexNodes} sendHadith={sendHadith}
                                  childFunc={childFunc} addNewIndex={addNewIndex} saveEditIndex={saveEditIndex} confirmDeleteRow={confirmDeleteRow} isMain={true}/>

                    <div className="p-fluid formgrid grid">
                        <div className="field col-9"/>
                        <div className="field col-3">
                            <Button style={{float:"right"}}  onClick={() => childFunc.current("openAddPart")} label={t('add_hadith_part')} className="p-button-outlined"/>
                        </div>
                        <div className="field col-12">
                            <Accordion>
                                {
                                    hadithParts.map((item, index)=>{
                                        return (
                                            <AccordionTab key={index} header={
                                                item.hIndexNodes.map((value, index) => {
                                                    return <Tag key={index} severity="warning" className="p-1" value={value.data.name} />
                                                })
                                            }>
                                                <div>
                                                    <b>{t('hadith')}:</b>
                                                    <br/>
                                                    <div dangerouslySetInnerHTML={{ __html: item.hadith_text }} />
                                                    <i>({item.source})</i>
                                                </div>
                                                <Divider />
                                                <div>
                                                    <b>{t('explanation')}:</b>  <br/>
                                                    <div dangerouslySetInnerHTML={{ __html: item.explanation }} />
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
                            <Button onClick={() => childFunc.current("save")} label={t('save')} className="p-button-outlined"/>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
