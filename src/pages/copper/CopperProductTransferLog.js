import React, { useContext, useEffect, useState } from 'react';
import 'devextreme-react/text-area';
import DataGrid, {
    Paging,
    Column,
    Lookup
} from 'devextreme-react/data-grid';
import { LoadPanel } from "devextreme-react/load-panel";
import { UserContext } from "../../hooks/UserContext";
import CopperService from "../../services/api/copper";
import {
    onCellPreparedHandler,
    sortingText,
} from "../../util/index"
import RefService from "../../services/api/ref";
import _ from 'lodash'
import { Button, SelectBox, TextArea, RadioGroup } from 'devextreme-react';
import { ConfigProvider, InputNumber } from 'antd';

const yeasNoData = [{
    key: true, name: 'Тийм'
}, {
    key: false, name: 'Үгүй'
}];

function CopperProductTransferLog(props) {
    const { user } = useContext(UserContext);
    const [loader, setLoader] = useState(false);
    const [bathArray, setBathArray] = useState([])
    const [bundleObj, setBundleObj] = useState({})
    const [hangerData, setHangerData] = useState([]);
    const [rejectedType, setRejectedType] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [sumObj, setSumObj] = useState({
        copper_count: 0,
        total_weight: 0,
        rejected_copper_count: 0,
        rejected_copper_weigth: 0,
        bundled_copper_count: 0,
        bundled_copper_weight: 0,
        balance_copper_count: 0,
        balance_copper_weight: 0
    })
    // const [copperProductTransferLog, setCopperProductTransferLog] = useState([]);
    // const [actionStatus, setActionStatus] = useState([]);
    // useEffect(() => {
    //     getCopperProductTransferLog();
    // }, [props.data.key])

    // const getCopperProductTransferLog = async () => {
    //     try {
    //         setLoader(true);
    //         const result = await CopperService.getCopperProductTransferLogs(props.data.key);
    //         setCopperProductTransferLog(result.data);
    //         const r = await RefService.getActionStatus();
    //         setActionStatus(r);
    //         return setLoader(false)
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }
    // const cellRenderStatus = (data) => {
    //     return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    //         <span className={`action-status-${data.value}`}>{data.displayValue}</span>
    //     </div>
    // };
    useEffect(() => {
        fetchData()
        rejectedTypes()
    }, [props.data.shift_id, props.data.shift_date])
    const rejectedTypes = async () => {
        try {
            let res = await RefService.getRejectedTypes()
            setRejectedType(res.data)
        } catch (e) {
            console.error(e);
        }
    }
    const fetchData = async () => {
        try {
            setLoader(true)
            const { data } = await CopperService.getCopperRegDetail(props.data.shift_date, props.data.shift_id)
            data && setBathArray(data[0].bathData);

            let { bathData, bundleData, ...filtered } = data[0];

            if (bundleData.length === 0) {
                bundleData = [{ bundle_no: data[0].current_bundle_no, bundled_copper_count: null, bundled_copper_weight: null }];
            }
            setBundleObj({ ...filtered, bundleData });

            if (data && data.length > 0) {
                //Нэг ванны детайл дата
                let res = data[0].bathData.filter(item => item.bath_number === data[0].bathData[0].bath_number);
                res.length > 0 && setHangerData(res[0]);
            }
            setSelectedIndex(0);
            setSumObj({
                copper_count: _.sumBy(data[0].bathData, 'copper_count'),
                total_weight: _.sumBy(data[0].bathData, 'total_weight'),
                rejected_copper_count: _.sumBy(data[0].bathData, 'rejected_copper_count'),
                rejected_copper_weigth: _.sumBy(data[0].bathData, 'rejected_copper_weigth'),
                bundled_copper_count: _.sumBy(data[0].bundleData, 'bundled_copper_count'),
                bundled_copper_weight: _.sumBy(data[0].bundleData, 'bundled_copper_weight'),
                balance_copper_count: data[0].start_balance_copper_count + _.sumBy(data[0].bathData, 'copper_count') - _.sumBy(data[0].bundleData, 'bundled_copper_count'),
                balance_copper_weight: data[0].start_balance_copper_weight + _.sumBy(data[0].bathData, 'total_weight') - _.sumBy(data[0].bundleData, 'bundled_copper_weight')
            })
            setLoader(false)
        } catch (err) {
            setLoader(false)
        }
    }

    const handleEachBath = (bath_number) => {
        try {
            setLoader(true);
            let res = bathArray.filter(item => item.bath_number === bath_number);
            res.length > 0 && setHangerData(res[0]);
            return setLoader(false)
        } catch (e) {
            console.error(e);
        }
    }
    return (
        <React.Fragment>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{ of: '#password' }}
                visible={loader}
                showPane={false}
                message="Түр хүлээнэ үү..."
            />
            <ConfigProvider
                theme={{
                    token: {
                        borderRadius: 15,
                    }
                }}
            >
                <div id="password">
                    <div className={'card'} style={{ padding: 10, border: 'none' }}>
                        <div className='m-2' style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <b>1.ЗЭС ХУРААЛТ</b>
                            <div>
                                <span className='text-card mr-2' style={{ border: '1px solid #dedede', color: '#b8b4b4' }}>LOT {props.data.lot_no}</span>
                                <span className='text-card' style={{ color: '#f29f67', background: '#fcf6f0' }}>ванн №{hangerData.bath_number}</span>
                            </div>
                        </div>
                        <div className=''>
                            <div className='row d-flex g-3 align-item-center m-3'>
                                <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                    <p style={{ textAlign: 'center' }}>Өмнөх үлдэгдэл, ш</p>
                                    <p><b style={{ fontSize: 24 }}>{bundleObj.start_balance_copper_count || '-'}</b></p>
                                    <p>{bundleObj.start_balance_copper_weight} кг</p>
                                </div>
                                {bathArray.length > 0 &&
                                    <div className='d-flex align-item-center' style={{ alignItems: 'center' }}>
                                        <div className='add-minus' style={{ backgroundColor: '#e2fbee', color: '#50c687' }}>+</div>
                                        <hr style={{ width: 20 }} />
                                        {bathArray.map((e, i) => {
                                            const colorClass = e.bath_status_id === 1 ? '#f29f67' : '#ced4df';
                                            return (
                                                <div className='bath-polygon' aria-disabled={e.bath_status_id !== 1} style={{ borderColor: colorClass, display: 'flex', justifyContent: 'center', flexDirection: 'column', backgroundColor: e.bath_status_id !== 1 ? '#f4f5f7' : selectedIndex === i ? '#fef5ef' : 'white' }} key={i} id={`bath_${e.bath_number}`}
                                                    onClick={(e1) => {
                                                        setSelectedIndex(i);
                                                        selectedIndex !== i && handleEachBath(e.bath_number);
                                                    }}>
                                                    <div className='bath-number' style={{ color: colorClass }}>{e.bath_number}</div>
                                                    <hr style={{ backgroundColor: colorClass, border: 0, height: 0.3, margin: '-4rem 0' }} />
                                                    <div className='bath-data' style={{ color: '#0c0c0c' }}>{e.katod_count || '-'}</div>
                                                    <hr style={{ backgroundColor: colorClass, border: 0, height: 0.3, margin: '0rem 0' }} />
                                                    <div className='bath-copper' style={{ color: '#0c0c0c' }}>{e.copper_count || '-'}</div>
                                                    <hr style={{ backgroundColor: colorClass, border: 0, height: 0.3, margin: '-4rem 0' }} />
                                                    <div className='bath-weight' style={{ color: '#0c0c0c' }}>{e.total_weight + 'кг'}</div>
                                                </div>
                                            )
                                        }
                                        )}
                                        <hr style={{ width: 20 }} />
                                        <div className='add-minus' style={{ backgroundColor: '#fff2f2', color: '#f66160' }}>-</div>
                                    </div>}
                                <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                    <p style={{ textAlign: 'center' }}>Миний хураалт, ш</p>
                                    <p><b style={{ fontSize: 24 }}>{sumObj.copper_count || '-'}</b></p>
                                    <p>{sumObj.total_weight} кг</p>
                                </div>
                                <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                    <p style={{ textAlign: 'center' }}>Гологдол нийт, ш</p>
                                    <p><b style={{ fontSize: 24 }}>{sumObj.rejected_copper_count || '-'}</b></p>
                                    <p>{sumObj.rejected_copper_count} кг</p>
                                </div>
                            </div>

                            <div className='row m-3' style={{ marginTop: 30 }}>
                                {hangerData &&
                                    <div className='row justify-space-between align-item-end'>
                                        <div className='d-flex g-3'>
                                            <div className='d-flex flex-col' style={{ margin: '50px 0', gap: 32 }}>
                                                <div style={{ fontWeight: '500' }}>Катодын тоо: <span style={{ color: 'red' }}>*</span></div>
                                                <div style={{ fontWeight: '500', }}>Хавтангын тоо: <span style={{ color: 'red' }}>*</span></div>
                                                <div style={{ fontWeight: '500', }}>Хавтангын жин:</div>
                                                <div style={{ fontWeight: '500', }}>Тайлбар:</div>
                                            </div>
                                            <div >
                                                <div className='d-flex g-3'>
                                                    {hangerData && hangerData.hangerData !== undefined && hangerData.hangerData.map((data, i) => {
                                                        return (
                                                            <div className='d-flex flex-col' style={{gap: 14}}>
                                                                <div className={'hanger-card'}>
                                                                    {'Өлгүүр ' + data.hanger_number}
                                                                </div>

                                                                <InputNumber
                                                                    controls={false}
                                                                    value={data.katod_count}
                                                                    defaultValue={data.katod_count}
                                                                    type='number'
                                                                    className={'number-card'}
                                                                    addonBefore={<span>{data.bath_hang_katod_count}</span>}
                                                                    readOnly
                                                                />


                                                                <InputNumber
                                                                    controls={false}
                                                                    value={data.copper_count}
                                                                    defaultValue={data.copper_count}
                                                                    type='number'
                                                                    className={'number-card'}
                                                                    addonBefore={<span>{data.bath_hang_katod_count * 2}</span>}
                                                                    readOnly
                                                                />

                                                                <InputNumber
                                                                    controls={false}
                                                                    value={data.copper_weigth}
                                                                    type='number'
                                                                    className={'number-card'}
                                                                    addonAfter='кг'
                                                                    readOnly
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <TextArea
                                                    autoResizeEnabled={true}
                                                    height={100}
                                                    maxHeight={200}
                                                    maxLength={500}
                                                    width={392}
                                                    value={hangerData.description}
                                                    stylingMode={'outlined'}
                                                    valueChangeEvent='keyup'
                                                    style={{ padding: 10, borderRadius: 20, marginTop: 14 }}
                                                    placeholder='Тайлбар оруулах'
                                                    readOnly
                                                />
                                            </div>
                                            <div className='d-flex flex-col' style={{ gap: 14.5 }}>
                                                <div className={'hanger-card'} style={{ color: '#f29f67', borderColor: '#f29f67' }}>
                                                    Ванн нийт
                                                </div>
                                                <InputNumber
                                                    controls={false}
                                                    value={hangerData.katod_count}
                                                    defaultValue={hangerData.katod_count}
                                                    type='number'
                                                    className={'number-card'}
                                                    min={0}
                                                    readOnly
                                                    addonBefore={_.sumBy(hangerData.hangerData, 'bath_hang_katod_count')}
                                                />
                                                <InputNumber
                                                    controls={false}
                                                    addonBefore={_.sumBy(hangerData.hangerData, 'bath_hang_katod_count') * 2}
                                                    value={hangerData.copper_count}
                                                    defaultValue={hangerData.copper_count}
                                                    type='number'
                                                    format="#"
                                                    className={'number-card'}
                                                    min={0}
                                                    readOnly
                                                />

                                                <InputNumber
                                                    controls={false}
                                                    value={hangerData.total_weight}
                                                    defaultValue={hangerData.total_weight}
                                                    readOnly
                                                    type='number'
                                                    addonAfter='кг'
                                                    className={'number-card'}
                                                />

                                            </div>
                                            <div className='d-flex flex-col' style={{ gap: 14 }}>
                                                <div className={'hanger-card'}>
                                                    Гологдол
                                                </div>
                                                <RadioGroup
                                                    items={yeasNoData}
                                                    value={hangerData.is_copper_rejected}
                                                    readOnly
                                                    valueExpr={'key'}
                                                    displayExpr={'name'}
                                                    layout="horizontal"
                                                    style={{ margin: '7px 0' }}
                                                />
                                                <InputNumber
                                                    controls={false}
                                                    value={hangerData.rejected_copper_count}
                                                    defaultValue={hangerData.rejected_copper_count}
                                                    type='number'
                                                    width={120}
                                                    min={0}
                                                    className={'number-card'}
                                                    readOnly
                                                />
                                                <InputNumber
                                                    width={120}
                                                    controls={false}
                                                    value={hangerData.rejected_copper_weigth}
                                                    defaultValue={hangerData.rejected_copper_weigth}
                                                    type='number'
                                                    className={'number-card'}
                                                    min={0}
                                                    readOnly
                                                />
                                                <SelectBox
                                                    items={rejectedType} width={120} wrapItemText={true} text='сонгох...'
                                                    value={hangerData.copper_rejected_type_id}
                                                    style={{ borderRadius: 20 }}
                                                    valueExpr='id' displayExpr='name'
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className={'card'} style={{ padding: 10, border: 'none', marginTop: 10 }}>
                        <div className='d-flex justify-space-between m-2'>
                            <b>2. БООЛТ</b>
                            {!bundleObj.start_balance_copper_count && !bundleObj.start_balance_copper_weight && bundleObj.ref_copper_reg_status === 1 &&
                                <p style={{ color: '#f66160' }}>Өмнөх ээлжийн зэсийн бүртгэлийг <strong>БАТЛААГҮЙ</strong> байгаа тул боолт хийх боломжгүй!</p>}
                        </div>
                        <div className='row' style={{ display: 'flex', gap: 20, paddingTop: 10 }}>
                            <div style={{ display: 'flex' }}>
                                <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                    <p style={{ textAlign: 'center' }}>Нийт үлдэгдэл, ш</p>
                                    <p><b style={{ fontSize: 24 }}>{sumObj.balance_copper_count}</b></p>
                                    <p>{sumObj.balance_copper_weight} кг</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: 'calc(100% - 130px)' }}>
                                <div className='col-12' style={{ display: 'flex', padding: 10, gap: 10 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '10rem', fontWeight: 500 }}>
                                        <div style={{height: 30}}>Боодлын дугаар:</div>
                                        <div style={{height: 30}}>Боосон хавтангийн тоо:</div>
                                        <div style={{height: 30}}>Боосон хавтангийн жин: </div>
                                    </div>
                                    <div className='bundle-container' style={{ display: 'flex', gap: 10, height: '10rem', overflowX: 'auto' }}>
                                        {bundleObj && bundleObj.bundleData !== undefined &&
                                            bundleObj.bundleData.map((e, i) => (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, fontWeight: 500, width: 100, flex: 1, flexGrow: 'initial' }}>
                                                    <InputNumber
                                                        controls={false}
                                                        value={`№${e.bundle_no}`}
                                                        readOnly />
                                                    <InputNumber
                                                        controls={false}
                                                        value={e.bundled_copper_count}
                                                        readOnly
                                                        defaultValue={e.bundled_copper_count}
                                                        type='number'
                                                        min={0}
                                                        inputMode='numeric'
                                                    />
                                                    <InputNumber
                                                        controls={false}
                                                        value={e.bundled_copper_weight}
                                                        readOnly
                                                        type='number'
                                                        min={0}
                                                        addonAfter='кг'
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px'}}>
                <h5 style={{ fontSize: '0.875rem', margin: 0, paddingBottom: '5px' }}>Шийдвэрлэлтийн түүх:</h5>
                <DataGrid dataSource={copperProductTransferLog} noDataText="Дата олдсонгүй."
                          showBorders={true}
                          id="approvalHistory"
                          keyExpr={"id"}
                          showRowLines={true}
                          showColumnLines={true}
                          showColumnHeaders={true}
                          allowColumnResizing={true}
                          columnAutoWidth={true} sorting={sortingText}
                          wordWrapEnabled={true} onCellPrepared={onCellPreparedHandler}>
                    <Column alignment="center" width={'4rem'} caption="№" cellRender={(data) => {
                        if (data.rowType === "data") {
                            return <span>{data.rowIndex + 1}</span>;
                        }
                        return null;
                    }} />
                    <Column dataField="createdAt" alignment="left" caption="Шийдвэрлэлтийн огноо"
                            dataType="date" format="yyyy-MM-dd hh:mm" sortOrder="desc" />
                    <Column dataField="action" alignment="center" caption={'Төлөв'} cellRender={cellRenderStatus}
                            allowEditing={false}
                    >
                        <Lookup dataSource={actionStatus} valueExpr="id" displayExpr="name" />
                    </Column>
                    <Column dataField="user_name" alignment="left" caption="Овог, нэр" />
                    <Column dataField="position_name" alignment="left" caption="Байгууллага, албан тушаал" />
                    <Column dataField="comment" alignment="left" caption="Тайлбар"
                            customizeText={(cellData) => {
                                return cellData.value !== "null" ? cellData.value : "Тайлбар бичигдээгүй"
                            }} />
                    <Paging defaultPageIndex={0} pageSize={5} />
                </DataGrid>
            </div> */}
            </ConfigProvider>
        </React.Fragment>
    )
}

export default CopperProductTransferLog;
