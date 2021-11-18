import React, { useContext, useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import StateContext from '../util/context/StateContext';
import { Button } from 'primereact/button';
import SelectLanguage from './layout/SelectLanguage';
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import { NodeService } from '../service/NodeService';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';

export const HadithDetail = () => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext);
    const messages = useRef(null);
    const [langId, setLangId] = useState(appState.langId)
    const [hadithText, setHadithText] = useState('')
    const [explanation, setExplanation] = useState('')
    const [globalFilter, setGlobalFilter] = useState(null);
    const [deleteRow, setDeleteRow] = useState({})
    const [newIndex, setNewIndex] = useState('')
    const [newIndexBool, setNewIndexBool] = useState(false)


    const [nodes, setNodes] = useState([]);
    const [selectedNodeKeys, setSelectedNodeKeys] = useState([]);
    const toast = useRef(null);
    const nodeservice = new NodeService();

    const onSelect = (event) => {
        toast.current.show({ severity: 'info', summary: 'Node Selected', detail: event.node.data.name });
    }

    const onUnselect = (event) => {
        toast.current.show({ severity: 'info', summary: 'Node Unselected', detail: event.node.data.name });
    }

    useEffect(() => {
        nodeservice.getTreeTableNodes().then(data => setNodes(data));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    

    const getHeader = (globalFilterKey) => {
        return (
            <div className="p-text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => treeTableFuncMap[`${globalFilterKey}`](e.target.value)} placeholder={t('filter')} size="50" />
                </div>
            </div>
        );
    }

    let header = getHeader('globalFilter');

    const confirmDeleteRow = () => {
        messages.current.clear();
        
        onHideDialog();
    };
    

    const editRow = (row) => {
        console.log(row);
    }

    const onHideDialog = () => {
        setDeleteRow({});
    };

    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <div className="flex align-items-center justify-content-between">
                <Button icon="pi pi-arrow-left" className="p-button-text" onClick={(event) => history.goBack()} />
                <h5 className="m-0">{t('hadithes')}</h5>
            </div>
            <SelectLanguage value={langId}  onChange={(e) => setLangId(e.value)}/>
        </div>
    );

    const treeTableFuncMap = {
        'globalFilter': setGlobalFilter
    };

    const actionTemplate = (node, column) => {
        return (
            <div>
                <Button icon="pi pi-pencil"  className="p-button-rounded p-button-success p-mr-2"
                    onClick={() => editRow(node.data) } />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => setDeleteRow(node.data)}
                    disabled={ node.children !== undefined }
                style={{marginLeft:5}} />
            </div>
        );
    };

    const addNewIndex = () => {
        setNewIndexBool(false)
    }


    return (
        <div className="grid">
            <div className="col-12">
            <Card header={cardHeader}>
                <div className="p-fluid formgrid grid">
                    <div className="field col-12">
                        <Editor style={{ height: '320px' }} onTextChange={(e) => setHadithText(e.htmlValue)} placeholder={t('hadith')}/>
                    </div>
                    <div className="field col-12">
                        <InputText id="source" type="text" max={255} placeholder={t('source')}/>
                    </div>
                    <div className="field col-12">
                    <TreeTable globalFilter={globalFilter} globalFilter={globalFilter} header={header} value={nodes} selectionMode="checkbox" selectionKeys={selectedNodeKeys} onSelectionChange={e => setSelectedNodeKeys(e.value)}>
                        <Column header={t('hadith_index')} field="name" expander></Column>
                        <Column header={
                            newIndexBool ? 
                            <div className="flex align-items-center justify-content-between">
                                <InputText id="in" placeholder={t('new')} value={newIndex} onChange={(e) => setNewIndex(e.target.value)} />
                                <Button icon="pi pi-check" onClick={()=> addNewIndex()} />
                            </div>
                            :
                            <Button icon="pi pi-plus"  className="p-button-rounded p-mr-2" onClick={()=>{setNewIndexBool(true)}} />
                        } body={actionTemplate} className="text-right" />
                    </TreeTable>
                    </div>
                    <div className="field col-12">
                        <Editor style={{ height: '320px' }} value={explanation} onTextChange={(e) => setExplanation(e.htmlValue)} placeholder={t('explanation')}/>
                    </div>
                </div>
            </Card>
            </div>
        </div>
    );
}
