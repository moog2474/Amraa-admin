import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../hooks/UserContext';
import useLogout from './../hooks/useLogout';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import {
    Popup,
} from "devextreme-react";
import './nav-style.css'
//import {Link} from "react-router-dom";
import sideIcon from "../assets/imgs/sideIcon.svg";
import signOut from "../assets/imgs/power.svg";

export default function Header(props) {
    const { user } = useContext(UserContext);
    const { socket } = props;
    const { logoutUser } = useLogout();
    /*const [dropDownItems, setDropDownItems] = useState([
        {id: 2, text: 'Хэрэглэгч', icon: "user", src: "/myInfo"},
        {id: 1, text: 'Гарах', icon: 'export'},
    ]);*/
    const [popupExit, setPopupExit] = useState(false);
    useEffect(() => {

    }, [])

    const dropDownFunc = (e) => {
        // if (e.itemData.id === 1) {
        logoutUser(user);
        // }
    }

    function toggle() {
        props.toggle();
    }

    /*const dropDownItemRender = (data) => {
        return (
            <div>
                {data.src ? <Link style={{color: "#2E4765", display: "inline-block", width: "100%"}} to={data.src}><span
                    className="dx-list-item-icon-container">
                     <i style={{color: "#AF6D53"}} className={"dropDownIcon dx-icon-" + data.icon}/>
                </span>{data.text}</Link> : <div>
                    <div className="dx-list-item-icon-container">
                        <i style={{color: "#AF6D53"}} className={"dropDownIcon dx-icon-" + data.icon}/>
                    </div>
                    <span>{data.text}</span>
                </div>}
            </div>

        )
    }*/
    const onChangeExit = (e) => {
        setPopupExit(true);
    }
    const HandleHover = (event) => {
        event.target.style.backgroundColor = '#EEF2F8';
    }
    const HandleHoverOut = (event) => {
        event.target.style.backgroundColor = '#fff';
    }
    return (
        <div>
            <Toolbar style={{
                height: 60,
                boxShadow: '1px 1px 5px #AF6D53',
                position: 'fixed',
                top: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center'
            }}>
                <Item location="before">
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 20,
                        // paddingRight: 20,
                        // width: 500
                    }}>
                        <div className={"sideIcon-bnt-style"} style={{ "paddingLeft": 0 }} onClick={toggle}>
                            <img loading="lazy" src={sideIcon} style={{ width: 'auto', height: '18px' }} />
                        </div>
                        <div>
                            <span style={{ color: '#AF6D53', paddingLeft: 30, textAlign: 'center', fontSize: 16, fontWeight: '500' }}>ҮЙЛДВЭРИЙН ХЯНАЛТ УДИРДЛАГЫН СИСТЕМ</span>
                        </div>
                    </div>
                </Item>
                <Item location='after'>
                    <div className='navbarItem'>
                        <div className='p-3'>{user?.department_name } / {`${user?.position_name ? user?.position_name : ''}` + `${user?.position_name ? '-' : ''}`+ user?.last_name?.slice(0, 1) + '.' + user?.first_name } / {user?.username}</div>
                        <button><img src={signOut} alt='' onClick={onChangeExit} /></button>
                    </div>
                </Item>
                <Item location="after">

                </Item>
            </Toolbar>
            {popupExit && (
                <Popup
                    width={"270"}
                    height={"130"}
                    title={''}
                    showTitle={false}
                    visible={popupExit}
                    onHiding={() => {
                        setPopupExit(false);
                    }}
                    dragEnabled={false}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        marginBottom: 0,
                        width: '100%',
                        height: '100%',
                        borderColor: '#E8EDF6'
                    }}>
                        <div style={{
                            flex: 0.8,
                            display: 'flex',
                            justifyContent: 'center',
                            borderColor: "#E8EDF6",
                            flexDirection: 'column',
                            alignItems: 'center',
                            paddingTop: 28
                        }}>
                            <span style={{
                                backgroundColor: "#fff",
                                textAlign: 'center',
                                fontWeight: "700",
                                fontSize: '16px',
                                fontFamily: 'Segoe UI',
                                paddingLeft: 50,
                                color: "#000000",
                                paddingRight: 50
                            }}>
                                СИСТЕМЭЭС ГАРАХ
                            </span>
                        </div>
                        <div style={{ height: "50px", width: '100%', marginTop: '29px' }}>
                            <div style={{
                                display: 'flex',
                                height: "100%",
                                justifyContent: "space-between",
                                flexDirection: 'row',
                                borderTop: "2px solid #E8EDF6",
                                fontWeight: "600",
                                fontSize: '13px',
                                color: "#000000",
                                fontFamily: 'Segoe UI',
                            }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        flex: 0.5,
                                        backgroundColor: "#fff",
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        borderRight: "2px solid #E8EDF6",
                                        borderBottomLeftRadius: '1rem',
                                        cursor: 'pointer',
                                        paddingTop: "15px",
                                    }} onClick={() => logoutUser(user)}
                                    onMouseOver={HandleHover} onMouseOut={HandleHoverOut} >
                                    ТИЙМ
                                </div>
                                <div onMouseOver={HandleHover} onMouseOut={HandleHoverOut} style={{
                                    width: '100%',
                                    height: '100%',
                                    flex: 0.5,
                                    backgroundColor: "#fff",
                                    borderBottomRightRadius: '1rem',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    paddingTop: "15px"
                                }} onClick={() => { setPopupExit(false); }}>
                                    ҮГҮЙ

                                </div>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </div>
    )
}




