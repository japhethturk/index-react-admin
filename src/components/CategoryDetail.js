import React, {useContext, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router";
import {useParams} from "react-router-dom";
import {ProgressBar} from "primereact/progressbar";
import {Messages} from "primereact/messages";
import {InputText} from "primereact/inputtext";
import {Inplace, InplaceContent, InplaceDisplay} from "primereact/inplace";
import {TreeSelect} from 'primereact/treeselect';
import {InputTextarea} from "primereact/inputtextarea";
import StateContext from "../util/context/StateContext";
import slugify from "react-slugify";
import {Functions} from "../util/Functions";
import {CategoryService} from "../service/CategoryService";
import {Chips} from "primereact/chips";
import SelectLanguage from "./layout/SelectLanguage";


const CategoryDetail = (props) => {
    const history = useHistory()
    const {t} = useTranslation()
    const {id} = useParams();
    const messages = useRef(null);
    const [showProgress, setShowProgress] = useState(true);
    const appState = useContext(StateContext);
    const [isAdd, setIsAdd] = useState(true);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [changeSlug, setChangeSlug] = useState(true);
    const [treeOption, setTreeOption] = useState([]);
    const [selectedParentKey, setSelectedParentKey] = useState(null);
    const [langId, setLangId] = useState(appState.langId)


    const categoryService = new CategoryService()
    const emptyItem = {key: null, label: t("deselect")}


    useEffect(() => {
        if (id === undefined) {
            categoryService.allTree(langId).then((response) => {
                if (response.status === "ok") {
                    setTreeOption([emptyItem, ...response.categories]);
                } else if (response.status === "error") {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            }).finally(() => {
                setShowProgress(false);
            });
        } else {
            setIsAdd(false);
            categoryService.edit(id, langId, appState.admin.token).then((response) => {
                if (response.status === "ok") {
                    setTreeOption([emptyItem, ...response.categories]);
                    setSelectedParentKey(response.category.parent_id);
                    setName(response.category.name);
                    setSlug(response.category.slug);
                    if (response.category.meta_description)
                        setDescription(response.category.meta_description);
                    if (response.category.meta_keywords)
                        setKeywords(
                            response.category.meta_keywords.split(",")
                        );
                } else if (response.status === "error") {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
                console.log(e);
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            }).finally(() => {
                setShowProgress(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [langId]);

    const onSubmit = (e) => {
        window.scrollTo(0, 0);
        setShowProgress(true);
        messages.current.clear();
        let requestBody = {
            lang_id: langId,
            parent_id: selectedParentKey,
            name,
            slug,
            meta_keywords: keywords.join(),
            meta_description: description,
        };
        if (isAdd) {
            categoryService.store(requestBody, langId, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    if (response.status === "ok") {
                        setTreeOption([emptyItem, ...response.categories]);
                        setName("");
                        setSlug("");
                        setKeywords([]);
                        setDescription("");
                        setSelectedParentKey(null);
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
        } else {
            categoryService.update(id, requestBody, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
                messages.current.show([
                    {
                        severity: "error",
                        summary: t("error"),
                        detail: t("occurred_connecting_error"),
                        sticky: true,
                    },
                ]);
            }).finally(() => {
                setShowProgress(false);
            });
        }
        e.preventDefault();
    };


    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <div className="flex align-items-center justify-content-between">
                <Button icon="pi pi-arrow-left" className="p-button-text" onClick={(event) => history.goBack()}/>
                <h5 className="m-0">{t('categories')}</h5>
            </div>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card header={cardHeader}>
                    <div className="p-fluid">
                        {showProgress ? (
                            <ProgressBar mode="indeterminate" style={{height: "3px"}}/>
                        ) : (
                            <></>
                        )}
                        <div className="p-grid">
                            <div className="p-col-12 p-md-12">
                                <Messages ref={messages}/>
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <TreeSelect
                                    value={selectedParentKey}
                                    options={treeOption}
                                    onChange={(e) => setSelectedParentKey(e.value)}
                                    placeholder={t("select_category")}
                                />
                                <small id="parent_category-help">
                                    {t("parent_category_description")}
                                </small>
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <InputText
                                    id="name"
                                    type="text"
                                    placeholder={t("name")}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (changeSlug) {
                                            setSlug(
                                                slugify(Functions.slug(e.target.value))
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div
                                className="p-col-12 p-md-10"
                                style={{alignSelf: "center"}}
                            >
                                <Inplace closable>
                                    <InplaceDisplay>
                                        {slug || t("slug")}
                                    </InplaceDisplay>
                                    <InplaceContent>
                                        <InputText
                                            id="slug"
                                            value={slug}
                                            onFocus={() => {
                                                if (slug.length > 3)
                                                    setChangeSlug(false);
                                            }}
                                            onChange={(e) => setSlug(e.target.value)}
                                            autoFocus
                                        />
                                    </InplaceContent>
                                </Inplace>
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <Chips
                                    value={keywords}
                                    placeholder={t("meta_keywords")}
                                    onChange={(e) => setKeywords(e.value)}
                                    separator=","
                                />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <InputTextarea
                                    maxLength={255}
                                    rows={5}
                                    placeholder={t("meta_description")}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-grid">
                            <div className="p-col-12 p-md-10 p-lg-10"/>
                            <div className="p-col-12 p-md-2 p-lg-2">
                                <Button
                                    onClick={(e) => {
                                        onSubmit(e);
                                    }}
                                    label={t("save")}
                                    className="p-button-outlined"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default CategoryDetail;
