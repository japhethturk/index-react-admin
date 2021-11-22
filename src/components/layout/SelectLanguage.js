import React, {useContext, useState} from "react";
import {SelectButton} from "primereact/selectbutton";
import DispatchContext from "../../util/context/DispatchContext";


const SelectLanguage = (props) => {
    const [langId, setLangId] = useState(props.value);
    const appDispatch = useContext(DispatchContext);

    const justifyOptions = [
        {icon: 'tr', value: '1'},
        {icon: 'az', value: '2'},
        {icon: 'ru', value: '4'},
        {icon: 'en', value: '3'}
    ];

    const justifyTemplate = (option) => {
        return <img src={`${process.env.REACT_APP_URL}images/flag/${option.icon}.svg`} alt={option.icon} style={{width: 50, height: 18,}}/>
    }


    const changeLang = (e) => {
        props.onChange(e)
        setLangId(e.value)
        appDispatch({type: "setLang", data: e.value})
    }

    return (
        <SelectButton value={langId} options={justifyOptions} onChange={(e) => changeLang(e)} itemTemplate={justifyTemplate}/>
    );
}

export default SelectLanguage;
