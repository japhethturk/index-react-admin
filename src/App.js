import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import {Route} from 'react-router-dom';
import {CSSTransition} from 'react-transition-group';

import {AppTopbar} from './AppTopbar';
import {AppFooter} from './AppFooter';
import {AppMenu} from './AppMenu';

import {Dashboard} from './components/Dashboard';
import {ButtonDemo} from './components/ButtonDemo';
import {ChartDemo} from './components/ChartDemo';
import {Documentation} from './components/Documentation';
import {FileDemo} from './components/FileDemo';
import {FloatLabelDemo} from './components/FloatLabelDemo';
import {FormLayoutDemo} from './components/FormLayoutDemo';
import {InputDemo} from './components/InputDemo';
import {ListDemo} from './components/ListDemo';
import {MenuDemo} from './components/MenuDemo';
import {MessagesDemo} from './components/MessagesDemo';
import {MiscDemo} from './components/MiscDemo';
import {OverlayDemo} from './components/OverlayDemo';
import {PanelDemo} from './components/PanelDemo';
import {TableDemo} from './components/TableDemo';
import {TreeDemo} from './components/TreeDemo';
import {InvalidStateDemo} from './components/InvalidStateDemo';

import {Crud} from './pages/Crud';
import {EmptyPage} from './pages/EmptyPage';
import {TimelineDemo} from './pages/TimelineDemo';


import StateContext from "./util/context/StateContext"
import DispatchContext from "./util/context/DispatchContext"
import {useImmerReducer} from "use-immer"
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";

import PrimeReact from 'primereact/api';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import './layout/flags/flags.css';
import './layout/layout.scss';
import './App.scss';
import "./util/i18n";
import Login from './Login';
import {AuthService} from './service/AuthService';
import {Functions} from './util/Functions';
import Categories from './components/Categories';
import Articles from './components/Articles';
import CategoryDetail from './components/CategoryDetail';
import ArticleDetail from './components/ArticleDetail';
import {Hadithes} from './components/Hadithes';
import {HadithDetail} from './components/HadithDetail';

