import React, {useContext, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Messages} from "primereact/messages";
import {Dialog} from "primereact/dialog";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {useHistory, useParams} from "react-router-dom";
import {TreeSelect} from "primereact/treeselect";
import {Calendar} from "primereact/calendar";
import StateContext from "../util/context/StateContext";
import {SplitButton} from "primereact/splitbutton";
import SelectLanguage from "./layout/SelectLanguage";
import {Card} from "primereact/card";
import {ArticleService} from "../service/ArticleService";
import {CategoryService} from "../service/CategoryService";

const Articles = (props) => {

    const {t} = useTranslation();
    const history = useHistory();
    const appState = useContext(StateContext);
    const messages = useRef(null);
    const {page} = useParams();
    const [treeOption, setTreeOption] = useState([]);
    const [dates, setDates] = useState(null);
    const [showProgress, setShowProgress] = useState(false)
    const [deleteRow, setDeleteRow] = useState({});
    const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
    const dateFormat = require("dateformat");
    const [langId, setLangId] = useState(appState.langId)

    const [totalRecords, setTotalRecords] = useState(0);
    const [articles, setArticles] = useState([]);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        loaded: false,
    });

    const dt = useRef(null);

    const categoryService = new CategoryService();
    const articleService = new ArticleService();

    const emptyItem = {key: null, label: t("deselect")};

    useEffect(() => {
        categoryService
            .allTree(langId)
            .then((response) => {
                if (response.status === "ok") {
                    setTreeOption([emptyItem, ...response.categories]);
                } else if (response.status === "error") {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
            messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
        });

        if (lazyParams.loaded) {
            setLazyParams((oldValue) => {
                return {
                    langId,
                    rows: oldValue.rows,
                    first: oldValue.first,
                    loaded: true,
                };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [langId]);

    useEffect(() => {
        let lazyFirst = lazyParams.first;
        let lazyPage = lazyParams.page;
        if (page !== undefined) {
            lazyPage = parseInt(page);
            lazyFirst = (lazyPage - 1) * lazyParams.rows;
        } else {
            lazyFirst = 0;
        }
        setLazyParams((oldValue) => {
            return {
                langId,
                rows: oldValue.rows,
                first: lazyFirst,
                loaded: true,
            };
        });
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        if (lazyParams.loaded) {
            setShowProgress(true);
            articleService.paginate(lazyParams, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    if (response.status === "ok") {
                        setTotalRecords(response.paginate.total);
                        setArticles(response.paginate.data);
                    } else {
                        messages.current.show([response.message]);
                    }
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            }).finally(() => {
                setShowProgress(false)
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyParams]);


    const confirmDeleteRow = () => {
        messages.current.clear();
        setShowProgress(true);
        articleService
            .remove(deleteRow.id, appState.admin.token)
            .then((response) => {
                if (response.status !== undefined) {
                    if (response.status === "ok") {
                        let unRemoved = articles.filter(function (item) {
                            return item.id !== deleteRow.id;
                        });
                        setArticles(unRemoved);
                    }
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            })
            .catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true, },]);
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
                <Button label={t("no")} icon="pi pi-times" onClick={() => onHideDialog()} className="p-button-text" />
                <Button label={t("yes")} icon="pi pi-check" onClick={() => confirmDeleteRow()} autoFocus />
            </div>
        );
    };

    const onPage = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        setLazyParams(_lazyParams);

        window.scrollTo(0, 0);
        if (event.page === 0) {
            history.push(`article/all`);
        } else {
            history.push(`article/all/${event.page + 1}`);
        }
    };

    const onSort = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        setLazyParams(_lazyParams);
    };

    const onFilter = (event) => {
        let _lazyParams = {...lazyParams, ...event};
        _lazyParams["first"] = 0;
        setLazyParams(_lazyParams);
    };

    const imageBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <img
                    src={`${process.env.REACT_APP_URL}images/articles/${rowData.image}`}
                    onError={(e) => (e.target.src = `${process.env.REACT_APP_URL}images/not_image.png`)}
                    alt={rowData.name}
                    style={{width: 100, height: 70, objectFit: "cover"}}
                />
            </React.Fragment>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <span className="p-column-title">{t("name")}</span>
                {rowData.name}
            </React.Fragment>
        );
    };

    const categoryBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <span className="p-column-title">{t("category")}</span>
                <span className="image-text">{rowData.category.name}</span>
            </React.Fragment>
        );
    };


    const dateBodyTemplate = (rowData) => {
        let date = new Date(rowData.created_at);
        return (
            <React.Fragment>
                <span className="p-column-title">{t("date")}</span>
                {dateFormat(date, process.env.REACT_APP_DATE_FORMAT)}
            </React.Fragment>
        );
    };

    const operationItem = (rowData) => {
        return [
            {
                label: t("more"),
                icon: "pi pi-external-link",
                command: () => {
                    let win = window.open(
                        `${window.root}article/${rowData.slug}`,
                        "_blank"
                    );
                    win.focus();
                },
            },
            {
                label: t("edit"),
                icon: "pi pi-pencil",
                command: () => {
                    history.push(
                        `${window.option.admin}article/edit/${rowData.id}`
                    );
                },
            },
            {
                label: t("delete"),
                icon: "pi pi-trash",
                command: () => {
                    setDeleteRow(rowData);
                },
            },
        ];
    };

    const actionTemplate = (rowData) => {
        return (
            <React.Fragment>
                <SplitButton
                    icon="pi pi-pencil"
                    onClick={() =>
                        history.push(
                            `article/edit/${rowData.id}`
                        )
                    }
                    model={operationItem(rowData)}
                />
            </React.Fragment>
        );
    };

    const onCategoryChange = (value) => {
        setSelectedCategoryKey(value);
        dt.current.filter(value, "category", "equals");
    };

    const onDateRangeChange = (value) => {
        setDates(value);
        dt.current.filter(value, "date", "range");
    };

    const categoryFilter = (
        <TreeSelect
            value={selectedCategoryKey}
            options={treeOption}
            onChange={(e) => onCategoryChange(e.value)}
            placeholdet={t("select_category")}
        />
    );

    const dateFilter = (
        <Calendar
            id="range"
            value={dates}
            onChange={(e) => onDateRangeChange(e.value)}
            selectionMode="range"
            readOnlyInput
        />
    );


    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">{t('articles')}</h5>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
            <Button icon="pi pi-plus" className="p-button-text" onClick={(e) => history.push('/article/add')}/>
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
                            {t("confirmation_delete").replaceAll(
                                ":attribute",
                                deleteRow.name
                            )}
                        </p>
                    </Dialog>

                    <div className="datatable-responsive">
                        <DataTable
                            ref={dt}
                            value={articles}
                            lazy
                            className="p-datatable-responsive p-datatable-sm"
                            resizableColumns
                            columnResizeMode="fit"
                            showGridlines
                            paginator
                            first={lazyParams.first}
                            rows={lazyParams.rows}
                            totalRecords={totalRecords}
                            onPage={onPage}
                            onSort={onSort}
                            sortField={lazyParams.sortField}
                            sortOrder={lazyParams.sortOrder}
                            onFilter={onFilter}
                            filters={lazyParams.filters}
                            loading={showProgress}
                            emptyMessage={t("no_records_found")}
                        >
                            <Column
                                field="image"
                                header={t("image")}
                                body={imageBodyTemplate}
                                style={{width: 125}}
                            />
                            <Column
                                field="name"
                                header={t("name")}
                                body={nameBodyTemplate}
                                sortable
                                filter
                            />
                            <Column
                                field="category.name"
                                header={t("category")}
                                body={categoryBodyTemplate}
                                sortable
                                filter
                                filterElement={categoryFilter}
                            />
                            <Column
                                field="date"
                                header={t("date")}
                                body={dateBodyTemplate}
                                sortable
                                filter
                                filterElement={dateFilter}
                            />
                            <Column
                                header={t("operation")}
                                body={actionTemplate}
                                style={{width: 120}}
                            />
                        </DataTable>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Articles;
