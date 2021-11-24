import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Editor} from 'primereact/editor';
import {TreeTable} from 'primereact/treetable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {ProgressBar} from "primereact/progressbar";
import {Messages} from "primereact/messages";
import SelectLanguage from './SelectLanguage';
import StateContext from '../../util/context/StateContext';
import {HadithService} from '../../service/HadithService';
import {Functions} from '../../util/Functions';

export const HadithEditor = (props) => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext);
    const messages = useRef(null)
    const toastBC = useRef(null)
    const toast = useRef(null)
    const [showProgress, setShowProgress] = useState(true)
    // const [langId, setLangId] = useState(props.langId)
    const [hadithText, setHadithText] = useState('')
    const [source, setSource] = useState('')
    const [explanation, setExplanation] = useState('')
    const [selectedNodeKeys, setSelectedNodeKeys] = useState([])
    const [globalFilter, setGlobalFilter] = useState(null)
    const [newIndex, setNewIndex] = useState('')
    const [newIndexBool, setNewIndexBool] = useState(false)
    const [newIndexParentKey, setNewIndexParentKey] = useState(null)
    const [editIndex, setEditIndex] = useState('')
    const [editIndexParentKey, setEditIndexParentKey] = useState(null)


    const [nodes, setNodes] = useState([]);
    const hadithService = new HadithService();


    useEffect(() => {
        hadithService.allIndex(props.langId).then(response => {
            if (response.status === 'ok') {
                setNodes(Functions.clone(response.list))
            }
        }).finally(() => setShowProgress(false));
    }, [props.langId]); // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        props.childFunc.current = saveHadith
    }, [props.hadithParts])

    const saveHadith = (type) => {
        let hadith = {
            lang_id: props.langId,
            hadith_text: hadithText,
            source,
            explanation,
            hindexes: selectedNodeKeys
        }
        if (type === "part") {
            props.saveHadithPart(hadith)
        } else {
            props.saveHadith(hadith)
        }
    }

    const addNewIndex = () => {
        let requestBody = {
            lang_id: props.langId,
            name: newIndex,
            parent_id: newIndexParentKey
        };
        if (newIndex === '') {
            setNewIndexBool(false)
            setNewIndexParentKey(null)
        } else {
            hadithService.storeIndex(requestBody, appState.admin.token).then(response => {
                if (response.status === "ok") {
                    setNodes(response.list)
                    setNewIndex('')
                    setNewIndexBool(false)
                    setNewIndexParentKey(null)
                }
            })
        }
    }

    const saveEditIndex = (id) => {
        let requestBody = {
            lang_id: props.langId,
            name: editIndex,
        };
        if (editIndex === '') {
            setEditIndexParentKey(null)
        } else {
            hadithService.updateIndex(id, requestBody, appState.admin.token).then(response => {
                if (response.status === "ok") {
                    setNodes(response.list)
                    setEditIndex('')
                    setEditIndexParentKey(null)
                }
            })
        }
    }


    const confirmDeleteRow = (row) => {
        // messages.current.clear();

        hadithService.removeIndex(row.id, props.langId, appState.admin.token).then((response) => {
            if (response.status !== undefined) {
                if (response.status === "ok") {
                    setNodes(response.list);
                }
            } else {
            }
        }).catch((e) => {
            console.log(e);
        })
        toastBC.current.clear()
    };

    const showConfirmDelete = (row) => {
        toastBC.current.show({
            severity: 'warn', sticky: true, content: (
                <div className="p-flex p-flex-column" style={{flex: '1'}}>
                    <div style={{textAlign: 'center'}}>
                        <i className="pi pi-exclamation-triangle" style={{fontSize: '3rem'}}/>
                        <h6>{t("confirmation_delete").replaceAll(":attribute", row.name)}</h6>
                    </div>
                    <div className="flex align-items-center justify-content-end">
                        <div className="p-col-6 ">
                            <Button type="button" label={t('yes')} className="p-button-success" style={{marginRight: 5}} onClick={() => confirmDeleteRow(row)}/>
                        </div>
                        <div className="p-col-6">
                            <Button type="button" label={t('no')} className="p-button-secondary" onClick={() => toastBC.current.clear()}/>
                        </div>
                    </div>
                </div>
            )
        });
    }


    const onSubmit = (e) => {
        window.scrollTo(0, 0);
        setShowProgress(true);
        messages.current.clear();

        let requestBody = {
            lang_id: props.langId,
            hadith_text: hadithText,
            source,
            explanation,
            hindexes: selectedNodeKeys
        };
        hadithService.store(requestBody, appState.admin.token).then((response) => {
            if (response.status !== undefined) {
                if (response.status === "ok") {
                    setHadithText('')
                    setSource('')
                    setExplanation('')
                    setSelectedNodeKeys([])
                }
                messages.current.show([response.message]);
            } else {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
            }
        }).catch((e) => {
            messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
        }).finally(() => {
            setShowProgress(false);
        });
        e.preventDefault();
    }


    const treeTableFuncMap = {
        'globalFilter': setGlobalFilter
    };

    const getHeader = (globalFilterKey) => {
        return (
            <div className="p-text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => treeTableFuncMap[`${globalFilterKey}`](e.target.value)} placeholder={t('filter')} size="50"/>
                </div>
            </div>
        );
    }

    let header = getHeader('globalFilter');

    const actionTemplate = (node, column) => {
        return (
            <div className="flex align-items-center justify-content-end">
                {
                    node.key === newIndexParentKey ?
                        <>
                            <InputText id="in" placeholder={t('new')} value={newIndex} onChange={(e) => setNewIndex(e.target.value)} style={{width: "70%"}}/>
                            <Button icon="pi pi-check" onClick={() => addNewIndex()}/>
                        </>
                        :
                        <Button icon="pi pi-plus" className="p-button-rounded" onClick={() => {
                            setNewIndexParentKey(node.key)
                        }}/>
                }
                {
                    node.key === editIndexParentKey ?
                        <>
                            <InputText id="in" value={editIndex} onChange={(e) => setEditIndex(e.target.value)} style={{width: "70%", marginLeft: 5}}/>
                            <Button icon="pi pi-check" className="p-button-success p-mr-2" onClick={() => saveEditIndex(node.key)}/>
                        </>
                        :
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" style={{marginLeft: 5}}
                                onClick={() => {
                                    setEditIndex(node.data.name);
                                    setEditIndexParentKey(node.key)
                                }}/>
                }

                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => showConfirmDelete(node.data)}
                        disabled={node.children.length !== 0}
                        style={{marginLeft: 5}}/>
            </div>
        );
    };


    return (
        <div className="grid">
            <Toast ref={toast}/>
            <Toast ref={toastBC} position="bottom-center"/>
            <div className="col-12">

                <div className="p-fluid formgrid grid">
                    {showProgress ? (
                        <ProgressBar mode="indeterminate" style={{height: "3px"}}/>
                    ) : (
                        <></>
                    )}

                    <Messages ref={messages} />

                    <div className="field col-12">
                        <Editor style={{height: '320px'}} value={hadithText} onTextChange={(e) => setHadithText(e.htmlValue)} placeholder={t('hadith')}/>
                    </div>

                    <div className="field col-12">
                        <InputText id="source" type="text" value={source} onChange={(e) => setSource(e.target.value)} max={255} placeholder={t('source')}/>
                    </div>

                    <div className="field col-12">
                        <Editor style={{height: '320px'}} value={explanation} onTextChange={(e) => setExplanation(e.htmlValue)} placeholder={t('explanation')}/>
                    </div>

                    <div className="field col-12">
                        <TreeTable globalFilter={globalFilter} header={header} value={nodes} selectionMode="checkbox" selectionKeys={selectedNodeKeys} onSelectionChange={e => setSelectedNodeKeys(e.value)} emptyMessage={t("no_records_found")}>
                            <Column header={t('hadith_index')} field="name" expander/>
                            <Column header={
                                newIndexBool ?
                                    <div className="flex align-items-center justify-content-between">
                                        <InputText id="in" placeholder={t('new')} value={newIndex} onChange={(e) => setNewIndex(e.target.value)}/>
                                        <Button icon="pi pi-check" onClick={() => addNewIndex()}/>
                                    </div>
                                    :
                                    <Button icon="pi pi-plus" className="p-button-rounded p-mr-2" onClick={() => {
                                        setNewIndexBool(true)
                                    }}/>
                            } body={actionTemplate} className="text-right"/>
                        </TreeTable>
                    </div>

                    {
                        props.isMain === undefined ?
                            <div className="field col-12">
                                <Button onClick={(e) => {saveHadith("part"); e.preventDefault();}} label={t('add')} className="p-button-outlined"/>
                            </div>
                        :
                            <></>
                    }

                </div>

            </div>
        </div>
    );
}
