import React, {useContext, useEffect, useRef, useState} from 'react';
import {Card} from 'primereact/card';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import StateContext from '../util/context/StateContext';
import {Button} from 'primereact/button';
import SelectLanguage from './layout/SelectLanguage';
import {Messages} from "primereact/messages";
import {NodeService} from "../service/NodeService";
import {HadithService} from "../service/HadithService";
import {useParams} from "react-router-dom";
import {Accordion, AccordionTab} from "primereact/accordion";
import {Tag} from "primereact/tag";
import {Divider} from "primereact/divider";
import HadithAccordionContent from "./layout/HadithAccordionContent";
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";

export const Hadithes = () => {
    const history = useHistory()
    const {t} = useTranslation()
    const appState = useContext(StateContext);
    const messages = useRef(null);
    const [langId, setLangId] = useState(appState.langId)

    const [hadithes, setHadithes] = useState([])
    // const nodeservice = new NodeService();
    const hadithService = new HadithService()
    const {page} = useParams()
    const [showProgress, setShowProgress] = useState(false)
    const [totalRecords, setTotalRecords] = useState(0);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        loaded: false,
    });

    useEffect(() => {
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
            hadithService.paginate(lazyParams, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    if (response.status === "ok") {
                        setHadithes(response.paginate.data)
                        setTotalRecords(response.paginate.total)
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


    const onPage = (event) => {
        let _lazyParams = {...lazyParams, ...event}
        setLazyParams(_lazyParams)

        window.scrollTo(0, 0)
        if (event.page === 0) {
            history.push(`hadithes/`);
        } else {
            history.push(`hadithes/${event.page + 1}`);
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

    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">{t('hadithes')}</h5>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
            <Button icon="pi pi-plus" className="p-button-text" onClick={(e) => history.push('/hadith/add')}/>
        </div>
    );

    const onEdit = (item) => {
        console.log(item)
    }

    const onDelete = (item) => {
        console.log(item)
    }

    const actionTemplate = (node, column) => {
        return <div>
            <Button type="button" icon="pi pi-search" className="p-button-success" style={{ marginRight: '.5em' }} />
            <Button type="button" icon="pi pi-pencil" className="p-button-warning" />
        </div>;
    }

    const hadithTemplate = (node, column) => {
        return (<div>
                    <div dangerouslySetInnerHTML={{ __html: node.hadith_text }} />
                    <i>({node.source})</i>
                    <div style={{marginTop:10}}>
                        {actionTemplate(node,column)}
                    </div>
                </div>);
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Card header={cardHeader}>
                    <Messages className="field col-12" ref={messages} />
                    <TreeTable value={hadithes} loading={showProgress} paginator first={lazyParams.first} rows={lazyParams.rows} totalRecords={totalRecords}
                               onPage={onPage} onSort={onSort} sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder}
                               onFilter={onFilter} filters={lazyParams.filters}>
                        <Column field="hadith" body={hadithTemplate} filter expander/>
                    </TreeTable>
                </Card>
            </div>
        </div>
    );
}