const App = () => {
    const {t} = useTranslation()

    // const [layoutMode, setLayoutMode] = useState('static')
    // const [layoutColorMode, setLayoutColorMode] = useState('light')
    // const [inputStyle, setInputStyle] = useState('outlined')
    // const [ripple, setRipple] = useState(true)
    const layoutMode = 'static'
    const layoutColorMode = 'light'
    const inputStyle = 'outlined'
    const ripple = true
    const [staticMenuInactive, setStaticMenuInactive] = useState(false)
    const [overlayMenuActive, setOverlayMenuActive] = useState(false)
    const [mobileMenuActive, setMobileMenuActive] = useState(false)
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false)
    const authService = new AuthService()

    PrimeReact.ripple = true;

    let menuClick = false;
    let mobileTopbarMenuClick = false;

    const initialState = {
        isMobile: false,
        langId: localStorage.getItem("LANG_ID") ? localStorage.getItem("LANG_ID") : "1",
        channel: null,
        siteData: {},
        admin: {
            id: localStorage.getItem("ADMIN_ID"),
            token: localStorage.getItem("ADMIN_TOKEN"),
            name: localStorage.getItem("ADMIN_NAME"),
            role: localStorage.getItem("ADMIN_ROLE")
        },
        adminLoggedIn: localStorage.getItem("ADMIN_LOGGED_IN") ? Boolean(localStorage.getItem("ADMIN_LOGGED_IN")) : false,
    }


    function ourReducer(draft, action) {
        switch (action.type) {
            case "loginAdmin":
                draft.adminLoggedIn = true
                draft.admin = action.data
                return
            case "logoutAdmin":
                draft.adminLoggedIn = false
                draft.admin = {
                    id: '',
                    token: '',
                    name: '',
                    role: ''
                }
                return
            case "setLang":
                draft.langId = action.data
                return
            default:
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)


    useEffect(() => {
        let isMounted = true;
        if (state.adminLoggedIn) {
            authService
                .checkToken(state.admin.token)
                .then((response) => {
                    if (response.status !== "ok" && isMounted) {
                        if (Cookies.get("ADMIN_MAIL") !== undefined && Cookies.get("ADMIN_PASSWORD") !== undefined) {
                            let decipher = Functions.decipher(process.env.REACT_APP_NAME);
                            let values = {email: Cookies.get("ADMIN_MAIL"), password: decipher(Cookies.get("ADMIN_PASSWORD")),};
                            authService.login(values).then((response) => {
                                if (response.status === "ok") {
                                    dispatch({type: "loginAdmin", data: response,});
                                } else {
                                    dispatch({type: "logoutAdmin"});
                                }
                            }).catch((e) => {
                                dispatch({type: "logoutAdmin"});
                            });
                        } else {
                            dispatch({type: "logoutAdmin"});
                        }
                    } else if (response.status !== "not_found") {
                        dispatch({type: "toast", data: response.message});
                    }
                }).catch((e) => {
                dispatch({type: "logoutAdmin"});
            });
        }

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (state.adminLoggedIn) {
            localStorage.setItem("ADMIN_ID", state.admin.id);
            localStorage.setItem("ADMIN_TOKEN", state.admin.token);
            localStorage.setItem("ADMIN_NAME", state.admin.name);
            localStorage.setItem("ADMIN_ROLE", state.admin.role);
            localStorage.setItem("ADMIN_LOGGED_IN", state.adminLoggedIn.toString());
        } else {
            if (state.admin.token) {
                authService.logOut(state.admin.token).then((r) => {
                });
            }
            localStorage.removeItem("ADMIN_ID");
            localStorage.removeItem("ADMIN_TOKEN");
            localStorage.removeItem("ADMIN_NAME");
            localStorage.removeItem("ADMIN_ROLE");
            localStorage.removeItem("ADMIN_LOGGED_IN");
            Cookies.remove("ADMIN_MAIL");
            Cookies.remove("ADMIN_PASSWORD");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.adminLoggedIn])

    useEffect(() => {
        localStorage.setItem("LANG_ID", state.langId);
    }, [state.langId])

    useEffect(() => {
        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    }

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === 'overlay') {
                if (mobileMenuActive === true) {
                    setOverlayMenuActive(true);
                }

                setOverlayMenuActive((prevState) => !prevState);
                setMobileMenuActive(false);
            } else if (layoutMode === 'static') {
                setStaticMenuInactive((prevState) => !prevState);
            }
        } else {
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    }

    const onSidebarClick = () => {
        menuClick = true;
    }

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    }

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        event.preventDefault();
    }

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    }
    const isDesktop = () => {
        return window.innerWidth >= 992;
    }

    const menu = [
        {
            label: 'Home',
            items: [
                {label: t('dashboard'), icon: 'pi pi-fw pi-home', to: '/'},
                {label: t('categories'), icon: 'pi pi-fw pi-sitemap', to: '/categories'},
                {label: t('articles'), icon: 'pi pi-fw pi-pencil', to: '/articles'},
                {label: t('hadithes'), icon: 'pi pi-fw pi-comment', to: '/hadithes'}
            ]
        },
        {
            label: 'UI Kit', icon: 'pi pi-fw pi-sitemap',
            items: [
                {label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/formlayout'},
                {label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/input'},
                {label: "Float Label", icon: "pi pi-fw pi-bookmark", to: "/floatlabel"},
                {label: "Invalid State", icon: "pi pi-fw pi-exclamation-circle", to: "invalidstate"},
                {label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/button'},
                {label: 'Table', icon: 'pi pi-fw pi-table', to: '/table'},
                {label: 'List', icon: 'pi pi-fw pi-list', to: '/list'},
                {label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/tree'},
                {label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/panel'},
                {label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/overlay'},
                {label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/menu'},
                {label: 'Message', icon: 'pi pi-fw pi-comment', to: '/messages'},
                {label: 'File', icon: 'pi pi-fw pi-file', to: '/file'},
                {label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/chart'},
                {label: 'Misc', icon: 'pi pi-fw pi-circle-off', to: '/misc'},
            ]
        },
        {
            label: 'Pages', icon: 'pi pi-fw pi-clone',
            items: [
                {label: 'Crud', icon: 'pi pi-fw pi-user-edit', to: '/crud'},
                {label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/timeline'},
                {label: 'Empty', icon: 'pi pi-fw pi-circle-off', to: '/empty'}
            ]
        },
        {
            label: 'Menu Hierarchy', icon: 'pi pi-fw pi-search',
            items: [
                {
                    label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
                    items: [
                        {
                            label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
                            items: [
                                {label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark'},
                            ]
                        },
                        {
                            label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
                            items: [
                                {label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 1.2.2', icon: 'pi pi-fw pi-bookmark'}
                            ]
                        },
                    ]
                },
                {
                    label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
                    items: [
                        {
                            label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
                            items: [
                                {label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 2.1.3', icon: 'pi pi-fw pi-bookmark'},
                            ]
                        },
                        {
                            label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
                            items: [
                                {label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark'},
                                {label: 'Submenu 2.2.2', icon: 'pi pi-fw pi-bookmark'}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            label: 'Get Started',
            items: [
                {
                    label: 'Documentation', icon: 'pi pi-fw pi-question', command: () => {
                        window.location = "#/documentation"
                    }
                },
                {
                    label: 'View Source', icon: 'pi pi-fw pi-search', command: () => {
                        window.location = "https://github.com/primefaces/sakai-react"
                    }
                }
            ]
        }
    ];

    const addClass = (element, className) => {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    const removeClass = (element, className) => {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    const wrapperClass = classNames('layout-wrapper', {
        'layout-overlay': layoutMode === 'overlay',
        'layout-static': layoutMode === 'static',
        'layout-static-sidebar-inactive': staticMenuInactive && layoutMode === 'static',
        'layout-overlay-sidebar-active': overlayMenuActive && layoutMode === 'overlay',
        'layout-mobile-sidebar-active': mobileMenuActive,
        'p-input-filled': inputStyle === 'filled',
        'p-ripple-disabled': ripple === false,
        'layout-theme-light': layoutColorMode === 'light'
    });


    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {
                    state.adminLoggedIn ?
                        <div className={wrapperClass} onClick={onWrapperClick}>
                            <AppTopbar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode}
                                       mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}/>

                            <div className="layout-sidebar" onClick={onSidebarClick}>
                                <AppMenu model={menu} onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode}/>
                            </div>

                            <div className="layout-main-container">
                                <div className="layout-main">
                                    <Route path="/" exact component={Dashboard}/>
                                    <Route path="/categories" component={Categories}/>
                                    <Route path="/category/add" component={CategoryDetail}/>
                                    <Route path="/category/edit/:id" component={CategoryDetail}/>
                                    <Route path="/articles" component={Articles}/>
                                    <Route path="/article/add" component={ArticleDetail}/>
                                    <Route path="/article/edit/:id" component={ArticleDetail}/>
                                    <Route path="/hadithes" component={Hadithes}/>
                                    <Route path="/hadith/add" component={HadithDetail}/>
                                    <Route path="/hadith/edit/:id" component={HadithDetail}/>
                                    <Route path="/formlayout" component={FormLayoutDemo}/>
                                    <Route path="/input" component={InputDemo}/>
                                    <Route path="/floatlabel" component={FloatLabelDemo}/>
                                    <Route path="/invalidstate" component={InvalidStateDemo}/>
                                    <Route path="/button" component={ButtonDemo}/>
                                    <Route path="/table" component={TableDemo}/>
                                    <Route path="/list" component={ListDemo}/>
                                    <Route path="/tree" component={TreeDemo}/>
                                    <Route path="/panel" component={PanelDemo}/>
                                    <Route path="/overlay" component={OverlayDemo}/>
                                    <Route path="/menu" component={MenuDemo}/>
                                    <Route path="/messages" component={MessagesDemo}/>
                                    <Route path="/file" component={FileDemo}/>
                                    <Route path="/chart" component={ChartDemo}/>
                                    <Route path="/misc" component={MiscDemo}/>
                                    <Route path="/timeline" component={TimelineDemo}/>
                                    <Route path="/crud" component={Crud}/>
                                    <Route path="/empty" component={EmptyPage}/>
                                    <Route path="/documentation" component={Documentation}/>
                                </div>

                                <AppFooter layoutColorMode={layoutColorMode}/>
                            </div>


                            <CSSTransition classNames="layout-mask" timeout={{enter: 200, exit: 200}} in={mobileMenuActive} unmountOnExit>
                                <div className="layout-mask p-component-overlay"></div>
                            </CSSTransition>

                        </div>
                        :
                        <Login/>
                }
            </DispatchContext.Provider>
        </StateContext.Provider>
    );


}

export default App;
