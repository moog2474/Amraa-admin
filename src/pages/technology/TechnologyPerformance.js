import React, {useContext, useEffect, useState, useRef,useCallback} from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Editing,
    Pager,
    Paging,
    Column,
    FilterRow,
    RequiredRule, ColumnFixing, Export, ColumnChooser
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
    exportAllText,formatDate
} from "../../util/index"
import {Workbook} from 'exceljs';
import { saveAs } from "file-saver-es";
import {exportDataGrid} from 'devextreme/excel_exporter';
import barChart from "./barChart";
import moment from "moment";
import DateRangeBox from "devextreme-react/date-range-box";
import Button from "devextreme-react/button";
import TechnologyPerformanceBarChart from "./TechnologyPerformanceBarChart";

function TechnologyPerformance(props) {
    const {user} = useContext(UserContext);
    const [dataSource, setDataSource] = useState([]);
    const [loader, setLoader] = useState(false);
    const [visibleOgnoo, setVisibleOgnoo] = useState(true);
    const myBabyRef = useRef(null)
    const [listData, setListData] = useState([]);
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
    useEffect(() => {
        getList();
    }, [])

    const getList = async () => {
        try {
            setLoader(true);
            const result = await TechnologyService.getTechnologyPerformanceByPlan(startDate,endDate);
            setDataSource(result.data);
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }
    const setEffect = async (e) => {
        if (e.changes && e.changes.length !== 0) {
            setLoader(true);
            if (e.changes[0].type === "update") {
                try {
                    let data = {};
                    data.id = e.changes[0].data.id;
                    data.technology_plan_id = e.changes[0].data.tech_plan_id;
                    data.uusgalt_huder_hemjee_tons_guistetgel = e.changes[0].data.uusgalt_huder_hemjee_tons_guistetgel;
                    data.uusgalt_huder_hemjee_m3_guistetgel = e.changes[0].data.uusgalt_huder_hemjee_m3_guistetgel;
                    data.uusgalt_block_hemjee_m2_guistetgel = e.changes[0].data.uusgalt_block_hemjee_m2_guistetgel;
                    data.us_m3_guistetgel = e.changes[0].data.us_m3_guistetgel;
                    data.pls_tsoorom_tuvshin_m3 = e.changes[0].data.pls_tsoorom_tuvshin_m3;
                    data.raff_tsoorom_tuvshin_m3 = e.changes[0].data.raff_tsoorom_tuvshin_m3;
                    data.uusgalt_ursgal_m3_tsag_guistetgel = e.changes[0].data.uusgalt_ursgal_m3_tsag_guistetgel;
                    data.huher_huchil_hemjee_tons_guistetgel = e.changes[0].data.huher_huchil_hemjee_tons_guistetgel;
                    data.guartek_hemjee_kg_vikosol_guistetgel = e.changes[0].data.guartek_hemjee_kg_vikosol_guistetgel;
                    data.cobalt_sulfat_kg_guistetgel = e.changes[0].data.cobalt_sulfat_kg_guistetgel;
                    data.kerosin_tons_guistetgel = e.changes[0].data.kerosin_tons_guistetgel;
                    data.lix984n_tons_guistetgel = e.changes[0].data.lix984n_tons_guistetgel;
                    data.guidel_a_guistetgel = e.changes[0].data.guidel_a_guistetgel;
                    data.daily_zes_hemjee_kg_guistetgel = e.changes[0].data.daily_zes_hemjee_kg_guistetgel;
                    e.changes[0].data.id === null ?  data.created_user_id = user.id : data.updated_user_id = user.id;
                    data.status = 1;
                    await TechnologyService.editTechnologyPerformance(data);
                    //await getList();
                    setLoader(false);
                  return  notify('Амжилттай хадгалагдлаа', "success", 2000);
                } catch (e) {
                    setLoader(false);
                    notify('Засварлалтыг хадгалах явцад алдаа гарлаа', "error", 2000);
                }
            } else if (e.changes[0].type === "insert") {
                try {
                    delete e.changes[0].data.id;
                    e.changes[0].data.created_user_id = user.id;
                    e.changes[0].data.status = 1;
                    await TechnologyService.addTechnologyPerformance(e.changes[0].data);
                    //await getList();
                    notify('Амжилттай үүслээ', "success", 2000);
                } catch (e) {
                    notify('Шинээр үүсэх явцад алдаа гарлаа', "error", 2000);
                }

            } else if (e.changes[0].type === "remove") {
                try {
                    await TechnologyService.removeTechnologyPerformance(e.changes[0].key);
                    //await getList();
                    notify('Амжилттай устгагдлаа', "success", 2000);
                } catch (e) {
                    notify('Энэ талбар хуучин мэдээлэл дээр ашиглаж байгаа тул устгах боломжгүй байна!', "error", 2000);
                }

            }

        }

    }

    const textAreaOptions = { format: '#,##0.00' };

    const customValidation = (params) => {
        if(params.data.id ===undefined ) {
            let s = params.data.ognoo;
            let source = myBabyRef.current.instance.getDataSource()._items;
            let res = source.filter(item=>item.ognoo === s );
            params.rule.message = `Огноо давхардаж байна`
            return res.length ===0
        }
      else {
          //setVisibleOgnoo(false)
          return 0===0
        }
    }
    const onEditingStart =(e)=>{
        //console.log('onEditingStart', e);
        setVisibleOgnoo(false)
    }
    const onInitNewRow = (e) => {
        setVisibleOgnoo(true);
    }

    const onExporting = (e) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Main sheet');

        exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
            customizeCell: ({ gridCell, excelCell }) => {

            },
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], {type: 'application/octet-stream'}), 'TechnologyPlan' + formatDate(new Date())  + '.xlsx');
            });
        });
        e.cancel = true;
    }

    function itemRender(data) {
        if (data != null) {
            return <div>
                <span className="middle">{data.ognoo}</span>
            </div>;
        } else {
            return <span>(All)</span>;
        }
    }
    // Select Box functions
    function onValueChanged(cell, e) {
        console.log('e', e);
        cell.setValue(e.value.id);
        //setSelectedOgnoo(e.value);
    }
    const getSearch = async () => {
        try {
            setLoader(true);
            getList()
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }
    const onCurrentValueChange = useCallback(
        ({ value: [startDate1, endDate1] }) => {
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
    return (
        <div>
            <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <span>
                    ТЕХНОЛОГИЙН ӨДРИЙН ГҮЙЦЭТГЭЛ УДИРДАХ ХЭСЭГ
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
                <div className="card" style={{padding:5}}>
                    <div  className="col-12 row" style={{justifyContent: "flex-start",alignItems:'center',display:'flex',flexDirection:'row'}}>
                        <div>
                            {/* <span>Огноогоор шүүх</span>*/}
                            <div className="selected-days-wrapper ">
                                <span>Сонгогдсон өдрийн тоо: </span>
                                <span>{selectedDays}</span>
                            </div>
                        </div>
                        <div style={{marginLeft:10}}>
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
                        <div style={{marginLeft: 10,marginTop:8}}>
                            <Button id="searchButton" icon="search"  text="Хайх" onClick={() => getSearch()}  type="default"/>
                        </div>
                    </div>
                    <div className="card-body" style={{ paddingBottom: "1.6rem" }}>
                        {dataSource && dataSource.length>0 && <TechnologyPerformanceBarChart chartData={ dataSource}/>}
                    </div>

                    {dataSource && dataSource.length > 0 ? <DataGrid
                        ref={myBabyRef}
                        dataSource={dataSource}
                        onSaved={setEffect}
                        keyExpr={"tech_plan_id"}
                        //onInitNewRow={onInitNewRow}
                        //onEditingStart={onEditingStart}
                        allowColumnResizing={true}
                        wordWrapEnabled={true}
                        columnAutoWidth={true}
                        onCellPrepared={(e) => {
                            return onCellPreparedHandler(e);
                        }}
                        focusedRowEnabled={true}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        showColumnHeaders={true}
                        sorting={sortingText}
                        onExporting={onExporting}
                        paging={{enabled: true, pageSize: pageSize}}
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
                            dataType={"date"}
                            caption="Огноо"
                            width={'80'}
                            sortOrder={'desc'}
                            format={"yyyy-MM-dd"}
                            allowEditing={false}
                            allowFiltering={true} fixed={true}
                        >
                        </Column>
                        <Column caption={'Уусгалтанд орж буй хүдрийн хэмжээ/тн/'} alignment={'center'}
                                allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_huder_hemjee_tons"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Уусгалтанд орж буй хүдрийн хэмжээ/тн/ оруулна уу'
                                />
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_huder_hemjee_tons_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Уусгалтанд орж буй хүдрийн хэмжээ/тн/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_uusgalt_huder_hemjee"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.uusgalt_huder_hemjee_tons,e.data.uusgalt_huder_hemjee_tons_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Уусгалтанд орж буй хүдрийн хэмжээ/м3/'} alignment={'center'}
                                allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_huder_hemjee_m3"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_huder_hemjee_m3_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Уусгалтанд орж буй хүдрийн хэмжээ/м3/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_uusgalt_huder_hemjee_m3"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.uusgalt_huder_hemjee_m3,e.data.uusgalt_huder_hemjee_m3_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Уусгалтанд орж буй блокийн хэмжээ/м2/'} alignment={'center'}
                                allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_block_hemjee_m2"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_block_hemjee_m2_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Уусгалтанд орж буй блокийн хэмжээ/м2/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_uusgalt_block_hemjee_m2"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.uusgalt_block_hemjee_m2,e.data.uusgalt_block_hemjee_m2_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Ус /м3/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="us_m3"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="us_m3_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Ус /м3/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_us_m3"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.us_m3,e.data.us_m3_guistetgel)}
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="pls_tsoorom_tuvshin_m3"
                            dataType={"number"}
                            caption="PLS-цөөрмийн түвшин/м3/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right" editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='PLS-цөөрмийн түвшин/м3/ оруулна уу'
                            />
                        </Column>
                        <Column
                            cssClass="custom"
                            dataField="raff_tsoorom_tuvshin_m3"
                            dataType={"number"}
                            caption="Raff-цөөрмийн түвшин/м3/"
                            allowEditing={true}
                            allowFiltering={true} format="#,##0.00" alignment="right" editorOptions={textAreaOptions}
                        >
                            <RequiredRule
                                message='Raff-цөөрмийн түвшин/м3/ оруулна уу'
                            />
                        </Column>
                        <Column caption={'Уусгалтын урсгал /м3/ц/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_ursgal_m3_tsag"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="uusgalt_ursgal_m3_tsag_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Уусгалтын урсгал /м3/ц/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_uusgalt_ursgal_m3_tsag"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.uusgalt_ursgal_m3_tsag,e.data.uusgalt_ursgal_m3_tsag_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Хүхрийн хүчлийн хэмжээ /тн/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="huher_huchil_hemjee_tons"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="huher_huchil_hemjee_tons_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Хүхрийн хүчлийн хэмжээ /тн/ Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_huher_huchil_hemjee_tons"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.huher_huchil_hemjee_tons,e.data.huher_huchil_hemjee_tons_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Гуартекийн хэмжээ /кг/ /Викосол/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="guartek_hemjee_kg_vikosol"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="guartek_hemjee_kg_vikosol_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Гуартекийн хэмжээ /кг/ /Викосол/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_guartek_hemjee_kg_vikosol"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.guartek_hemjee_kg_vikosol,e.data.guartek_hemjee_kg_vikosol_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Кобальт сульфат /кг/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="cobalt_sulfat_kg"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="cobalt_sulfat_kg_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Кобальт сульфат /кг/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_cobalt_sulfat_kg"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.cobalt_sulfat_kg,e.data.cobalt_sulfat_kg_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Керосин /тн/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="kerosin_tons"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="kerosin_tons_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Керосин /тн/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_kerosin_tons"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.kerosin_tons,e.data.kerosin_tons_guistetgel)}
                            />
                        </Column>
                        <Column caption={'LIX984N /тн/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="lix984n_tons"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="lix984n_tons_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='LIX984N /тн/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_lix984n_tons"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.lix984n_tons,e.data.lix984n_tons_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Гүйдэл  /А/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="guidel_a"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="guidel_a_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Гүйдэл /А/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_guidel_a"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.guidel_a,e.data.guidel_a_guistetgel)}
                            />
                        </Column>
                        <Column caption={'Өдөрт хураах  зэсийн хэмжээ /кг/'} alignment={'center'} allowResizing={true}>
                            <Column
                                cssClass="custom"
                                dataField="daily_zes_hemjee_kg"
                                dataType={"number"}
                                caption="Төлөвлөгөө"
                                allowEditing={false}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                            </Column>
                            <Column
                                cssClass="custom"
                                dataField="daily_zes_hemjee_kg_guistetgel"
                                dataType={"number"}
                                caption="Гүйцэтгэл"
                                allowEditing={true}
                                allowFiltering={true} format="#,##0.00" alignment="right"
                                editorOptions={textAreaOptions}
                            >
                                <RequiredRule
                                    message='Өдөрт хураах  зэсийн хэмжээ /кг/-Гүйцэтгэл оруулна уу'
                                />
                            </Column>
                            <Column
                                dataField="percent_daily_zes_hemjee_kg"
                                caption="Хувь"
                                dataType="number"
                                format="percent"
                                alignment="left"
                                allowEditing={false}
                                cellRender={(e) => barChart(e.data.daily_zes_hemjee_kg,e.data.daily_zes_hemjee_kg_guistetgel)}
                            />
                        </Column>
                        <Editing
                            mode="row"
                            allowUpdating={true}
                            allowDeleting={false}
                            allowAdding={false}
                            useIcons={true}
                            selectTextOnEditStart={true}
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
                    </DataGrid> : !loader && <div style={{display:'flex',justifyContent:'center',marginTop:100,marginBottom:100}}>Дата байхгүй байна та технологийн өдрийн төлөвлөгөөгөө оруулна уу</div>}
                </div>
            </div>
        </div>
    )
}

export default TechnologyPerformance;
