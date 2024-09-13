import React, {useContext, useEffect, useState, useRef} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule,Lookup,Popup as DataGridPopup,Form,Item
} from 'devextreme-react/data-grid';
import {LoadPanel} from "devextreme-react/load-panel";
import {UserContext} from "../../hooks/UserContext";
import refService from "../../services/api/ref";
import notify from "devextreme/ui/notify";
import RoleTagBoxComponent from "./components/RoleTagBoxComponent";
import {onCellPreparedHandler, operationDescriptions, resetOperationText, sortingText} from "../../util";
function RoleMenu(props) {
    const {user} = useContext(UserContext);
    const [dataSource, setDataSource] = useState([]);
    const [refStatus, setRefStatus] = useState([]);
    const [menu, setMenu] = useState([]);
    const [loader, setLoader] = useState(false);
    const myBabyRef = useRef(null);
    useEffect(() => {
        getList();
    }, [])

    const getList = async () => {
        try {
            setLoader(true);
            const result = await refService.getRoleMenu();
            //console.log('result ', result);
            setDataSource(result.data)
            const r = await refService.getRefStatus();
            setRefStatus(r);
            const r1 = await refService.getMenu();
            setMenu(r1.data);
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
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
    const onInitNewRow = (e) => {
    }
    const setEffect = async (e) => {
        if (e.changes && e.changes.length !== 0) {
            //console.log('e.changes', e.changes);
            if (e.changes[0].type === "update") {
                try {
                    e.changes[0].data.updated_user_id = user.id;
                    await refService.editRole(e.changes[0].data);
                    if (e.changes[0].data.role_menu && typeof e.changes[0].data.role_menu[0] === 'number') {
                        const newInfo = {
                            role_id: e.changes[0].key,
                            menu_id: e.changes[0].data.role_menu
                        }
                        //console.log('newInfo', newInfo);
                        await refService.updateRoleMenu(newInfo);
                    }
                    await getList();
                    notify('Амжилттай хадгалагдлаа', "success", 2000);
                } catch (e) {
                    notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
                }
            } else if (e.changes[0].type === "insert") {
                try {
                    delete e.changes[0].data.id;
                    e.changes[0].data.created_user_id = user.id;
                    let r = await refService.addRole(e.changes[0].data);
                    if (e.changes[0].data.role_menu && typeof e.changes[0].data.role_menu[0] === 'number') {
                        const newInfo = {
                            role_id: r.data.id,
                            menu_id: e.changes[0].data.role_menu
                        }
                        await refService.updateRoleMenu(newInfo);
                    }
                    await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    await refService.removeRole(e.changes[0].key);
                    await getList();
                    notify('Амжилттай устгагдлаа', "success", 2000);
                } catch (e) {
                    notify('Энэ талбар хуучин мэдээлэл дээр ашиглаж байгаа тул устгах боломжгүй байна!', "error", 2000);
                }

            }

        }

    }
    const cellTemplate = (container, options) => {
        let noBreakSpace = '\u00A0',
            text = (options.value || []).map(element => {
                return options.column.lookup.calculateCellValue(element);
            }).join(', ');
        container.textContent = text || noBreakSpace;
        container.title = text;
    }

    const calculateFilterExpression = (filterValue, selectedFilterOperation, target) => {
        if(target === 'filterRow' && typeof (filterValue) === 'number') {
            return ['role_menu', 'contains', filterValue];
        }
        return function(data) {
            return (data.role_menu || []).indexOf(filterValue) !== -1;
        };
    }
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
    return (
        <div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                message="Түр хүлээнэ үү..."
                showPane={false}
            />
            <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                   СИСТЕМИИЙН ЭРХ УДИРДАХ ХЭСЭГ
                </span>
            </div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                visible={loader}
                showPane={false}
                message="Түр хүлээнэ үү..."
            />
            <div>
                <div className="card" style={{padding:10}}>
                    <DataGrid
                        onEditorPreparing={onEditorPreparing}
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onSaved={setEffect}
                        keyExpr={"id"}
                        onInitNewRow={onInitNewRow}
                        allowColumnResizing={true}
                       // columnAutoWidth={true}
                        wordWrapEnabled={true}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true} sorting={sortingText}
                        onCellPrepared={(e) => {
                            return onCellPreparedHandler(e);
                        }}
                        onEditingStart={e => {
                            console.log('qqqqqqqqqqqqqqqqq', e);
                        }}
                    >

                        <FilterRow
                            visible={true} operationDescriptions={operationDescriptions}
                            resetOperationText={resetOperationText}
                        />
                        <Pager
                            showPageSizeSelector={true}
                            // showInfo={true}
                            showNavigationButtons={true}
                        />
                        <Column
                            dataField="id"
                            caption="ID"
                            allowEditing={false}
                            cssClass="custom"
                            allowFiltering={true}
                            width={50}
                        >
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="code"
                            caption="Код"
                            allowEditing={true}
                            allowFiltering={true}
                            width={50}
                        >
                            <RequiredRule
                                message='Код оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="name"
                            caption="Нэр"
                            allowEditing={true}
                            allowFiltering={true}
                            width={"120"}
                        >
                            <RequiredRule
                                message='Нэр оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="status"
                            caption="Төлөв"
                            allowEditing={true}
                            allowFiltering={true}
                            width={80}
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
                            dataField="role_menu"
                            caption="Системийн эрх"
                            allowFiltering={true}
                            editCellComponent={RoleTagBoxComponent}
                            cellTemplate={cellTemplate}
                            calculateFilterExpression={calculateFilterExpression}
                        >
                            <Lookup
                                dataSource={menu}
                                displayExpr="name"
                                valueExpr="id"
                            />
                            <RequiredRule />
                        </Column>
                        <Editing
                            mode="popup"
                            allowUpdating={ user.roles[0].role_code==='01' ? true : false }
                            allowDeleting={ user.roles[0].role_code==='01' ? true : false }
                            allowAdding={ user.roles[0].role_code==='01' ? true : false }
                            useIcons={true}
                            texts={{
                                cancelAllChanges: 'Болих бүгд',
                                cancelRowChanges: 'Болих',
                                confirmDeleteMessage: 'Энэ технологийн мэдээллийг устгах уу?',
                                confirmDeleteTitle: 'Баталгаажуулах',
                                deleteRow: 'Устгах',
                                editRow: 'Өөрчлөх',
                                saveAllChanges: 'Хадгалах бүгд',
                                saveRowChanges: 'Хадгалах',
                                undeleteRow: 'Буцаах',
                                validationCancelChanges: 'Баталгаажуулах болих',
                            }}
                        >
                            <DataGridPopup title="Системийн эрх удирдах" showTitle={true} width={700} height={350} closeOnOutsideClick={true}/>
                            <Form>
                                <Item itemType="group" colCount={1} colSpan={2}>
                                    <Item dataField="code"/>
                                    <Item dataField="name"/>
                                    <Item dataField="status"/>
                                    <Item dataField="role_menu"/>
                                </Item>
                            </Form>
                        </Editing>
                        <Paging enabled={true}/>
                    </DataGrid>
                </div>
            </div>
        </div>
    )
}

export default RoleMenu;
