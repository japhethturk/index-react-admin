import React, {useContext, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {ProgressBar} from "primereact/progressbar";
import {Messages} from "primereact/messages";
import {TreeSelect} from "primereact/treeselect";
import {InputSwitch} from "primereact/inputswitch";
import {InputText} from "primereact/inputtext";
import slugify from "react-slugify";
import {Inplace, InplaceContent, InplaceDisplay} from "primereact/inplace";
import {Chips} from "primereact/chips";
import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import {FileUpload} from "primereact/fileupload";
import {useHistory, useParams} from "react-router-dom";
import {Tag} from "primereact/tag";
import SelectLanguage from "./layout/SelectLanguage";
import StateContext from "../util/context/StateContext";
import {Functions} from "../util/Functions";
import {Card} from "primereact/card";
import {ArticleService} from "../service/ArticleService";
import {CategoryService} from "../service/CategoryService";


const ArticleDetail = (props) => {
    const {t} = useTranslation();
    const history = useHistory()
    const {id} = useParams();
    const messages = useRef(null);
    const fileUploadRef = useRef(null);
    const appState = useContext(StateContext);
    const [isAdd, setIsAdd] = useState(true);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [publish, setPublish] = useState(true);
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [changeSlug, setChangeSlug] = useState(true);
    const [content, setContent] = useState("");
    const [treeOption, setTreeOption] = useState([]);
    const [selectedParentKey, setSelectedParentKey] = useState(null);
    const [showProgress, setShowProgress] = useState(true);
    const [totalSize, setTotalSize] = useState(0);
    const [file, setFile] = useState(null);
    const [maxSize, setMaxSize] = useState(2);
    const [langId, setLangId] = useState(appState.langId)
    const [editedImageName, setEditedImageName] = useState(null);

    const categoryService = new CategoryService();
    const articleService = new ArticleService();


    useEffect(() => {
        setMaxSize(parseInt(process.env.REACT_APP_MAX_IMG_SIZE));
        if (id === undefined) {
            categoryService.allTree(langId).then((response) => {
                if (response.status === "ok") {
                    setTreeOption(response.categories);
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
        } else {
            setIsAdd(false);
            articleService.edit(id, langId, appState.admin.token).then((response) => {
                if (response.status === "ok") {
                    setTreeOption(response.categories);
                    setSelectedParentKey(response.article.category_id);
                    setName(response.article.name);
                    setSlug(response.article.slug);
                    setPublish(parseInt(response.article.publish) === 1);
                    if (response.article.content)
                        setContent(response.article.content);
                    if (response.article.meta_description)
                        setDescription(response.article.meta_description);
                    if (response.article.meta_keywords)
                        setKeywords(response.article.meta_keywords.split(","));
                    if (response.article.image) {
                        setEditedImageName(response.article.image);
                        editedImage(response.article.image);
                    }
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

    const editedImage = (imageName) => {
        document.getElementById(
            "no-image"
        ).innerHTML = `<img width="150" src="${process.env.REACT_APP_URL}images/articles/${imageName}" alt="${imageName}">`;
    };

    const onSubmit = (e) => {
        window.scrollTo(0, 0);
        setShowProgress(true);
        let requestBody = new FormData();
        if (file === null) {
            onSave();
        } else {
            requestBody.append("image", file);
            requestBody.append("max", maxSize);
            articleService.upload(requestBody, appState.admin.token).then((response) => {
                if (response.status === "ok") {
                    onSave(response.image_name);
                } else if (response.status === "error") {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            })
                .catch((e) => {
                    messages.current.show([
                        {
                            severity: "error",
                            summary: t("error"),
                            detail: t("occurred_connecting_error"),
                            sticky: true,
                        },
                    ]);
                });
        }
        e.preventDefault();
    };

    const onSave = (imageName = editedImageName) => {
        messages.current.clear();
        let data = {
            lang_id: langId,
            publish,
            name,
            slug,
            content,
            image: imageName,
            category_id: selectedParentKey,
            meta_keywords: Functions.limitedString(keywords.join(), 250),
            meta_description: Functions.limitedString(description, 250),
        };

        if (isAdd) {
            articleService.store(data, langId, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    if (response.status === "ok") {
                        setContent("");
                        setName("");
                        setSlug("");
                        setKeywords([]);
                        setDescription("");
                        setSelectedParentKey(null);
                        setFile(null);
                        removeLastImage();
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
            articleService.update(id, data, appState.admin.token).then((response) => {
                if (response.status !== undefined) {
                    messages.current.show([response.message]);
                } else {
                    messages.current.show([{severity: "error", summary: t("error"), detail: t("unexpected_response"), sticky: true,},]);
                }
            }).catch((e) => {
                messages.current.show([{severity: "error", summary: t("error"), detail: t("occurred_connecting_error"), sticky: true,},]);
            }).finally(() => {
                setShowProgress(false);
            });
        }
    };


    const onTemplateSelect = (e) => {
        let _totalSize = totalSize;
        fileUploadRef.current.files.forEach((file) => {
            _totalSize += file.size;
        });
        setFile(fileUploadRef.current.files[0]);
        setTotalSize(_totalSize);
        removeLastImage();
    };

    const setEditArticleImage = () => {
        if (!isAdd && editedImageName !== null) {
            setTimeout(function () {
                editedImage(editedImageName);
            }, 1000);
        }
    };

    const removeLastImage = () => {
        if (
            document.getElementsByClassName("p-fileupload-row")[0] !== undefined
        )
            document
                .getElementsByClassName("p-fileupload-row")[0]
                .children[0].children[2].click();
    };

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
        setEditArticleImage();
        setFile(null);
    };

    const onTemplateClear = () => {
        setTotalSize(0);
        setEditArticleImage();
        setFile(null);
    };

    const headerTemplate = (options) => {
        const {className, chooseButton, cancelButton} = options;
        const value = totalSize / 10000;
        const formatValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : "0 B";

        return (
            <div
                className={className}
                style={{
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {chooseButton}
                {cancelButton}
                <ProgressBar
                    value={value}
                    displayValueTemplate={() =>
                        `${formatValue} / ${maxSize} MB`
                    }
                    style={{
                        width: appState.isMobile ? 150 : 300,
                        height: "20px",
                        marginLeft: "auto",
                    }}
                />
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="p-d-flex p-ai-center p-flex-wrap">
                <div className="p-d-flex p-ai-center">
                    <img
                        alt={file.name}
                        role="presentation"
                        src={file.objectURL}
                        width={100}
                    />
                    <span className="p-d-flex p-dir-col p-text-left p-ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag
                    value={props.formatSize}
                    severity="warning"
                    className="p-px-3 p-py-2"
                />
                <Button
                    type="button"
                    icon="pi pi-times"
                    className="p-button-outlined p-button-rounded p-button-danger p-ml-auto"
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                />
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="grid">
                <div className="col-6 col-offset-3" style={{textAlign: "center"}}>
                    <div id="no-image">
                        <i
                            className="pi pi-image p-mt-3 p-p-5"
                            style={{
                                fontSize: "5em",
                                borderRadius: "50%",
                                backgroundColor: "var(--surface-b)",
                                color: "var(--surface-d)",
                            }}
                        />
                    </div>
                    <span
                        style={{
                            fontSize: "1.2em",
                            color: "var(--text-color-secondary)",
                        }}
                        className="p-my-4"
                    >
                    {t('drag_drop')}
                </span>
                </div>
            </div>
        );
    };

    const chooseOptions = {
        icon: "pi pi-fw pi-image",
        iconOnly: true,
        className: "custom-choose-btn p-button-rounded p-button-outlined",
    };

    const cancelOptions = {
        icon: "pi pi-fw pi-times",
        iconOnly: true,
        className:
            "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
    };


    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <div className="flex align-items-center justify-content-between">
                <Button icon="pi pi-arrow-left" className="p-button-text" onClick={(event) => history.goBack()}/>
                <h5 className="m-0">{t('articles')}</h5>
            </div>
            <SelectLanguage value={langId} onChange={(e) => setLangId(e.value)}/>
        </div>
    );


    return (
        <div className="grid">
            <div className="col-12">
                <Card header={cardHeader}>
                    <div
                        className="p-fluid b-form"
                        style={{width: "100%"}}
                    >
                        {showProgress ? (
                            <ProgressBar
                                mode="indeterminate"
                                style={{height: "3px"}}
                            />
                        ) : (
                            <></>
                        )}
                        <div className="p-field p-grid">
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
                                    placeholder={t("category")}
                                />
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
                                            setSlug(slugify(Functions.slug(e.target.value)));
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
                                <div className="p-inputgroup">
                                    <Chips
                                        placeholder={t("meta_keywords")}
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.value)}
                                        separator=","
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <InputTextarea
                                    placeholder={t("meta_description")}
                                    maxLength={255}
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <div className="p-col-12 p-md-10">
                                <FileUpload
                                    ref={fileUploadRef}
                                    name="file[]"
                                    maxFileSize={1000000 * maxSize}
                                    onError={onTemplateClear}
                                    onClear={onTemplateClear}
                                    onSelect={onTemplateSelect}
                                    headerTemplate={headerTemplate}
                                    itemTemplate={itemTemplate}
                                    emptyTemplate={emptyTemplate}
                                    chooseOptions={chooseOptions}
                                    cancelOptions={cancelOptions}
                                />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <CKEditor
                                editor={ClassicEditor}
                                config={{
                                    ckfinder: {
                                        uploadUrl: `${process.env.REACT_APP_API}article/uploadCk`,
                                    },
                                }}
                                data={content}
                                onChange={(event, editor) => {
                                    setContent(editor.getData());
                                }}
                            />
                        </div>
                        <div className="p-grid">
                            <div className="p-col-12 p-md-10 p-lg-10">
                                <div className="p-field p-grid">
                                    <div className="p-col-12 p-md-11 p-p-3">
                                        <InputSwitch
                                            id="publish"
                                            checked={publish}
                                            onChange={(e) => setPublish(e.value)}
                                        />
                                    </div>
                                </div>
                            </div>
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

export default ArticleDetail;
