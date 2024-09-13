import { Button, LoadIndicator, LoadPanel, Popup, RadioGroup, Scheduler, SelectBox, Tooltip } from 'devextreme-react';
import React, { useEffect, useRef, useState } from 'react';
import OperationService from "../../services/api/operation";
import RefService from '../../services/api/ref';
import { Editing, Resource, View } from 'devextreme-react/cjs/scheduler';
import moment from 'moment';
import { locale, loadMessages } from 'devextreme/localization';
import mn from '../../../node_modules/devextreme/localization/messages/mn.json'
import Toolbar from "devextreme/ui/toolbar"
import notify from 'devextreme/ui/notify';
import { alert, custom } from "devextreme/ui/dialog";
import { FiMoon, FiSun } from 'react-icons/fi';
import { InputNumber } from 'antd';

export const BathOperation = () => {
    locale('mn')
    loadMessages(mn);

    const [current, setCurrent] = useState({
        year: moment().year(),
        week: moment().week()
    })
    const [bathGrid, setBathGrid] = useState([]);
    const updaterRef = useRef(new Map());
    const [bathRef, setBathRef] = useState([])
    const refHangerStatus = useRef([])
    const refOperationConfigStatus = useRef([])
    const [popup, setPopup] = useState(false)
    const [detailPerBath, setDetailPerBath] = useState(null)
    const [appointmentData, setAppointmentData] = useState([])
    const [statusUpdates, setStatusUpdates] = useState({
        bath_status_id: null,
        operation_config_status_id: null,
    })

    useEffect(() => {
        getBaths();
    }, [current.year, current.week]);

    useEffect(() => {
        getBathStatus();
        getHangerStatus();
        getOperationConfigStatus();
    }, [])

    const getBaths = async () => {
        try {
            let res = await OperationService.getBathsByWeek(current.year, current.week);
            setBathGrid(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const getBathStatus = async () => {
        try {
            let res = await RefService.getBathStatus();
            setBathRef(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    const getHangerStatus = async () => {
        try {
            let res = await RefService.getHangerStatus();
            refHangerStatus.current = res.data;
        } catch (error) {
            console.error(error);
        }
    }

    const getOperationConfigStatus = async () => {
        try {
            let res = await RefService.getOperationConfigStatus();
            refOperationConfigStatus.current = res.data;
        } catch (error) {
            console.error(error);
        }
    }


    const onContentReady = (e) => {
        let toolbarInstance = Toolbar.getInstance(e.element.querySelector(".dx-toolbar"));
        if (toolbarInstance.option("items").length === 2) {
            let items = toolbarInstance.option("items");
            toolbarInstance.option("items", [
                items[0],
                {
                    widget: "dxButton",
                    location: "after",
                    className: ".changeButton",
                    options: {
                        text: "Өөрчлөлт хадгалах",
                        type: "normal",
                        elementAttr: {
                            style: 'font-weight: 600; border-radius: 20px;'
                        },
                        disabled: moment().week() > current.week,
                        onClick: async () => {
                            if (updaterRef.current.size > 0) {
                                try {
                                    const body = Array.from(updaterRef.current.values());
                                    let res = await OperationService.changeShiftDayByWeek(body, current.year)
                                    res === 'success' && notify({ message: 'Амжилттай хадгаллаа', width: 'fit-content' }, "success", 2000);
                                } catch (error) {
                                    console.error('Batch update failed:', error);
                                } finally {
                                    updaterRef.current.clear();
                                }
                            }
                        },
                    }
                }
            ]);
        }
    }

    const onAppointmentUpdating = ({ newData }) => {
        const startDate = moment(newData.start_date.substring(0, 10));
        const configDate = moment(newData.config_date);
        const dayDiff = startDate.diff(configDate, 'days');
        const compositeKey = `${newData.bath_number}-${newData.week_number}`;
        let obj = {
            week_number: newData.week_number,
            bath_number: newData.bath_number,
            day_id: newData.day_id + dayDiff,
            shift_id: newData.start_date.substring(11) === '08:00:00' ? 1 : 2,
            config_date: startDate.format('YYYY-MM-DD')
        }
        updaterRef.current.set(compositeKey, obj);
    };

    const onAppointmentDetail = async ({ targetedAppointmentData }) => {
        setPopup(true)
        setAppointmentData(targetedAppointmentData)
        try {
            let res = await OperationService.getDetailsPerBath(current.year, current.week, targetedAppointmentData.bath_number);
            setDetailPerBath(res.data)
        } catch (error) {
            console.error(error);
        }
    };

    const hangerStatusHandler = (hangerNo, value) => {
        setDetailPerBath((prev) =>
            prev.map((item) =>
                item.hanger_number === hangerNo
                    ? { ...item, hanger_status_id: value }
                    : item
            )
        );

    }

    const hangerKatodHandler = (hangerNo, value) => {
        setDetailPerBath((prev) =>
            prev.map((item) =>
                item.hanger_number === hangerNo
                    ? { ...item, katod_count: value }
                    : item
            )
        );
    }

    const handlePerBathDetails = async () => {
        const body = {
            statusUpdates,
            hangerUpdates: detailPerBath
        }
        try {
            await OperationService.changeBathDetails(body, current.year, current.week, appointmentData.bath_number)
            notify({ message: 'Амжилттай хадгаллаа', width: 'fit-content' }, "success", 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setPopup(false)
            getBaths()
            setStatusUpdates({
                bath_status_id: null,
                operation_config_status_id: null,
            })
        }
    }

    const statusColor = (id) => {
        switch (id) {
            case 1:
                return '#000';
            case 2:
                return '#ced4df';
            case 3:
                return '#f95f53';
            default:
                return '#ffffff';
        }
    }

    const appointmentRender = ({ appointmentData }) => {
        return (
            <div className='scheduler-bath' style={{ border: `1px solid ${appointmentData.bath_status_id === 3 ? '#f95f53' : '#ced4df'}`, background: `${appointmentData.bath_status_id === 2 && '#f4f5f7'}` }}>
                <b style={{ color: statusColor(appointmentData.bath_status_id) }}>{appointmentData.bath_number}</b>
            </div>
        )
    }

    return (
        <div className='layout'>
            <Scheduler
                dataSource={bathGrid}
                onCurrentDateChange={(e) => setCurrent({ year: moment(e).year(), week: moment(e).week() })}
                timeZone='Asia/Ulaanbaatar'
                groupByDate={false}
                currentView='workWeek'
                showAllDayPanel={false}
                allDayPanelMode='hidden'
                startDayHour={8}
                endDayHour={24}
                cellDuration={480}
                adaptivityEnabled={true}
                startDateExpr='start_date'
                endDateExpr='end_date'
                shadeUntilCurrentTime={false}
                showCurrentTimeIndicator={true}
                textExpr='bath_number'
                appointmentRender={appointmentRender}
                timeCellRender={(e) => {
                    return (
                        <div style={{ whiteSpace: 'pre-line' }}>
                            {e.text !== '' ?
                                <><FiSun size={18} /><br /><b>1-р ээлж</b><br />08:00-16:00</>
                                :
                                <><FiMoon size={18} /><br /><b>2-р ээлж</b><br />16:00-00:00 </>}
                        </div>
                    )
                }}
                onContentReady={onContentReady}
                onAppointmentUpdating={onAppointmentUpdating}
                onAppointmentTooltipShowing={(e) => e.cancel = true}
                onAppointmentClick={onAppointmentDetail}
            >
                <Resource colorExpr='black' />
                <Editing allowDeleting={false} allowTimeZoneEditing={false} allowUpdating={moment().week() <= current.week} allowAdding={false} />
                <View type='workWeek' groupOrientation='vertical' maxAppointmentsPerCell='unlimited' />
            </Scheduler>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'end', paddingTop: 10 }}>
                Ванны төлөв: {bathRef.map((e) => (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span className='badge' style={{ backgroundColor: statusColor(e.id) }}></span>
                        {e.name}
                    </div>
                ))}
            </div>
            <Popup
                visible={popup}
                onHiding={() => { setPopup(false); setDetailPerBath(null); setAppointmentData([]) }}
                showTitle={true}
                width={500}
                height={500}
                dragEnabled={true}
            >
                <div className='appointment-container' style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className='form-row'>
                        <span className='form-field'>Ванны дугаар:</span>
                        <div className='form-value' style={{ fontWeight: 'bold' }}>№{appointmentData.bath_number}</div>
                    </div>
                    <div className='form-row'>
                        <span className='form-field'>Ванны төлөв:</span>
                        <div className='form-value' style={{ fontWeight: 'bold' }}>
                            <SelectBox items={bathRef} displayExpr={'name'} valueExpr={'id'} placeholder={appointmentData?.bath_status}
                                onValueChanged={(e) => {
                                    setStatusUpdates(prevState => ({ ...prevState, bath_status_id: e.value }));
                                    setDetailPerBath(prev => prev.map(item => ({ ...item, hanger_status_id: e.value === 1 ? 1 : 2 })))
                                }} />
                        </div>
                    </div>
                    <div className='form-row'>
                        <span className='form-field'>Ажиллагааны төлөв:</span>
                        <div className='form-value' style={{ fontWeight: 'bold' }}>
                            <SelectBox items={refOperationConfigStatus.current} displayExpr={'name'} valueExpr={'id'} placeholder={appointmentData?.operation_status}
                                onValueChanged={(e) => setStatusUpdates(prevState => ({ ...prevState, operation_config_status_id: e.value }))} />
                        </div>
                    </div>
                    <hr />
                    {detailPerBath ?
                        <>
                            <p style={{ textAlign: 'end' }}>Катодын тоо:</p>
                            {detailPerBath.map((e, i) =>
                                <div className='form-row' id='hanger_loader'>
                                    <span className='col-3'>{e.hanger_number}-р өлгүүр:</span>
                                    <div className='col-8' style={{ fontWeight: 'bold' }}>
                                        <RadioGroup
                                            dataSource={refHangerStatus.current}
                                            layout="horizontal"
                                            displayExpr='name'
                                            defaultValue={e.hanger_status_id}
                                            value={e.hanger_status_id}
                                            valueExpr={'id'}
                                            onValueChanged={(event) => hangerStatusHandler(e.hanger_number, event.value)}
                                        />
                                    </div>
                                    <InputNumber
                                        defaultValue={e.katod_count}
                                        controls={false}
                                        className='col-2'
                                        onChange={(val) => hangerKatodHandler(e.hanger_number, val)}
                                    />
                                </div>
                            )}
                        </>
                        :
                        <LoadIndicator height={20} width={20} />
                    }
                    <Button
                        text='Хадгалах' style={{ position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 20 }}
                        useSubmitBehavior={true}
                        onClick={handlePerBathDetails}
                        className='custom-save'
                    />
                </div>
            </Popup>
        </div>
    );
};
