import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Editor} from 'primereact/editor';
import {TreeTable} from 'primereact/treetable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Messages} from "primereact/messages";

export const HadithEditor = (props) => {
    const {t} = useTranslation()
    const messages = useRef(null)
    const toastBC = useRef(null)
    const toast = useRef(null)
    const [hadithText, setHadithText] = useState(props.data.hadithText)
    const [source, setSource] = useState(props.data.source)
    const [explanation, setExplanation] = useState(props.data.explanation)
    const [selectedNodeKeys, setSelectedNodeKeys] = useState(props.data.selectedNodeKeys)
    const [selectedNodes, setSelectedNodes] = useState(props.data.selectedNodes)
    const [globalFilter, setGlobalFilter] = useState(null)
    const [newIndex, setNewIndex] = useState('')
    const [newIndexBool, setNewIndexBool] = useState(false)
    const [newIndexParentKey, setNewIndexParentKey] = useState(null)
    const [editIndex, setEditIndex] = useState('')
    const [editIndexParentKey, setEditIndexParentKey] = useState(null)


    useEffect(() => {
        props.childFunc.current = saveHadith
    }, [props.hadithParts, selectedNodeKeys, hadithText, source, explanation]) // eslint-disable-line react-hooks/exhaustive-deps

    const saveHadith = (typeMethod) => {
        let error = false
        if (selectedNodes.length === 0 && props.isMain === undefined) {
            error = true
            messages.current.show([{severity: "error", summary: t("error"), detail: t("index_must_select"), sticky: true,},])
        }
        if (source === "") {
            error = true
            messages.current.show([{severity: "error", summary: t("error"), detail: t("source_is_empty"), sticky: true,},])
        }
        if (hadithText === "") {
            error = true
            messages.current.show([{severity: "error", summary: t("error"), detail: t("hadith_is_empty"), sticky: true,},])
        }
        if(!error) {
            let hadith = {
                lang_id: props.langId,
                hadith_text: hadithText,
                source,
                explanation,
                hIndexNodes: selectedNodes
            }
            props.sendHadith(typeMethod, hadith)
        } else {
            if (props.isMain === undefined)
                document.getElementById("pr_id_2_content").scrollTo(0, 0)
            else
                window.scrollTo(0, 0);
        }
    }

    const addNewIndex = () => {
        if (newIndex === '') {
            setNewIndexBool(false)
            setNewIndexParentKey(null)
        } else {
            let requestBody = {
                lang_id: props.langId,
                name: newIndex,
                parent_id: newIndexParentKey
            };
            props.addNewIndex(requestBody)
            setNewIndex('')
            setNewIndexBool(false)
            setNewIndexParentKey(null)
        }
    }

    const saveEditIndex = (id) => {
        if (editIndex === '') {
            setEditIndexParentKey(null)
        } else {
            let requestBody = {
                lang_id: props.langId,
                name: editIndex,
            };
            props.saveEditIndex(id, requestBody)
            setEditIndex('')
            setEditIndexParentKey(null)
        }
    }


    // const confirmDeleteRow = (row) => {
    //     // messages.current.clear();
    //     hadithService.removeIndex(row.id, props.langId, appState.admin.token).then((response) => {
    //         if (response.status !== undefined) {
    //             if (response.status === "ok") {
    //                 // setNodes(response.list);
    //             }
    //         } else {
    //         }
    //     }).catch((e) => {
    //         console.log(e);
    //     })
    //     toastBC.current.clear()
    // };

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
                            <Button type="button" label={t('yes')} className="p-button-success" style={{marginRight: 5}} onClick={() => props.confirmDeleteRow(row)}/>
                        </div>
                        <div className="p-col-6">
                            <Button type="button" label={t('no')} className="p-button-secondary" onClick={() => toastBC.current.clear()}/>
                        </div>
                    </div>
                </div>
            )
        });
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


    const onSelect = (event) => {
        setSelectedNodes(prevArray => [...prevArray, event.node])
    }

    const onUnselect = (event) => {
        setSelectedNodes(prevArray => prevArray.filter(item => item.key !== event.node.key))
    }

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

                    <Messages className="field col-12" ref={messages} />

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
                        <TreeTable globalFilter={globalFilter} header={header} value={props.nodes} selectionMode="checkbox"
                                   selectionKeys={selectedNodeKeys} onSelectionChange={e => setSelectedNodeKeys(e.value)}
                                   onSelect={onSelect} onUnselect={onUnselect}
                                   emptyMessage={t("no_records_found")}>
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
                                <Button onClick={(e) => {saveHadith("addPart"); e.preventDefault();}} label={t('add')} className="p-button-outlined"/>
                            </div>
                        :
                            <></>
                    }

                </div>

            </div>
        </div>
    );
}
