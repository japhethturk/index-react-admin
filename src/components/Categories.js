import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Menu } from "primereact/menu";
import React, {useEffect, useRef, useState} from "react";
import { useHistory } from "react-router";


const Categories = (props) => {
    const history = useHistory()

    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">Card</h5>
            <Button icon="pi pi-plus" className="p-button-text" onClick={(event) => history.push('/category/add')} />
            
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
            <Card header={cardHeader}>
                    <p className="line-height-3 m-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </Card>
            </div>
        </div>
    );
}

export default Categories;