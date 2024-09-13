import React, {useContext, useEffect, useState, useRef} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule, Lookup, CustomRule
} from 'devextreme-react/data-grid';
import {UserContext} from "../../hooks/UserContext";
import refService from "../../services/api/ref";
import notify from "devextreme/ui/notify";
import {onCellPreparedHandler, operationDescriptions, resetOperationText, sortingText} from "../../util";
import {LoadPanel} from "devextreme-react/load-panel";

function RefPosition(props) {
    const {user} = useContext(UserContext);
    const [dataSource, setDataSource] = useState([]);
    const [refStatus, setRefStatus] = useState([]);
    const [loader, setLoader] = useState(false);
    const myBabyRef = useRef(null);
    const [visibleCode, setVisibleCode] = useState(true);
    useEffect(() => {
        getList();
    }, [])

    const getList = async () => {
        try {
            setLoader(true);
            const result = await refService.getRefPosition();
            setDataSource(result)
            const r = await refService.getRefStatus();
            setRefStatus(r);
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }

    const setEffect = async (e) => {
        if (e.changes && e.changes.length !== 0) {
            console.log('e.changes', e.changes);
            if (e.changes[0].type === "update") {
                try {
                    e.changes[0].data.updated_user_id = user.id;
                    await refService.editRefPosition(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай хадгалагдлаа', "success", 2000);
                } catch (e) {
                    notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
                }
            } else if (e.changes[0].type === "insert") {
                try {
                    delete e.changes[0].data.id;
                    e.changes[0].data.created_user_id = user.id;
                    await refService.addRefPosition(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    await refService.removeRefPosition(e.changes[0].key);
                    //await getList();
                    notify('Амжилттай устгагдлаа', "success", 2000);
                } catch (e) {
                    notify('Энэ талбар хуучин мэдээлэл дээр ашиглаж байгаа тул устгах боломжгүй байна!', "error", 2000);
                }

            }

        }

    }
    const customValidation = (params) => {
        if (params.data.id === undefined) {
            let s = params.data.code;
            let source = myBabyRef.current.instance.getDataSource()._items;
            let res = source.filter(item => item.code === s);
            params.rule.message = `Код давхардаж байна`
            return res.length === 0
        } else {
            //setVisibleOgnoo(false)
            return 0 === 0
        }
    }
    const onEditingStart = (e) => {
        //console.log('onEditingStart', e);
        setVisibleCode(false)
    }
    const onInitNewRow = (e) => {
        //console.log('onInitNewRow', e);
        setVisibleCode(true)
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
        <div id="load">
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                visible={loader}
                showPane={false}
                message="Түр хүлээнэ үү..."
            />
            <div className="card" style={{flexDirection:'row',alignItems:'center', justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                   АЛБАН ТУШААЛ УДИРДАХ ХЭСЭГ
                </span>
            </div>
            <div>
                <div className="card" style={{padding:10}}>
                    <DataGrid
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onCellPrepared={(e) => {
                            return onCellPreparedHandler(e);
                        }}
                        onSaved={setEffect}
                        keyExpr={"code"}
                        allowColumnResizing={true}
                        columnAutoWidth={true}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true} sorting={sortingText}
                        onInitNewRow={onInitNewRow}
                        onEditingStart={onEditingStart}
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
                        {/* <Column
                            dataField="id"
                            caption="ID"
                            allowEditing={false}
                            cssClass="custom"
                            allowFiltering={true}
                            width={50}
                        >
                        </Column>*/}
                        <Column
                            cssClass="custom"
                            dataField="code"
                            caption="Код"
                            allowFiltering={true}
                            allowEditing={visibleCode}
                            sortOrder={'asc'}
                        >
                            <RequiredRule
                                message='Код оруулна уу'
                            />
                            <CustomRule
                                type="custom"
                                message={"Код давхардаж байна"}
                                validationCallback={customValidation}
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="name"
                            caption="Нэр"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Нэр оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="position_duty"
                            caption="Чиг үүрэг"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="description"
                            caption="Дэлгэрэнгүй"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="status"
                            caption="Төлөв"
                            allowEditing={true}
                            allowFiltering={true}
                            width={120}
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
                        <Editing
                            mode="row"
                            allowUpdating={true}
                            allowDeleting={true}
                            allowAdding={true}
                            useIcons={true}
                            texts={{
                                cancelAllChanges: 'Болих бүгд',
                                cancelRowChanges: 'Болих',
                                confirmDeleteMessage: 'Энэ мэдээллийг устгах уу?',
                                confirmDeleteTitle: 'Баталгаажуулах',
                                deleteRow: 'Устгах',
                                editRow: 'Өөрчлөх',
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
        </div>
    )
}

export default RefPosition;
