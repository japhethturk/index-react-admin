import React, {useContext, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import {useTranslation} from "react-i18next";
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";
import {Messages} from "primereact/messages";
import {useHistory} from "react-router-dom";
import {InputText} from "primereact/inputtext";
import {Dialog} from "primereact/dialog";
import StateContext from "../util/context/StateContext";
import {CategoryService} from "../service/CategoryService";
import SelectLanguage from "./layout/SelectLanguage";


const Categories = (props) => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext);
    const messages = useRef(null);
    const [categories, setCategories] = useState([])
    const [showProgress, setShowProgress] = useState(true)
    const [globalFilter, setGlobalFilter] = useState(null)
    const [deleteRow, setDeleteRow] = useState({})
    const [langId, setLangId] = useState(appState.langId)
    const dateFormat = require("dateformat");


    const categoryService = new CategoryService();

    useEffect(() => {
        categoryService.allTable(langId).then((response) => {
            if (response.status === "ok") {
                setCategories(response.categories);
            } else if (response.status === "error") {
                messages.current.show([response.message]);
            } else {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
            }
        })
            .catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            })
            .finally(() => {
                setShowProgress(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [langId]);


    const getHeader = () => {
        return (
            <div className="p-text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText
                        style={{width: "100%"}}
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder={t("search")}
                    />
                </div>
            </div>
        );
    };

    const confirmDeleteRow = () => {
        messages.current.clear();
        setShowProgress(true);
        categoryService.remove(deleteRow.id, langId, appState.admin.token).then((response) => {
            if (response.status !== undefined) {
                if (response.status === "ok") {
                    setCategories(response.categories);
                }
                messages.current.show([response.message]);
            } else {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
            }
        })
            .catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            })
            .finally(() => {
                setShowProgress(false);
            });

        onHideDialog();
    };

    const onHideDialog = () => {
        setDeleteRow({});
    };

    const renderDialogFooter = () => {
        return (
            <div>
                <Button label={t("no")} icon="pi pi-times" onClick={() => onHideDialog()} className="p-button-text"/>
                <Button label={t("yes")} icon="pi pi-check" onClick={() => confirmDeleteRow()} autoFocus/>
            </div>
        );
    };

    const actionTemplate = (node, column) => {
        return (
            <div>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2"
                        onClick={() => history.push(`category/edit/${node.key}`)}/>
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={
                    () => setDeleteRow(node.data)}
                        disabled={node.children.length !== 0
                        }
                        style={{marginLeft: 5}}/>
            </div>
        );
    };


    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">{t('categories')}</h5>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
            <Button icon="pi pi-plus" className="p-button-text" onClick={(e) => history.push('/category/add')}/>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card header={cardHeader}>
                    <Messages ref={messages}/>

                    <Dialog
                        header={t("confirmation")}
                        visible={deleteRow.name !== undefined}
                        style={{width: appState.isMobile ? "90%" : "40vw"}}
                        footer={renderDialogFooter()}
                        onHide={() => onHideDialog()}
                    >
                        <p>
                            {t("confirmation_delete").replaceAll(":attribute", deleteRow.name)}
                        </p>
                    </Dialog>


                    <div>
                        <TreeTable
                            loading={showProgress}
                            value={categories}
                            globalFilter={globalFilter}
                            header={getHeader()}
                            emptyMessage={t("no_records_found")}
                        >
                            <Column field="name" header={t("name")} expander sortable/>
                            <Column field="date" header={t("date")} body={(node) =>
                                dateFormat(node.data.date, process.env.REACT_APP_DATE_FORMAT)
                            }
                                    headerClassName="sm-invisible" bodyClassName="sm-invisible" sortable
                            />
                            <Column
                                field="publish" header={t("publish")}
                                body={(node) =>
                                    parseInt(node.data.publish) === 1 ? (
                                        <i
                                            style={{color: "#689f38"}}
                                            className="pi pi-check"
                                        />
                                    ) : (
                                        <i
                                            style={{color: "#ff1d31"}}
                                            className="pi pi-times"
                                        />
                                    )
                                }
                                headerClassName="sm-invisible" bodyClassName="sm-invisible" sortable
                            />
                            <Column header={t("operation")} body={actionTemplate}/>
                        </TreeTable>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Categories;
