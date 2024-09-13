import React, {useContext, useEffect, useState, useRef} from 'react';

import 'devextreme-react/text-area';
import Button from "devextreme-react/button";
import Form, {ButtonItem, ButtonOptions, Label, SimpleItem} from "devextreme-react/form";
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule,
    PatternRule,
    EmailRule,
    Lookup, ColumnChooser, Export, CustomRule, Form as GridForm, Item, Popup as GridPopup,Button as GridButton
} from 'devextreme-react/data-grid';
import {LoadPanel} from "devextreme-react/load-panel";
import notify from 'devextreme/ui/notify';
import Popup from "devextreme-react/popup";

import {UserContext} from "../../hooks/UserContext";
import AuthService from "../../services/api/auth";
import UserService from "../../services/api/user";
import RefService from "../../services/api/ref";
import {
    exportAllText,
    formatDate,
    onCellPreparedHandler,
    operationDescriptions,
    resetOperationText,
    sortingText
} from "../../util";
import {Workbook} from "exceljs";
import {exportDataGrid} from "devextreme/excel_exporter";
import {saveAs} from "file-saver-es";
import workerService from "../../services/api/worker";
import WorkerDropDownBoxComponent from "./components/WorkerDropDownBoxComponent";

function User(props) {
    const userListPosition = {of: '#usersList'}

    const {user} = useContext(UserContext);

    const [dataSource, setDataSource] = useState([]);
    const [loader, setLoader] = useState(false);
    const [orgList, setOrgList] = useState([]);
    const [refStatus, setRefStatus] = useState([]);
    const [role, setRole] = useState([]);
    const [passWordChangeInfo, setPassWordChangeInfo] = useState();
    const [passWordChangeLoader, setPasswordChangeLoader] = useState(false);
    const [newPassword, setNewPassword] = useState({
        actionType: 1,
        uniqueId: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [popupVisible, setPopupVisible] = useState(false);
    const [workerData, setWorkerData] = useState([])
    //console.log(user);
    const myBabyRef = useRef(null)

    useEffect(() => {
        userFetch();
        fetchOperatorList();
    }, [])

    const fetchOperatorList = async () => {
        try {
            const result = await RefService.getRefDepartment();
            return setOrgList(result)
        } catch (e) {
            return notify(e.message);
        }
    }

    const userFetch = async () => {
        try {
            setLoader(true);
            const result = await UserService.getUser();
            setDataSource(result);
            const r = await RefService.getRefStatus();
            setRefStatus(r);
            const r1 = await RefService.getRole();
            setRole(r1);
            const w = await workerService.getWorker();
            setWorkerData(w.data)
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }

    const setUser = async (e) => {
        try {
            let obj;
            obj = {
                data: e.changes[0].data,
                actionType: e.changes[0].type
            }
            obj.data.department_model && delete obj.data.department_model;
            obj.data.role_model && delete obj.data.role_model;
            console.log('obj', obj);
            await UserService.changeUserInfo(obj);
            await userFetch();
            notify('Амжилттай хадгалагдлаа', "success", 2000);
        } catch (e) {
            notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
        }
    }
    //Column custom renderings
    const statusRender = (data) => {
        if (data.value && data.value === 1) {
            return <div style={{
                backgroundColor: '#50CB93',
                width: '80%',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                margin: 'auto',
                textAlign: 'center'
            }}>Идэвхтэй</div>
        } else {
            return <div style={{
                backgroundColor: '#FF616D',
                width: '80%',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                margin: 'auto',
                textAlign: 'center'
            }}>Идэвхгүй</div>
        }
    }
    const columnInfo = async (data) => {
        await setPassWordChangeInfo(data.data);
        await setNewPassword((prevObject) => {
                return {
                    ...prevObject,
                    uniqueId: data.data.id
                };
            }
        );
        setPasswordChangeLoader(true);
    }

    const passwordCell = (data) => {
        return <div style={{textAlign: 'center'}}>
            <Button
                style={{width: '50%', height: '25px'}}
                type="default"
                icon='key'
                stylingMode="outlined"
                onClick={() => {
                    columnInfo(data)
                }}
            />
        </div>
    }
    const onEditorPreparing = (e) => {
        if (e.parentType === "dataRow" && e.dataField !== "password") {
            return;
        }
        if (e.row && e.row.isNewRow) {
            e.editorOptions.visible = true;
        }
        if (e.row && !e.row.isNewRow) {
            e.editorOptions.visible = false;
        }
    }

    const changePasswordProcedures = async (e) => {
        e.preventDefault();
        setPopupVisible(true);
        await setNewPassword(newPassword);
        if (newPassword.newPassword === newPassword.confirmPassword) {
            try {
                await AuthService.changePassword(newPassword);
                setPasswordChangeLoader(false);
                setPopupVisible(false);
                notify('Энэхүү хэрэглэгчийн нууц үг амжиллтай солигдлоо', "success", 2000);
            } catch (e) {
                console.error(e);
                notify('Нууц үг солих явцад алдаа гарлаа', "error", 2000);

            }
        } else {
            setPasswordChangeLoader(false);
            setPopupVisible(false);
            notify('Таны оруулсан нууц үг таарахгүй байна', "error", 2000);
        }

    }
    const passwordOptions = (e) => {
        console.log('emode ', e)
        e.mode = "password"
    };
    const onExporting = (e) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Main sheet');

        exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
            customizeCell: ({gridCell, excelCell}) => {

            },
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], {type: 'application/octet-stream'}), 'User' + formatDate(new Date()) + '.xlsx');
            });
        });
        e.cancel = true;
    }
    const handleToolbarPreparing = async (e) => {
        let addButton = e.toolbarOptions.items[0]
        let dataGrid = e.component;
        addButton = {
            ...addButton, showText: "always", options: {
                text: "Хэрэглэгч нэмэх", type: "default", icon: 'user', onClick: function () {
                    dataGrid.addRow();
                }
            }
        }
        e.toolbarOptions.items[0] = addButton;


    }
    const customValidation = (params) => {
        if (params.data.id === undefined) {
            let s = params.data.username;
            let source = myBabyRef.current.instance.getDataSource()._items;
            let res = source.filter(item => item.username === s);
            params.rule.message = `Нэвтрэх нар давхардаж байна`
            return res.length === 0
        } else {
            //setVisibleOgnoo(false)
            return 0 === 0
        }
    }

    return (
        <div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                visible={popupVisible}
                showPane={false}
                message=''
            />
            <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                    ХЭРЭГЛЭГЧ УДИРДАХ ХЭСЭГ
                </span>
            </div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={userListPosition}
                visible={loader}
                showPane={false}
                message=''
            />
            <div>
                <div className="card" style={{padding: 5}}>
                    <DataGrid
                        onEditorPreparing={onEditorPreparing}
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onSaved={setUser}
                        //keyExpr={"id"}
                        onToolbarPreparing={handleToolbarPreparing}
                        allowColumnResizing={true}
                        columnAutoWidth={true}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true} sorting={sortingText}
                        onCellPrepared={(e) => {
                            return onCellPreparedHandler(e);
                        }}
                        noDataText="Дата байхгүй байна."
                        onExporting={onExporting}
                        //focusedRowEnabled={true}
                    >
                        <FilterRow
                            visible={true} operationDescriptions={operationDescriptions}
                            resetOperationText={resetOperationText}
                        />
                        <ColumnChooser
                            enabled={true} height={"100%"} allowSearch={true}
                            mode="select"
                            title={'Багана сонгох'}
                        />
                        <Export enabled={true} allowExportSelectedData={false} texts={{exportAll: exportAllText}}/>
                        <Pager
                            showPageSizeSelector={true}
                            // showInfo={true}
                            showNavigationButtons={true}
                        />
                        {/*<Column
                            caption='ID'
                            cssClass="custom"
                            dataField="id"
                            width={50}
                            allowEditing={false}
                        />*/}
                        <Column
                            cssClass="custom"
                            dataField="username"
                            caption="Нэвтрэх нэр"
                            allowEditing={user.roles[0].role_code === '01' ? true : false}
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Нэвтрэх нэрийг оруулна уу'
                            />
                            <CustomRule
                                type="custom"
                                message={"Нэвтрэх нар давхардаж байна"}
                                validationCallback={customValidation}
                            />
                        </Column>
                        <Column dataField="worker_id" caption="Албан хаагч" dataType="string"
                                editCellComponent={WorkerDropDownBoxComponent}>
                            <Lookup
                                valueExpr="id"
                                displayExpr="display_name"
                                dataSource={workerData}
                            />
                        </Column>
                        <Column
                            dataField="last_name"
                            caption="Овог"
                            allowEditing={true}
                            // editCellTemplate = {}
                            // cellRender = {customize}
                            cssClass="custom"
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Овог оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="first_name"
                            caption="Нэр"
                            allowEditing={true}
                            allowCollapsing={false}
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Нэр оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="email"
                            caption="Имэйл"
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Имэйлийг оруулна уу'
                            />
                            <EmailRule message={'Email оруулна уу!'}/>
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="phone"
                            caption="Утас"
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Утас оруулна уу'
                            />
                            <PatternRule pattern={/^\d+$/} message='зөвхөн тоо оруулна уу!'/>
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="department_id"
                            caption="Оператор"
                            allowEditing={user.roles[0].role_code === '01' ? true : false}
                            allowFiltering={true}
                        >
                            <Lookup
                                dataSource={orgList}
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                valueExpr="id"
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="status"
                            caption="Төлөв"
                            allowEditing={user.roles[0].role_code === '01' ? true : false}
                            allowFiltering={true}
                            cellRender={statusRender}
                        >
                            <RequiredRule
                                message='Төлөв оруулна уу'
                            />
                            <Lookup
                                valueExpr="id"
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                dataSource={refStatus}
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="password"
                            caption="Нууц үг"
                            // allowEditing={user.roles[0].role_code==='01' ? true : false }
                            allowFiltering={false}
                            cellRender={passwordCell}
                        >
                            <RequiredRule message='Нууц үг оруулах шаардлагатай!'/>
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="role_id"
                            caption="Эрхийн түвшин"
                            allowEditing={user.roles[0].role_code === '01' ? true : false}
                            allowFiltering={true}
                        >
                            <Lookup
                                dataSource={role}
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                valueExpr="id"
                            />
                        </Column>
                        <Editing
                            mode="form"
                            allowUpdating={true}
                            allowAdding={user.roles[0].role_code === '01' ? true : false}
                            allowDeleting={user.roles[0].role_code === '01' ? true : false}
                            confirmDelete={true}
                            useIcons={true}
                            confirmSave={true}
                            texts={{
                                cancelAllChanges: 'Болих бүгд',
                                cancelRowChanges: 'Болих',
                                confirmDeleteMessage: 'Энэ хэрэглэгчийн мэдээллийг устгах уу?',
                                confirmDeleteTitle: 'Баталгаажуулах',
                                deleteRow: 'Устгах',
                                editRow: 'Өөрчлөх',
                                addRow: 'Хэрэглэгч нэмэх',
                                saveAllChanges: 'Хадгалах бүгд',
                                saveRowChanges: 'Хадгалах',
                                undeleteRow: 'Буцаах',
                                validationCancelChanges: 'Баталгаажуулах болих',
                            }}
                        >
                        </Editing>

                        <Paging enabled={true}/>
                    </DataGrid>
                </div>
            </div>
            <Popup
                id='passwordChangePopup'
                visible={passWordChangeLoader}
                onHiding={() => setPasswordChangeLoader(false)}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={true}
                title={passWordChangeInfo != undefined && ` Овог:  ${passWordChangeInfo.last_name} - Нэр: ${passWordChangeInfo.first_name}`}
                width={500}
                height='auto'
            >
                <form onSubmit={changePasswordProcedures}>
                    <Form
                        formData={newPassword}
                    >
                        <SimpleItem dataField="newPassword" isRequired={true}>
                            <Label text="Шинэ нууц үг"/>
                            <RequiredRule
                                message='Шинэ нууц үгээ оруулна уу'
                            />
                        </SimpleItem>
                        <SimpleItem dataField="confirmPassword" isRequired={true}>
                            <Label text="Шинэ нууц үг(Давтах)"/>
                            <RequiredRule
                                message='Шинэ нууц үгээ давтана уу'
                            />
                        </SimpleItem>
                        <ButtonItem
                            horizontalAlignment="right"
                        >
                            <ButtonOptions
                                type="submit"
                                method='submit'
                                useSubmitBehavior={true}
                                text='Нууц үгийг солих'
                                type='default'
                            />
                        </ButtonItem>
                    </Form>
                </form>
            </Popup>
        </div>
    )
}

export default User;
