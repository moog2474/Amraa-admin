import React, {useContext, useEffect, useState, useRef, useCallback} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule, ColumnFixing, CustomRule, Button as DevButton, Export, ColumnChooser,Summary,TotalItem
} from 'devextreme-react/data-grid';
import {LoadPanel} from "devextreme-react/load-panel";
import {UserContext} from "../../hooks/UserContext";
import TechnologyService from "../../services/api/technology";
import notify from "devextreme/ui/notify";
import {
    onCellPreparedHandler,
    sortingText,
    operationDescriptions,
    resetOperationText,
    exportAllText, formatDate,numberWithCommas
} from "../../util/index"
import {Workbook} from 'exceljs';
import {saveAs} from "file-saver-es";
import {exportDataGrid} from 'devextreme/excel_exporter';
import DateRangeBox from 'devextreme-react/date-range-box';
import moment from "moment";
import Button from "devextreme-react/button";
import ExampleImportData from "../../assets/TechnologyPlanExample.xlsx";
import FileUploader from "devextreme-react/file-uploader";
import { custom } from "devextreme/ui/dialog";
import {Popup} from "devextreme-react/popup";
import _ from "lodash";
const Excel = require('exceljs');

function TechnologyPlan(props) {
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

    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
    const [selectedDays, setSelectedDays] = useState(convertRangeToDays(initialValue));
    const [pageSize, setPageSize] = useState(31);
    const [isDisabled, setIsDisabled] = useState(false);
    const [excelData, setExcelData] = useState([]);

    useEffect(() => {
        getList();
    }, [])

    const getList = async () => {
        try {
            setLoader(true);
            const result = await TechnologyService.getTechnologyPlan(startDate, endDate);
            setDataSource(result)
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
                    await TechnologyService.editTechnologyPlan(e.changes[0].data);
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
                    await TechnologyService.addTechnologyPlan(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    let r = await TechnologyService.removeTechnologyPlan(e.changes[0].key);
                    await getList();
                    return notify(r.message, r.code === 200 ? "success" : "error", 2000);
                } catch (e) {
                    notify('Энэ талбар хуучин мэдээлэл дээр ашиглаж байгаа тул устгах боломжгүй байна!', "error", 2000);
                }

            }

        }

    }

    const textAreaOptions = {format: '#,##0.00'};

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

    /*const cloneIconClick = async (e) => {
        const list = [...dataSource];
        const clonedItem = {...e.row.data};
        list.splice(e.row.rowIndex, 0, clonedItem);
        setDataSource(list);
        e.event.preventDefault();
    }*/
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
                saveAs(new Blob([buffer], {type: 'application/octet-stream'}), 'TechnologyPlan' + formatDate(new Date()) + '.xlsx');
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
    const handleToolbarPreparing = async (e) => {
        let addButton = e.toolbarOptions.items[0]
        //let exportButton = e.toolbarOptions.items[1]
        let importButton = e.toolbarOptions.items[1]
        let dataGrid = e.component;
        addButton = {
            ...addButton, showText: "always", options: {
                text: "Төлөвлөгөө нэмэх", type: "default", icon: 'add', onClick: function () {
                    dataGrid.addRow();
                }
            }
        }
        importButton = {
            ...importButton, options: {
                text: "Төлөвлөгөө импорт хийх",
                type: "normal",
                hint: 'Төлөвлөгөө импорт хийх',
                icon: 'import',
                onClick: function () {
                    onChangeModalImport();
                }
            }
        }
        e.toolbarOptions.items[0] = addButton;
        e.toolbarOptions.items.push(importButton)


    }
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
    const exportExcel = () => {
        window.open(
            ExampleImportData,
            "_blank"
        )
    };
    const uploadProgress = async (e) => {
        console.log('uploadProgress');
        try {
            const workbook = new Excel.Workbook();
            const myEx = await workbook.xlsx.load(e.value[0]);
            const hello = myEx.getWorksheet(1);
            const excelDataList = [];
            await hello.eachRow((row, rowNumber) => {
                if (row.getCell(1).value && row.getCell(1).value * 1) {
                    if (row.getCell(1).value) {
                        try {
                            const data = {
                                ognoo: moment(row.getCell(1).value).format('YYYY-MM-DD'),
                                uusgalt_huder_hemjee_tons: row.getCell(2).value,
                                uusgalt_huder_hemjee_m3: row.getCell(3).value,
                                uusgalt_block_hemjee_m2: parseFloat((row.getCell(4).value === null ? 0 : (row.getCell(4).value.result ? row.getCell(4).value.result : (row.getCell(4).value.result === undefined ? row.getCell(4).value : 0))).toString().replace(/,/g, '')),
                                us_m3: parseFloat((row.getCell(5).value === null ? 0 : (row.getCell(5).value.result ? row.getCell(5).value.result : (row.getCell(5).value.result === undefined ? row.getCell(5).value : 0))).toString().replace(/,/g, '')),
                                uusgalt_ursgal_m3_tsag: parseFloat((row.getCell(6).value === null ? 0 : (row.getCell(6).value.result ? row.getCell(6).value.result : (row.getCell(6).value.result === undefined ? row.getCell(6).value : 0))).toString().replace(/,/g, '')),
                                huher_huchil_hemjee_tons: parseFloat((row.getCell(7).value === null ? 0 : (row.getCell(7).value.result ? row.getCell(7).value.result : (row.getCell(7).value.result === undefined ? row.getCell(7).value : 0))).toString().replace(/,/g, '')),
                                guartek_hemjee_kg_vikosol: parseFloat((row.getCell(8).value === null ? 0 : (row.getCell(8).value.result ? row.getCell(8).value.result : (row.getCell(8).value.result === undefined ? row.getCell(8).value : 0))).toString().replace(/,/g, '')),
                                cobalt_sulfat_kg: parseFloat((row.getCell(9).value === null ? 0 : (row.getCell(9).value.result ? row.getCell(9).value.result : (row.getCell(9).value.result === undefined ? row.getCell(9).value : 0))).toString().replace(/,/g, '')),
                                kerosin_tons: parseFloat((row.getCell(10).value === null ? 0 : (row.getCell(10).value.result ? row.getCell(10).value.result : (row.getCell(10).value.result === undefined ? row.getCell(10).value : 0))).toString().replace(/,/g, '')),
                                lix984n_tons: parseFloat((row.getCell(11).value === null ? 0 : (row.getCell(11).value.result ? row.getCell(11).value.result : (row.getCell(11).value.result === undefined ? row.getCell(11).value : 0))).toString().replace(/,/g, '')),
                                guidel_a: parseFloat((row.getCell(12).value === null ? 0 : (row.getCell(12).value.result ? row.getCell(12).value.result : (row.getCell(12).value.result === undefined ? row.getCell(12).value : 0))).toString().replace(/,/g, '')),
                                daily_zes_hemjee_kg: parseFloat((row.getCell(13).value === null ? 0 : (row.getCell(13).value.result ? row.getCell(13).value.result : (row.getCell(13).value.result === undefined ? row.getCell(13).value : 0))).toString().replace(/,/g, '')),
                                created_user_id: user.id,
                                updated_user_id: user.id,
                                status: 1,
                            }
                            excelDataList.push(data);
                        } catch (e) {
                            console.log(e);
                        }

                    }
                }
            });
            setExcelData(excelDataList);
            setIsDisabled(true)
        } catch (e) {
            console.log('error exception -> ', e);
        }
    }
    const onClick = async () => {
        setIsDisabled(true);
        let myDialog = custom({
            title: "Баталгаажуулалт",
            messageHtml: `<i style="font-weight: bold">Та оруулсан файлаа оруулахдаа итгэлтэй байна уу?</i>
<br><span style="color:red;">Оруулсан файлын огноо дунд системд бүртгэлтэй байвал файлд өгөдсөн дүнгүүдээр дарж орохыг анхаарна уу!</span></br>`,
            buttons: [{
                text: "Тийм",
                onClick: (e) => {
                    return { buttonText: e.component.option("text") }
                }
            },
                {
                    text: "Үгүй",
                    onClick: (e) => {
                        return { buttonText: e.component.option("text") }
                    }
                },
            ]
        });
        myDialog.show().then(async (dialogResult) => {
            if (dialogResult && dialogResult.buttonText === 'Тийм') {
                try {
                    console.log('dialogResult');
                    setLoader(true);
                    let check = 0;
                    let sendData = _.chunk(excelData, 100);
                    if (excelData.length === 0) {
                        setLoader(false);
                        setIsDisabled(false);
                        return notify('Excel файл аа оруулаагүй байна.', 'error', 2000);
                    }
                        let r = await TechnologyService.setExcelTechnologyPlan(sendData);
                        if (r.code !== 200) {
                            check++;
                            setLoader(false);
                        }
                    notify('Технологийн өдрийн төлөвлөгөөний файл амжилттай импорт хийгдлээ', 'success');
                    setExcelData([]);
                    setIsDisabled(false);
                    setLoader(false);
                    setModalImport(false);
                    getSearch();
                } catch (e) {
                    setLoader(false);
                    setIsDisabled(false);
                    setModalImport(false);
                    return notify(`${e.response.data.message} `, 'error', 2000);
                }
            }
        });
    }
    const renderModalImport = props => {
        return (
            <Popup
                visible={modalImport}
                onHiding={() => {
                    setModalImport(false);
                    setExcelData([]);
                    setIsDisabled(false);
                }}
                hideOnOutsideClick={true}
                showCloseButton={true}
                height="auto"
                width="40%"
                showTitle={true}
                title={"Технологийн өдрийн төлөвлөгөө импорт оруулах"}
            >
                <div style={{paddingTop: ".25rem", paddingBottom: "1rem"}}>
                        <div style={{background: "#F5F6FA", height: ".25rem", width: "100%"}}/>
                            <div style={{display: 'flex', justifyContent: "center", flexDirection: 'column'}}>
                                <Button icon="download"
                                        text="Excel загвар татах " type={'default'}
                                        onClick={exportExcel}/>
                                <br/>
                                <FileUploader multiple={false}
                                              uploadMode="useForm"
                                              icon="upload"
                                              accept='.xlsx'
                                              selectButtonText="Файл оруулах"
                                              labelText=""
                                              type="default"
                                              onValueChanged={uploadProgress}
                                              showFileList={true}
                                              maxFileSize={15000000}
                                />
                                <br/>
                                {excelData.length >= 0 &&
                                    <Button
                                        disabled={!isDisabled}
                                       icon={'import'}
                                        text="Технологийн өдрийн төлөвлөгөө импорт оруулах"
                                        style={{
                                            borderRadius: '10px',
                                            flex: 1,
                                            color: '#fff', textAlign: "center",
                                            backgroundColor: `#4468E2`,
                                        }}
                                        onClick={onClick}
                                        activeStateEnabled={false}
                                    />
                                }
                            </div>
                        </div>
            </Popup>
        )
    }
    return (
        <React.Fragment>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                message="Түр хүлээнэ үү..."
                showPane={false}
            />
            <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                    ТЕХНОЛОГИЙН ӨДРИЙН ТӨЛӨВЛӨГӨӨ УДИРДАХ ХЭСЭГ
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

                <div className="card" style={{padding: 5}}>
                    <div className="col-12 row" style={{
                        justifyContent: "flex-start",
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
                    <DataGrid
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onSaved={setEffect}
                        keyExpr={"id"}
                        onInitNewRow={onInitNewRow}
                        onEditingStart={onEditingStart}
                        allowColumnResizing={true}
                        onToolbarPreparing={handleToolbarPreparing}
                        wordWrapEnabled={true}
                        columnAutoWidth={true}
                        onCellPrepared={(e) => {
                            return onCellPreparedHandler(e);
                        }}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true}
                        sorting={sortingText}
                        onExporting={onExporting}
                        focusedRowEnabled={true}
                        paging={{enabled: true, pageSize: pageSize}}
                        noDataText="Дата байхгүй байна."
                    >
                        <Export enabled={true} allowExportSelectedData={false} texts={{exportAll: exportAllText}}/>
                        {/*<FilterRow
                            visible={true} operationDescriptions={operationDescriptions} resetOperationText={resetOperationText}
                        />*/}
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
                        <ColumnFixing enabled={false}/>

                        <Column
                            cssClass="custom"
                            dataField="ognoo"
                            width={'130'}
                            dataType={"date"}
                            format={"yyyy-MM-dd"}
                            sortOrder={"desc"}
                            caption="Огноо"
                            allowEditing={visibleOgnoo}
                            allowFiltering={true} fixed={true}
                        >
                            <RequiredRule
                                message='Огноо оруулна уу'
                            />
                            <CustomRule
                                type="custom"
                                message={"Огноо давхардаж байна"}
                                validationCallback={customValidation}
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="uusgalt_huder_hemjee_tons"
                            dataType={"number"}
                            caption="Уусгалтанд орж буй хүдрийн хэмжээ/тн/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Уусгалтанд орж буй хүдрийн хэмжээ/тн/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="uusgalt_huder_hemjee_m3"
                            dataType={"number"}
                            caption="Уусгалтанд орж буй хүдрийн хэмжээ/м3/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Уусгалтанд орж буй хүдрийн хэмжээ /м3/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="uusgalt_block_hemjee_m2"
                            dataType={"number"}
                            caption="Уусгалтанд орж буй блокийн хэмжээ /м2/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Уусгалтанд орж буй блокийн хэмжээ /м2/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="us_m3"
                            dataType={"number"}
                            caption="Ус /м3/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Ус /м3/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="uusgalt_ursgal_m3_tsag"
                            dataType={"number"}
                            caption="Уусгалтын урсгал /м3/ц/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Уусгалтын урсгал /м3/ц/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="huher_huchil_hemjee_tons"
                            dataType={"number"}
                            caption="Хүхрийн хүчлийн хэмжээ /тн/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Хүхрийн хүчлийн хэмжээ /тн/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="guartek_hemjee_kg_vikosol"
                            dataType={"number"}
                            caption="Гуартекийн хэмжээ /кг/ /Викосол/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Гуартекийн хэмжээ /кг/ /Викосол/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="cobalt_sulfat_kg"
                            dataType={"number"}
                            caption="Кобальт сульфат /кг/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Кобальт сульфат /кг/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="kerosin_tons"
                            dataType={"number"}
                            caption="Керосин /тн/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Керосин /тн/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="lix984n_tons"
                            dataType={"number"}
                            caption="LIX984N /тн/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='LIX984N /тн/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="guidel_a"
                            dataType={"number"}
                            caption="Гүйдэл /А/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Гүйдэл /А/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="daily_zes_hemjee_kg"
                            dataType={"number"}
                            caption="Өдөрт хураах  зэсийн хэмжээ /кг/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right"
                            editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Өдөрт хураах  зэсийн хэмжээ /кг/ оруулна уу'
                            />
                        </Column>
                        <Column type="buttons" width={110}>
                            <DevButton name="edit"/>
                            <DevButton name="delete" visible={setVisibleDelete}/>
                        </Column>
                        <Summary>
                            <TotalItem
                                column="uusgalt_huder_hemjee_tons"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_huder_hemjee_tons"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_huder_hemjee_m3"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_huder_hemjee_m3"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_block_hemjee_m2"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_block_hemjee_m2"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="us_m3"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="us_m3"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_ursgal_m3_tsag"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="uusgalt_ursgal_m3_tsag"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="huher_huchil_hemjee_tons"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="huher_huchil_hemjee_tons"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="guartek_hemjee_kg_vikosol"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="guartek_hemjee_kg_vikosol"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="cobalt_sulfat_kg"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="cobalt_sulfat_kg"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="kerosin_tons"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="kerosin_tons"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="lix984n_tons"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="lix984n_tons"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="guidel_a"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="guidel_a"
                                summaryType="avg"
                                customizeText={(data) => {
                                    return `Дундаж: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="daily_zes_hemjee_kg"
                                summaryType="sum"
                                customizeText={(data) => {
                                    return `Нийт: ${numberWithCommas(data.value)}`
                                }}
                            />
                            <TotalItem
                                column="daily_zes_hemjee_kg"
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
                            allowAdding={true}
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
            </div>
            {renderModalImport()}
        </React.Fragment>
    )
}

export default TechnologyPlan;
