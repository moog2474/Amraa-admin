import React, {useContext, useEffect, useState, useRef} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule, Lookup, CustomRule, EmailRule, PatternRule
} from 'devextreme-react/data-grid';
import {UserContext} from "../../hooks/UserContext";
import refService from "../../services/api/ref";
import workerService from "../../services/api/worker";
import notify from "devextreme/ui/notify";
import {onCellPreparedHandler, operationDescriptions, resetOperationText, sortingText} from "../../util";
import {LoadPanel} from "devextreme-react/load-panel";

const shiftData = [{id:1,name:'1-р ээлж'},{id:2,name:'2-р ээлж'}]

function Worker(props) {
    const {user} = useContext(UserContext);
    const [dataSource, setDataSource] = useState([]);
    const [refDepartment, setRefDepartment] = useState([]);
    const [refPosition, setRefPosition] = useState([]);
    const [workerStatus, setWorkerStatus] = useState([]);
    const [loader, setLoader] = useState(false);
    const myBabyRef = useRef(null);
   // const [visibleCode, setVisibleCode] = useState(true);
    useEffect(() => {
        getList();
    }, [])

    const getList = async () => {
        try {
            setLoader(true);
            let result = await workerService.getWorker();
            setDataSource(result.data)
            let d = await refService.getRefDepartment();
            setRefDepartment(d);
            let p = await refService.getRefPosition();
            setRefPosition(p);
            let s = await refService.getWorkerStatus();
            setWorkerStatus(s);
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }

    const setEffect = async (e) => {
        if (e.changes && e.changes.length !== 0) {
            if (e.changes[0].type === "update") {
                try {
                    e.changes[0].data.updated_user_id = user.id;
                    await workerService.editWorker(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай хадгалагдлаа', "success", 2000);
                } catch (e) {
                    notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
                }
            }
            else if (e.changes[0].type === "insert") {
                try {
                    delete e.changes[0].data.id;
                    e.changes[0].data.created_user_id = user.id;
                    e.changes[0].data.status = 1;
                    await workerService.addWorker(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    await workerService.removeWorker(e.changes[0].key);
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
        //setVisibleCode(false)
    }
    const onInitNewRow = (e) => {
        //console.log('onInitNewRow', e);
        //setVisibleCode(true)
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
                АЖИЛТАН УДИРДАХ ХЭСЭГ
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
                        keyExpr={"id"}
                        allowColumnResizing={true}
                        columnAutoWidth={true}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true} sorting={sortingText}
                        //onInitNewRow={onInitNewRow}
                        //onEditingStart={onEditingStart}
                        wordWrapEnabled={true}
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
                            cssClass="custom"
                            dataField="department_id"
                            caption="Алба хэлтэс"
                            allowEditing={true}
                            allowFiltering={true} groupIndex={0}
                        >
                            <Lookup
                                dataSource={refDepartment}
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                valueExpr="id"
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="position_id"
                            caption="Албан тушаал"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                            <Lookup
                                dataSource={refPosition}
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                valueExpr="id"
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="worker_status"
                            caption="Ажилтаны төлөв"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                            <Lookup
                                dataSource={workerStatus}
                                displayExpr={(item) => {
                                    return item && `${item.code} - ${item.name}`
                                }}
                                valueExpr="id"
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="shift_id"
                            caption="Ээлж"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                            <Lookup
                                dataSource={shiftData}
                                displayExpr="name"
                                valueExpr="id"
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
                            dataField="mobile"
                            caption="Гар утас"
                            allowFiltering={true}
                        >
                            <RequiredRule
                                message='Гар утас оруулна уу'
                            />
                            <PatternRule pattern={/^\d+$/} message='зөвхөн тоо оруулна уу!'/>
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="phone"
                            caption="Ажилын утас"
                            allowFiltering={true}
                        >
                            <PatternRule pattern={/^\d+$/} message='зөвхөн тоо оруулна уу!'/>
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="address"
                            caption="Хаяг"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="start_date"
                            dataType={"date"}
                            caption="Ажилд орсон огноо"
                            allowEditing={true} width={80}
                            allowFiltering={true}
                        >
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="end_date"
                            dataType={"date"} width={80}
                            caption="Ажилаас гарсан огноо"
                            allowEditing={true}
                            allowFiltering={true}
                        >
                        </Column>
                        <Editing
                            mode="form"
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

export default Worker;
