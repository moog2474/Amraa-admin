import React, {useContext, useEffect, useState, useRef, useCallback,useMemo} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule, ColumnFixing, CustomRule, Button as DevButton, Export, ColumnChooser,Summary,TotalItem,Lookup,HeaderFilter,MasterDetail,
    Scrolling
} from 'devextreme-react/data-grid';
import {LoadPanel} from "devextreme-react/load-panel";
import {UserContext} from "../../hooks/UserContext";
import CopperService from "../../services/api/copper";
import notify from "devextreme/ui/notify";
import {
    onCellPreparedHandler,
    sortingText,
    operationDescriptions,
    resetOperationText,
    exportAllText, formatDate, numberWithCommas, HeaderFilterText
} from "../../util/index"
import {Workbook} from 'exceljs';
import {saveAs} from "file-saver-es";
import {exportDataGrid} from 'devextreme/excel_exporter';
import DateRangeBox from 'devextreme-react/date-range-box';
import moment from "moment";
import Button from "devextreme-react/button";
import RefService from "../../services/api/ref";
import {custom} from "devextreme/ui/dialog";
import CopperProductTransferLog from "./CopperProductTransferLog";
import { Popup } from 'devextreme-react';
const shiftData = [{value:'I'},{value:'II'}]

function CopperProduct(props) {
    const {user} = useContext(UserContext);
    const [dataSource, setDataSource] = useState([]);
    const [loader, setLoader] = useState(false);
    const [visibleOgnoo, setVisibleOgnoo] = useState(true);
    const myBabyRef = useRef(null)
    const [modalImport, setModalImport] = useState(false);
    const msInDay = 1000 * 60 * 60 * 24;
    const initialValue = [moment().startOf('month'), moment().endOf('month')];

    function convertRangeToDays([startDate, endDate]) {
        const diffInDay = Math.floor(Math.abs((endDate.valueOf() - startDate.valueOf()) / msInDay));
        return diffInDay + 1;
    }
    const targetRef = useRef(null)
    const [visible, setVisible] = useState(false)
    const [rowData, setRowData] = useState({})
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
    const [selectedDays, setSelectedDays] = useState(convertRangeToDays(initialValue));
    const [pageSize, setPageSize] = useState(50);
    const [actionStatus, setActionStatus] = useState([]);
    const sendAction = useMemo(() => [1,4], []);
    const confirmAction = useMemo(() => [2], []);
    const denyAction = useMemo(() => [2], []);
    const deleteAction = useMemo(() => [1,2,4], []);
    const [copperProductTransferLog, setCopperProductTransferLog] = useState([]);
    useEffect(() => {
        getList();
        getData()
    }, [])
    const getData = async()=>{
        try{
            const r = await RefService.getActionStatus();
            setActionStatus(r);
        } catch(err){
        console.error('err');
        }
    }
    const setVisibleSendAction = (e) => {
        return sendAction.includes(e.row.data.action_status);
    };
    const setVisibleConfirmAction = (e) => {
        return confirmAction.includes(e.row.data.action_status);
    };
    const setVisibleDenyAction = (e) => {
        return denyAction.includes(e.row.data.action_status);
    };
    const setVisibleDeleteAction = (e) => {
        return deleteAction.includes(e.row.data.action_status);
    };
    const getList = async () => {
        try {
            setLoader(true);
            const result = await CopperService.getCopperProduct(startDate, endDate);
            setDataSource(result.data);
      
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }
    const getCopperProductTransferLog = async (pId) => {
        try {
            setLoader(true);
            const result = await CopperService.getCopperProductTransferLogs(pId);
            setCopperProductTransferLog(result.data);
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
                    e.changes[0].data.status = 1;
                    await CopperService.editCopperProduct(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай хадгалагдлаа', "success", 2000);
                } catch (e) {
                    notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
                }
            } else if (e.changes[0].type === "insert") {
                try {
                    delete e.changes[0].data.id;
                    e.changes[0].data.created_user_id = user.id;
                    e.changes[0].data.status = 1;
                    e.changes[0].data.action_status = 1;
                    await CopperService.addCopperProduct(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    let r = await CopperService.removeCopperProduct(e.changes[0].key);
                    await getList();
                    return notify(r.message, r.code === 200 ? "success" : "error", 2000);
                } catch (e) {
                    notify('Энэ талбар хуучин мэдээлэл дээр ашиглаж байгаа тул устгах боломжгүй байна!', "error", 2000);
                }

            }

        }

    }

    const textAreaOptions = {format: '#,##0'};

    const customValidation = (params) => {
        if (params.data.id === undefined) {
            let s = params.data.ognoo;
            let source = myBabyRef.current.instance.getDataSource()._items;
            let res = source.filter(item => item.ognoo === s);
            params.rule.message = `Огноо давхардаж байна`
            return res.length === 0
        } else {
            //setVisibleOgnoo(false)
            return 0 === 0
        }
    }
    const onEditingStart = (e) => {
        //console.log('onEditingStart', e);
        setVisibleOgnoo(false)
    }
    const onInitNewRow = (e) => {
        //console.log('onInitNewRow', e);
        setVisibleOgnoo(true)
    }
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
                saveAs(new Blob([buffer], {type: 'application/octet-stream'}), 'CopperProduct' + formatDate(new Date()) + '.xlsx');
            });
        });
        e.cancel = true;
    }
    const setVisibleDelete = (e) => {
        let r = e.row.data && e.row.data.technology_performance_model ? false : true;
        return r;
    };
    const onChangeModalImport = (e) => {
        setModalImport(true);
        //alert('Coming soon from excel')
    }
    // const handleToolbarPreparing = async (e) => {
    //     let addButton = e.toolbarOptions.items[0]
    //     //let exportButton = e.toolbarOptions.items[1]
    //     let dataGrid = e.component;
    //     addButton = {
    //         ...addButton, showText: "always", options: {
    //             text: "Бүтээгдхүүн нэмэх", type: "default", icon: 'add', onClick: function () {
    //                 dataGrid.addRow();
    //             }
    //         }
    //     }
    //     e.toolbarOptions.items[0] = addButton;
    // }
    const onCurrentValueChange = useCallback(
        ({value: [startDate1, endDate1]}) => {
            let daysCount = 0;
            if (startDate1 && endDate1) {
                daysCount = convertRangeToDays([startDate1, endDate1]);
            }
            setStartDate(moment(startDate1).format('YYYY-MM-DD'));
            setEndDate(moment(endDate1).format('YYYY-MM-DD'));
            setSelectedDays(daysCount);
            //startDate1 && endDate1 && getList()
        },
        [setSelectedDays],
    );
    const getSearch = async () => {
        try {
            setLoader(true);
            getList()
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }

    }
    const calcProductionNumber = (newData, value, currentRowData) => {
        //console.log('currentRowData', currentRowData);
        newData.production_number = value || 0;
        newData.accumulated_production_number = (isNaN(currentRowData.begin_balance_number * 1) ? 0 : currentRowData.begin_balance_number * 1 ) + value;
        newData.begin_balance_bundled_products_number =  (isNaN(currentRowData.lag_ending_balance_bundled_products_number * 1) ? 0 : currentRowData.lag_ending_balance_bundled_products_number * 1 ) + value;
        newData.ending_balance_bundled_products_number =  (isNaN(currentRowData.lag_ending_balance_bundled_products_number * 1) ? 0 : currentRowData.lag_ending_balance_bundled_products_number * 1 ) + value  - (isNaN(currentRowData.bundled_number * 1) ? 0 : currentRowData.bundled_number * 1 );
        newData.ending_balance_number = (isNaN(currentRowData.begin_balance_number * 1) ? 0 : currentRowData.begin_balance_number * 1 ) + value - (isNaN(currentRowData.shipped_number * 1) ? 0 : currentRowData.shipped_number * 1 ) -(isNaN(currentRowData.used_barter_sales_number * 1) ? 0 : currentRowData.used_barter_sales_number * 1 );

    }
    const calcBeginBalanceNumber = (newData, value, currentRowData) => {
        newData.begin_balance_number = value;
        newData.accumulated_production_number = (isNaN(currentRowData.production_number * 1) ? 0 : currentRowData.production_number * 1 ) + value;
    }
    const calcProductionWeight = (newData, value, currentRowData) => {
        newData.production_weight = value;
        newData.accumulated_production_weight = (isNaN(currentRowData.begin_balance_weight * 1) ? 0 : currentRowData.begin_balance_weight * 1 ) + value;
        newData.begin_balance_bundled_products_weight =  (isNaN(currentRowData.lag_ending_balance_bundled_products_weight * 1) ? 0 : currentRowData.lag_ending_balance_bundled_products_weight * 1 ) + value;
        newData.ending_balance_bundled_products_weight =  (isNaN(currentRowData.lag_ending_balance_bundled_products_weight * 1) ? 0 : currentRowData.lag_ending_balance_bundled_products_weight * 1 ) + value  - (isNaN(currentRowData.bundled_weight * 1) ? 0 : currentRowData.bundled_weight * 1 );
        newData.ending_balance_weight = (isNaN(currentRowData.begin_balance_weight * 1) ? 0 : currentRowData.begin_balance_weight * 1 ) + value - (isNaN(currentRowData.shipped_weight * 1) ? 0 : currentRowData.shipped_weight * 1 ) -(isNaN(currentRowData.used_barter_sales_weight * 1) ? 0 : currentRowData.used_barter_sales_weight * 1 );
    }
    const calcBeginBalanceWeight = (newData, value, currentRowData) => {
        newData.begin_balance_weight = value;
        newData.accumulated_production_weight = (isNaN(currentRowData.production_weight * 1) ? 0 : currentRowData.production_weight * 1 ) + value;
    }

    const calcBundledNumber = (newData, value, currentRowData) => {
        newData.bundled_number = value;
        newData.ending_balance_bundled_products_number = (isNaN(currentRowData.begin_balance_bundled_products_number * 1) ? 0 : currentRowData.begin_balance_bundled_products_number * 1 ) - value;
    }

    const calcBundledWeight = (newData, value, currentRowData) => {
        newData.bundled_weight = value;
        newData.ending_balance_bundled_products_weight = (isNaN(currentRowData.begin_balance_bundled_products_weight * 1) ? 0 : currentRowData.begin_balance_bundled_products_weight * 1 ) - value;
    }

    const calcShippedNumber = (newData, value, currentRowData) => {
        newData.shipped_number = value;
        newData.ending_balance_number = (isNaN(currentRowData.accumulated_production_number * 1) ? 0 : currentRowData.accumulated_production_number * 1 ) - value - (isNaN(currentRowData.used_barter_sales_number * 1) ? 0 : currentRowData.used_barter_sales_number * 1 );
    }

    const calcShippedWeight = (newData, value, currentRowData) => {
        newData.shipped_weight = value;
        newData.ending_balance_weight = (isNaN(currentRowData.accumulated_production_weight * 1) ? 0 : currentRowData.accumulated_production_weight * 1 ) - value - (isNaN(currentRowData.used_barter_sales_weight * 1) ? 0 : currentRowData.used_barter_sales_weight * 1 );
    }

    const calcBundledLotNo = (newData, value, currentRowData) => {
        newData.bundled_lot_no = value;
        newData.ending_balance_lot_no = value;
    }
    const calcBundledBundleNo = (newData, value, currentRowData) => {
        newData.bundled_bundle_no = value;
        newData.ending_balance_bundle_no = value;
    }
    const calcOgnoo = async (newData, value, currentRowData) => {
        newData.ognoo = value;
        let result = await CopperService.getCopperProductByDateMax(moment(value).format('YYYY-MM-DD'));
        //console.log('result', result);
        if(result.data.length === 1) {
        newData.begin_balance_number = result.data[0].ending_balance_number;
        newData.begin_balance_weight = result.data[0].ending_balance_weight;
        newData.lag_ending_balance_weight = result.data[0].ending_balance_weight;
        newData.lag_ending_balance_bundled_products_number = result.data[0].ending_balance_bundled_products_number;
        newData.lag_ending_balance_bundled_products_weight = result.data[0].ending_balance_bundled_products_weight;
        }

        // newData.ending_balance_lot_no = value;
    }

    const cellRenderStatus = (data) => {
        return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span className={`action-status-${data.value}`}>{data.displayValue}</span>
        </div>
    };

    const modifyStatus = useCallback(async (nextStatus, copperProductId, currentStatus) => {
        setLoader(true);
        //console.log("modifying request",request)
        const req = {
            "id": copperProductId,
            "current_status": currentStatus,
            "change_status": nextStatus,
            "comment": 'Тайлбар бичигдээгүй',
        }
        //console.log('req', req);
        await CopperService.changeStatus(req).then((res) => {
        })
            .catch((e) => {
                setLoader(false);
                console.log("err->", e)
            })
            .finally(() => {
                //setLogComment(null);
                setLoader(false);
            })
    }, [])

    const getDescriptionPrev = useCallback((status) => {
        switch (status) {
            case 1:
                return `<p style='color: black;'>Та энэ бүтээгдхүүнийг <strong style='color: #50c787;'>илгээхдээ</strong> итгэлтэй байна уу?</p>`;
            case 2:
                return `<p style='color: black;'>Та энэ бүтээгдхүүнийг <strong style='color: #50c787;'>баталгаажуулахдаа</strong> итгэлтэй байна уу?</p>`;
            case 4:
                return `<p style='color: black;'>Та энэ бүтээгдхүүнийг <strong style='color: #50c787;'>илгээхдээ</strong> итгэлтэй байна уу?</p>`;
            /*case 3:
                return `<p style='color: black;'>Та энэ саналыг <strong style='color: #50c787;'>төсвийн ерөнхийлөн захирагч руу илгээхдээ</strong> итгэлтэй байна уу?</p>`;
            case 4:
                return `<p style='color: black;'>Та энэ саналыг <strong style='color: #50c787;'>нэгтгэхдээ</strong> итгэлтэй байна уу?</p>`; //'merge'
            case 5:
                return `<p style='color: black;'>Та энэ саналыг <strong style='color: #50c787;'>СЯ-руу хүргүүлэхдээ</strong> итгэлтэй байна уу?</p>`;//'merge'*/
            default:
                return 'Тодорхойлогдоогүй тайлбар' // 'not defined status code
        }
    }, [])

    const getDescription = useCallback((status) => {
        switch (status) {
            case 1:
                return 'Дараагийн хэрэглэгч рүү илгээгдлээ';
            case 2:
                return 'Бүтээгдхүүн баталгаажлаа';
            default:
                return 'Тодорхойлогдоогүй тайлбар' // 'not defined status code
        }
    }, [])

    const getNextActionProceed = useCallback((status, isCancel, isDelete) => {
        switch (status) {
            case 1:  //ШИНЭ
                return isDelete ? 5 : 2;
            case 2:  //ИЛГЭЭСЭН
                return isCancel ? 4 : (isDelete ? 5 : 3);
            case 4: //ТАТГАЛЗСАН
                return isDelete ? 5 : 2;
            default:
                // console.log("err baihgui", status)
                return status
        }
    }, [])

    const onClickAction = async (e, action) => {
        let status = e.row.data.action_status;
        action = (action === 'deny' && status === 4 ? 'approve' : action)
        let isCancel = action === 'deny' ? true : false;
        let isDelete = action === 'delete' ? true : false;
        let title, messageHtml;
        if (action === 'approve') {
            title = "Condition is true";
            messageHtml = getDescriptionPrev(status);
        } else if (action === 'deny') {
            title = "Condition is false";
            messageHtml = "<p style='color: black;'>Та энэ бүтээгдхүүнийг <strong style='color: #F55A5A;'>ТАТГАЛЗАХДАА</strong> итгэлтэй байна уу?</p>";
        }
        else if (action === 'delete') {
            title = "Condition is false";
            messageHtml = "<p style='color: black;'>Та энэ бүтээгдхүүнийг <strong style='color: #F55A5A;'>УСТГАХДАА</strong> итгэлтэй байна уу?</p>";
        }

       /* if (!action.includes('approve','deny','delete')) {
            notify(`Өгөгдөл дутуу байна`);
            return;
        }*/

        const customConfirm = custom({
            title: "Баталгаажуулалт",
            messageHtml: messageHtml,
            buttons: [
                {
                    text: "Тийм",
                    onClick: (e) => {
                        return true
                    },
                },
                {
                    text: "Үгүй",
                    onClick: (e) => {
                        return false
                    },
                },
            ],
        })

        customConfirm.show().then(async (dialogResult) => {
            if (dialogResult) {
                try {
                    let description = isCancel ? 'цуцлагдлаа' : (isDelete ? 'устгагдлаа' : getDescription(status));
                    let nextStatus = null
                    switch (action) {
                        case "deny":
                            nextStatus = getNextActionProceed(status, true, false);
                            break;
                        case "approve":
                            nextStatus = getNextActionProceed(status, false, false);
                            break;
                        case "delete":
                            nextStatus = getNextActionProceed(status, false, true);
                            break;
                        default:
                            break;
                    }
                    //console.log('nextStatus', nextStatus);
                    modifyStatus(nextStatus, e.row.data.id, status);
                    await getList();
                    notify(`${e.row.data.ognoo} - өдрийн ${e.row.data.shift} -р ээлжийн ${e.row.data.shift_master} ээлжийг мастерийн ${description}`, "success", 2000);
                    //pushNotif(e.row.data.id, action, e.row.data.org_id, e.row.data.budget_year, e.row.data.budget_project_type)
                } catch (e) {
                    console.log(e);
                    notify(`Алдаа гарлаа`, 'error');
                }
            }
        });
    };

    return (
        <React.Fragment>
            {/*<div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                    ЗЭСИЙН БҮТЭЭГДХҮҮН УДИРДАХ ХЭСЭГ
                </span>
            </div>*/}
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                // position={{of: '#ProductTable'}}
                visible={loader}
                showPane={false}
                message="Түр хүлээнэ үү..."
            />
            <div>

                <div className="card" style={{padding: 5}}>
                    <div style={{flexDirection:'row',justifyContent:'space-between',display:'flex',alignItems:'center',marginBottom:10}}>
                        <div className="col-4 row">
                            ЗЭСИЙН БҮТЭЭГДХҮҮН УДИРДАХ ХЭСЭГ
                        </div>
                        <div className="col-8 row" style={{
                            justifyContent: "flex-end",
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row'
                        }}>
                            <div>
                                {/* <span>Огноогоор шүүх</span>*/}
                                <div className="selected-days-wrapper ">
                                    <span>Сонгогдсон өдрийн тоо: </span>
                                    <span>{selectedDays}</span>
                                </div>
                            </div>
                            <div style={{marginLeft: 10}}>
                                <DateRangeBox
                                    defaultValue={initialValue}
                                    onValueChanged={onCurrentValueChange}
                                    startDateText={'Эхлэх огноо'}
                                    endDateText={'Дуусах огноо'}
                                    startDatePlaceholder={"Эхлэх огноо"}
                                    endDatePlaceholder={"Дуусах огноо"}
                                    startDateLabel={"Эхлэх огноо"}
                                    endDateLabel={"Дуусах огноо"}
                                    displayFormat="yyyy-MM-dd"
                                    applyButtonText="Сонгох"
                                    cancelButtonText="Болих"
                                    invalidStartDateMessage={'Формат буруу байна жишээ нь 2024-01-01'}
                                    invalidEndDateMessage={'Формат буруу байна жишээ нь 2024-01-31'}
                                />
                            </div>
                            <div style={{marginLeft: 10, marginTop: 8}}>
                                <Button id="searchButton" icon="search" text="Хайх" onClick={() => getSearch()}
                                        type="default"/>
                            </div>
                        </div>
                    </div>

                    <DataGrid
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onSaved={setEffect}
                        keyExpr={"id"}
                        id='ProductTable'
                        // onInitNewRow={onInitNewRow}
                        // onEditingStart={onEditingStart}
                        allowColumnResizing={true}
                        // onToolbarPreparing={handleToolbarPreparing}
                        wordWrapEnabled={true}
                        // columnAutoWidth={true}
                        onCellPrepared={onCellPreparedHandler}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true}
                        columnMinWidth={100}
                        onRowClick={(e)=>{
                            if( e.rowType === 'data' && e.data.production_number !== null){
                                setVisible(true)
                                setRowData({shift_id: e.data.shift_id, shift_date: e.data.ognoo, lot_no: e.data.bundled_lot_no})
                            }
                        }}
                        sorting={sortingText}
                        onExporting={onExporting}
                        focusedRowEnabled={true}
                        paging={{enabled: true, pageSize: pageSize}}
                        noDataText="Дата байхгүй байна."
                    >
                        <Scrolling useNative={false} scrollByContent={true}/>
                        <Export enabled={true} allowExportSelectedData={false} texts={{exportAll: exportAllText}}/>
                        {/*<FilterRow
                            visible={true} operationDescriptions={operationDescriptions} resetOperationText={resetOperationText}
                        />*/}
                        <HeaderFilter visible={true} texts={HeaderFilterText}/>
                        <ColumnChooser
                            enabled={true} height={"100%"} allowSearch={true}
                            mode="select"
                            title={'Багана сонгох'}
                        />
                        <Pager
                            showPageSizeSelector={false}
                            // showInfo={true}
                            showNavigationButtons={true}
                        />
                        <ColumnFixing enabled={false} />

                        <Column
                            cssClass="custom"
                            dataField="ognoo"
                            width={130}
                            dataType={"date"}
                            format={"yyyy-MM-dd"}
                            sortOrder={"desc"}
                            caption="Date"
                            allowEditing={visibleOgnoo}
                            allowFiltering={true} fixed={true}
                            setCellValue={calcOgnoo}
                        >
                            <RequiredRule
                                message='Огноо оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="doj"
                            dataType={"date"} format={"yyyy-MM-dd HH:mm"}
                            caption="Date of registered"
                            allowEditing={false}
                            allowFiltering={false} alignment="center"
                        >
                        </Column>
                        <Column dataField="action_status" alignment="center" caption={'Төлөв'} width={150} cellRender={cellRenderStatus}
                                allowEditing={false}
                        >
                            <Lookup dataSource={actionStatus} valueExpr="id" displayExpr="name" />
                        </Column>
                        <Column
                            width={80}
                            cssClass="custom"
                            dataField="shift"
                            dataType={"string"}
                            caption="Shift"
                            allowEditing={true}
                            allowFiltering={false} alignment="center"
                        >
                            <RequiredRule
                                //message='Огноо оруулна уу'
                            />
                            <Lookup dataSource={shiftData} valueExpr="value" displayExpr="value" />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="shift_master"
                            dataType={"string"}
                            caption="Shift Master"
                            width={150}
                            allowEditing={true}
                            allowFiltering={false} alignment="center"
                        >
                            <RequiredRule
                                //message='Огноо оруулна уу'
                            />
                        </Column>
                        <Column width={200} caption={'Beginning Balance'} alignment={'center'} allowResizing={true}>
                        <Column
                            cssClass="custom"
                            width={120}
                            dataField="begin_balance_number"
                            dataType={"number"}
                            caption="Number of Sheets"
                            allowEditing={true}
                            allowFiltering={false} format="#,##0" alignment="right"
                            editorOptions={textAreaOptions}
                            setCellValue={calcBeginBalanceNumber}
                        >
                            <RequiredRule/>
                        </Column>
                        <Column
                            width={100}
                            cssClass="custom"
                            dataField="begin_balance_weight"
                            dataType={"number"}
                            caption="Weight, Kg"
                            allowEditing={true}
                            allowFiltering={false} format="#,##0" alignment="right"
                            editorOptions={textAreaOptions}
                            setCellValue={calcBeginBalanceWeight}
                        >
                            <RequiredRule/>
                        </Column>
                        </Column>
                        <Column caption={'Production'} alignment={'center'} allowResizing={true}>
                        <Column
                            cssClass="custom"
                            width={120}
                            dataField="production_number"
                            dataType={"number"}
                            caption="Number of Sheets"
                            allowEditing={true}
                            allowFiltering={false} format="#,##0" alignment="right"
                            editorOptions={textAreaOptions}
                            setCellValue={calcProductionNumber}
                        >
                            <RequiredRule/>
                        </Column>
                        <Column
                            cssClass="custom"
                            width={100}
                            dataField="production_weight"
                            dataType={"number"}
                            caption="Weight, Kg"
                            allowEditing={true}
                            allowFiltering={false} format="#,##0" alignment="right"
                            editorOptions={textAreaOptions}
                            setCellValue={calcProductionWeight}
                        >
                            <RequiredRule/>
                        </Column>
                    </Column>
                        <Column caption={'Accumulated Production'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="accumulated_production_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="accumulated_production_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Beginning Balance, Bundled Products'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="begin_balance_bundled_products_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="begin_balance_bundled_products_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Bundled'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="bundled_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcBundledNumber}
                            >
                                <RequiredRule/>
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="bundled_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcBundledWeight}
                            >
                                <RequiredRule/>
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="bundled_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcBundledLotNo}
                            >
                                <RequiredRule/>
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="bundled_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcBundledBundleNo}
                            >
                                <RequiredRule/>
                            </Column>
                        </Column>
                        <Column caption={'Ending Balance, Bundled Products'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="ending_balance_bundled_products_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule/>
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="ending_balance_bundled_products_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Transferred to Rebundle'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="transfered_to_rebundle_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="transfered_to_rebundle_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="transfered_to_rebundle_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="transfered_to_rebundle_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Rebundled'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="rebundled_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="rebundled_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="rebundled_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="rebundled_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Ending Balance after Rebundle'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="ending_balance_after_rebundle_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="ending_balance_after_rebundle_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Shipped'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="shipped_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcShippedNumber}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="shipped_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                                setCellValue={calcShippedWeight}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="shipped_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="shipped_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Used/Barter Sales'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="used_barter_sales_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="used_barter_sales_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="used_barter_sales_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="used_barter_sales_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={true}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column caption={'Ending Balance'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                width={120}
                                dataField="ending_balance_number"
                                dataType={"number"}
                                caption="Number of Sheets"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="ending_balance_weight"
                                dataType={"number"}
                                caption="Weight, Kg"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="ending_balance_lot_no"
                                dataType={"number"}
                                caption="LOT №"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                width={100}
                                dataField="ending_balance_bundle_no"
                                dataType={"number"}
                                caption="Bundle №"
                                allowEditing={false}
                                allowFiltering={false} format="#,##0" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                        </Column>
                        <Column type="buttons" fixedPosition={'right'} alignment="center" caption={'Үйлдэл'} ref={targetRef}>
                            <DevButton name="edit"/>
                            <DevButton hint="Илгээх" icon="taskcomplete" visible={setVisibleSendAction}
                                       onClick={(e) => onClickAction(e, 'approve')} iconStyle={{color: 'yellow'}}/>
                            <DevButton hint="Батлах" icon="check" visible={setVisibleConfirmAction}
                                    onClick={(e) => onClickAction(e, 'approve')} iconStyle={{color: 'yellow'}}/>
                            <DevButton hint="Татгалзах" icon="taskrejected" visible={setVisibleDenyAction}
                                       onClick={(e) => onClickAction(e, 'deny')} iconStyle={{color: 'yellow'}}/>
                            <DevButton hint="Устгах" icon="trash" visible={setVisibleDeleteAction}
                                       onClick={(e) => onClickAction(e, 'delete')} iconStyle={{color: 'yellow'}}/>
                        {/*<DevButton name="delete"/>*/}
                        </Column>
                        {/*<MasterDetail
                            enabled={true}
                            component={CopperProductTransferLog}
                        />*/}
                        <Summary>
                            <TotalItem
                                column="begin_balance_number"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="begin_balance_number"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                        </Summary>
                        <Editing
                            mode="row"
                            allowUpdating={true}
                            allowDeleting={true}
                            // allowAdding={true}
                            useIcons={true}
                            texts={{
                                cancelAllChanges: 'Болих бүгд',
                                cancelRowChanges: 'Болих',
                                confirmDeleteMessage: 'Энэ өдрийн төлөвлөгөөний мэдээллийг устгах уу?',
                                confirmDeleteTitle: 'Баталгаажуулалт',
                                deleteRow: 'Устгах',
                                editRow: 'Өөрчлөх',
                                saveAllChanges: 'Хадгалах бүгд',
                                saveRowChanges: 'Хадгалах',
                                undeleteRow: 'Буцаах',
                                validationCancelChanges: 'Баталгаажуулалт болих',
                                addRow: 'Төлөвлөгөө нэмэх'
                            }}
                        >
                        </Editing>
                        <Paging enabled={true} defaultPageSize={pageSize}/>
                    </DataGrid>
                </div>
                <Popup
                    visible={visible}
                    onHiding={()=>setVisible(false)}
                    showCloseButton
                    height={'80vh'}
                    width={'80vw'}
                >
                    <CopperProductTransferLog data={rowData}/>
                </Popup>
            </div>
        </React.Fragment>
    )
}

export default CopperProduct;
