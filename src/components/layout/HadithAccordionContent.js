import React, {useEffect} from "react";
import {Tag} from "primereact/tag";
import {Divider} from "primereact/divider";
import {Button} from "primereact/button";
import {AccordionTab} from "primereact/accordion";
import {useTranslation} from "react-i18next";


const HadithAccordionContent = (props) => {

    const {t} = useTranslation()


    return (
        <>
            <div>
                <b>{t('hadith')}:</b>
                <br/>
                <div dangerouslySetInnerHTML={{ __html: props.item.hadith_text }} />
                <i>({props.item.source})</i>
            </div>
            <Divider />
            <div>
                <b>{t('explanation')}:</b>  <br/>
                <div dangerouslySetInnerHTML={{ __html: props.item.explanation }} />
            </div>
            <Divider />
            <div>
                <Button onClick={()=>props.onEdit(props.item)} icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2"/>
                <Button onClick={()=>props.onDelete(props.item)} icon="pi pi-trash" className="p-button-rounded p-button-warning" style={{marginLeft: 5}}/>
            </div>
        </>
    );
}

export default HadithAccordionContent;
