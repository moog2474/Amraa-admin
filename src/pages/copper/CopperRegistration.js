import { Button, DateBox, LoadPanel, TextArea, RadioGroup, SelectBox } from 'devextreme-react'
import notify from 'devextreme/ui/notify';
import React, { useContext, useEffect, useState } from 'react'
import CopperService from '../../services/api/copper';
import RefService from '../../services/api/ref';
import _ from 'lodash';
import moment from 'moment';
import { UserContext } from '../../hooks/UserContext';
import { ConfigProvider, InputNumber, Form, Button as FormButton } from 'antd';
import { FiMoon, FiSun } from 'react-icons/fi';
import { custom } from 'devextreme/ui/dialog';

const yeasNoData = [{
    key: true, name: 'Тийм'
}, {
    key: false, name: 'Үгүй'
}];

export const CopperRegistration = () => {
    const { user } = useContext(UserContext);
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
    const [rejectedType, setRejectedType] = useState([])
    const [bathArray, setBathArray] = useState([]);
    const [bundleObj, setBundleObj] = useState({})
    const [loader, setLoader] = useState(true);
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
    const [hangerData, setHangerData] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [shift, setShift] = useState(user.shift_id || 1)
    const [form] = Form.useForm()

    useEffect(() => {
        rejectedTypes()
    }, [])

    useEffect(() => {
        getCopperRegByDate();
    }, [date, shift])

    const getCopperRegByDate = async () => {
        try {
            setLoader(true)
            let { data } = await CopperService.getCopperRegDetail(date, shift);
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
            return setLoader(false)
        } catch (e) {
            console.error(e);
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
    const rejectedTypes = async () => {
        try {
            let res = await RefService.getRejectedTypes()
            setRejectedType(res.data)
        } catch (e) {
            console.error(e);
        }
    }

    const updateHangerKatodCount = (bathNum, hangerNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                hangerData: hangerData.hangerData.map(attr =>
                    attr.hanger_number === hangerNum ? {
                        ...attr, katod_count: changeAmt
                    } : attr
                )
            } : hangerData
        );
    }
    const updateHangerCopperCount = (bathNum, hangerNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                hangerData: hangerData.hangerData.map(attr =>
                    attr.hanger_number === hangerNum ? {
                        ...attr, copper_count: changeAmt
                    } : attr
                )
            } : hangerData
        );
    }
    const updateBathRejectedCount = (bathNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                rejected_copper_count: changeAmt
            } : hangerData
        );
    }
    const updateBathIsRejected = (bathNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                is_copper_rejected: changeAmt
            } : hangerData
        );
    }
    const updateBathRejectedWeight = (bathNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                rejected_copper_weigth: changeAmt
            } : hangerData
        );
    }
    const updateBathRejectedType = (bathNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                copper_rejected_type_id: changeAmt
            } : hangerData
        );
    }
    const updateBathDescription = (bathNum, changeAmt) => {
        setHangerData(
            hangerData.bath_number === bathNum ? {
                ...hangerData,
                description: changeAmt
            } : hangerData
        );
    }
    const updateBathTotalWeight = (bathNum, changeAmt) => {
        setHangerData(prevHangerData => {
            if (prevHangerData.bath_number === bathNum) {
                const totalCopperCount = prevHangerData.hangerData.reduce((sum, hanger) => sum + parseFloat(hanger.copper_count), 0);
                const updatedHangerData = prevHangerData.hangerData.map(hanger => {
                    const proportion = parseFloat(hanger.copper_count) / totalCopperCount;
                    return {
                        ...hanger,
                        copper_weigth: (changeAmt * proportion).toFixed(2),
                    };
                });
                return {
                    ...prevHangerData,
                    total_weight: changeAmt,
                    hangerData: updatedHangerData,
                };
            }
            return prevHangerData;
        });
    }

    const onSaveCopperMake = async (values) => {
        try {
            setLoader(true)
            await CopperService.mergeCopperRegistration(hangerData);
            await getCopperRegByDate();
            notify({ message: 'Амжилттай хадгалагдлаа', width: 'fit-content' }, "success", 2000);
            return setLoader(false)
        } catch (e) {
            notify('Хадгалах явцад алдаа гарлаа', "error", 2000);
            setLoader(false)
        }
    }

    const disableWeekends = (args) => {
        const dayOfWeek = args.date.getDay();
        const isWeekend = args.view === "month" && (dayOfWeek === 0 || dayOfWeek === 6);
        return isWeekend
    }

    const removeBundle = (bundle_no) => {
        let updatedBundleData = bundleObj.bundleData.filter((bundle) => bundle.bundle_no !== bundle_no);
        updatedBundleData = updatedBundleData.map((bundle) => {
            if (bundle.bundle_no > bundle_no) {
                return {
                    ...bundle,
                    bundle_no: bundle.bundle_no - 1
                };
            }
            return bundle;
        });
        setBundleObj({ ...bundleObj, bundleData: updatedBundleData });
        setSumObj({
            ...sumObj,
            balance_copper_count: (bundleObj.start_balance_copper_count + sumObj.copper_count) - _.sumBy(updatedBundleData, 'bundled_copper_count'),
            balance_copper_weight: (bundleObj.start_balance_copper_weight + sumObj.total_weight) - _.sumBy(updatedBundleData, 'bundled_copper_weight')
        })
    };

    const updateBundleCopNum = (no, value) => {
        if (sumObj.balance_copper_count > value) {
            setBundleObj({
                ...bundleObj,
                bundleData: bundleObj.bundleData.map(it =>
                    it.bundle_no === no ? {
                        ...it, bundled_copper_count: value
                    } : it
                )
            });
        } else {
            notify({ message: 'Үлдэгдэл хүрэлцэхгүй байна.', width: 'fit-content' }, "warning", 3000);
        }
    }

    const updateBundleCopWeight = (no, value) => {
        if (sumObj.balance_copper_weight > value) {
            setBundleObj({
                ...bundleObj,
                bundleData: bundleObj.bundleData.map(it =>
                    it.bundle_no === no ? {
                        ...it, bundled_copper_weight: value
                    } : it
                )
            })
        } else {
            notify({ message: 'Үлдэгдэл хүрэлцэхгүй байна.', width: 'fit-content' }, "warning", 3000);
        }
    }
    const returnNamePosition = (last, first, position) => {
        let lastName = last ? (last?.slice(0, 1) + '.') : '-'
        return <span><b>{lastName} {first}</b> {position ? `/${position}/` : ''}</span>
    }

    const requestHandler = async () => {
        if (bundleObj.ref_copper_reg_status === 3) {
            setBundleObj({ ...bundleObj, ref_copper_reg_status: 1, status_name: 'Шинэ' })
        } else if (!bundleObj.bundleData[0].bundled_copper_count && !bundleObj.bundleData[0].bundled_copper_weight) {
            notify({ message: 'Боолтын мэдээллээ оруулна уу.', width: 'fit-content' }, "warning", 3000);
        } else {
            let myDialog = custom({
                title: "Баталгаажуулалт",
                messageHtml: `<i>Та <b>зэс хураалтын мэдээлэл</b> илгээхдээ итгэлтэй байна уу?</i>`,
                buttons: [{
                    text: "Тийм",
                    onClick: (e) => {
                        return { buttonText: e.component.option("text") }
                    },
                },
                {
                    text: "Үгүй",
                    onClick: (e) => {
                        return { buttonText: e.component.option("text") }
                    },
                }]
            })
            myDialog.show().then(async (dialogResult) => {
                if (dialogResult.buttonText === "Тийм") {
                    try {
                        await CopperService.changeRequestStatus({
                            id: bundleObj.id,
                            type: 2,
                            shift_id: bundleObj.shift_id,
                            shift_date: bundleObj.shift_date,
                        })
                        await getCopperRegByDate();
                        notify({ message: 'Амжилттай илгээгдлээ', width: 'fit-content' }, "success", 3000);
                    } catch (error) {
                        console.log('error', error)

                    }
                }
            })
        }
    }

    const handleBundleColumn = () => {
        if (sumObj.balance_copper_count > 0 && sumObj.balance_copper_weight > 0) {
            let lastEl = bundleObj.bundleData[bundleObj.bundleData.length - 1];
            if (lastEl.bundled_copper_count && lastEl.bundled_copper_weight) {
                setBundleObj({ ...bundleObj, bundleData: [...bundleObj.bundleData, { bundle_no: lastEl.bundle_no + 1 }] })
                setSumObj({
                    ...sumObj,
                    balance_copper_count: (bundleObj.start_balance_copper_count + sumObj.copper_count) - _.sumBy(bundleObj.bundleData, 'bundled_copper_count'),
                    balance_copper_weight: (bundleObj.start_balance_copper_weight + sumObj.total_weight) - _.sumBy(bundleObj.bundleData, 'bundled_copper_weight')
                })
            }
            else {
                notify({ message: 'Боолтын мэдээлллээ гүйцэт оруулна уу.', width: 'fit-content' }, "warning", 3000);
            }
        } else {
            notify({ message: 'Үлдэгдэл хүрэлцэхгүй байна.', width: 'fit-content' }, "warning", 3000);
        }
    }
    
    const onSaveBundle = async () => {
        try {
            let myDialog = custom({
                title: "Баталгаажуулалт",
                messageHtml: `<i>Та <b>боолтын мэдээлэл</b> хадгалахдаа итгэлтэй байна уу?</i>`,
                buttons: [
                    {
                        text: "Тийм",
                        onClick: (e) => {
                            return { buttonText: e.component.option("text") }
                        },
                    },
                    {
                        text: "Үгүй",
                        onClick: (e) => {
                            return { buttonText: e.component.option("text") }
                        },
                    }
                ]
            });
    
            myDialog.show().then(async (dialogResult) => {
                if (dialogResult.buttonText === "Тийм") {
                    try {
                        setLoader(true);
                        await CopperService.mergeBundleRegistration(bundleObj);
                        await getCopperRegByDate();
                        notify({ message: 'Амжилттай хадгалагдлаа', width: 'fit-content' }, "success", 2000);
                        return setLoader(false);
                    } catch (e) {
                        notify('Хадгалах явцад алдаа гарлаа', "error", 2000);
                        setLoader(false);
                    }
                }
            });
        } catch (errorInfo) {
            console.log('Validation Failed:', errorInfo);
        }
    };

    const checkRules = (max) => {
        return [
            { required: true, message: 'Заавал оруулах' },
            { type: 'number', min: 0, message: 'Утга шалгана уу' },
            { type: 'number', max: max, message: 'Хязгаараас их' },
        ]
    }

    console.log();
    

    return (
        <div>
            <ConfigProvider
                theme={{
                    token: {
                        borderRadius: 15,
                    }
                }}
            >
                <LoadPanel
                    shadingColor="rgba(0,0,0,0.4)"
                    position={{ of: '#password' }}
                    visible={loader}
                    showPane={false}
                    message="Түр хүлээнэ үү..."
                />
                <div className='d-flex justify-space-between m-2'>
                    <div className='d-flex g-2 customizeDateBox'>
                        <DateBox
                            width={160}
                            height={40}
                            defaultValue={date}
                            type='date'
                            stylingMode='outlined'
                            displayFormat='yyyy-MM-dd'
                            onValueChange={(e) => setDate(e)}
                            style={{ borderRadius: 20, border: 'none', paddingLeft: 15 }}
                            pickerType='calendar'
                            disabledDates={disableWeekends}
                        />
                        <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 40 }}>
                            <div className='eelj' onClick={() => (!user.shift_id || user.roles[0].id === 6) && setShift(shift === 1 ? 2 : 1)} style={{ flexWrap: 'wrap', height: 40 }}>
                                <div style={{ borderRight: '1px solid #DEDEDE', width: '75%', display: 'flex', alignItems: 'center' }}>
                                    <p style={{ padding: '7px 0 8px 15px', fontWeight: 'bold' }}>{shift === 1 ? '1-р ээлж' : '2-р ээлж'}</p>
                                </div>
                                <div style={{ width: '25%', textAlign: 'center', margin: 'auto', verticalAlign: 'middle', paddingTop: 3 }}>
                                    {shift === 1 ? <FiSun size={17}  /> : <FiMoon size={17} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        text={[1,3].includes(bundleObj?.ref_copper_reg_status) ? 'Хянуулах' : bundleObj.status_name}
                        visible={!_.isEmpty(bundleObj)}
                        disabled={[2, 4].includes(bundleObj.ref_copper_reg_status)}
                        type='normal'
                        style={{
                            borderRadius: 20, border: 'none', padding: '8px 20px', paddingBlock: 0, fontWeight: 'bold',
                            color: `${bundleObj?.ref_copper_reg_status === 4 ? '#40b6af' : '#000'}`,
                            backgroundColor: `${ bundleObj?.ref_copper_reg_status === 4 ? '#e5fef7' : '#fff'}`
                        }}
                        onClick={requestHandler}
                    />
                </div>
                <div className={'card'} style={{ padding: 10, border: 'none' }}>
                    <div className='m-2' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>1.ЗЭС ХУРААЛТ ХИЙХ</b>
                        <div>
                            <span className='text-card mr-2' style={{ border: '1px solid #dedede', color: '#b8b4b4' }}>LOT {bundleObj.lot_no || bundleObj.current_lot_no}</span>
                            <span className='text-card' style={{ color: '#f29f67', background: '#fcf6f0' }}>ванн №{hangerData.bath_number}</span>
                        </div>
                    </div>
                    <div className=''>
                        <div className='row d-flex g-3 align-item-center m-3'>
                            <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                <p style={{ textAlign: 'center' }}>Өмнөх үлдэгдэл</p>
                                <p className='balance-text'>{bundleObj.start_balance_copper_count || '-'} ш</p>
                                <p className='balance-text'>{bundleObj.start_balance_copper_weight} кг</p>
                            </div>
                            {bathArray.length > 0 &&
                                <div className='d-flex align-item-center' style={{ alignItems: 'center' }}>
                                    <div className='add-minus' style={{ backgroundColor: '#e2fbee', color: '#50c687' }}>+</div>
                                    <hr style={{ width: 20 }} />
                                    {bathArray.map((e, i) => {
                                        const colorClass = e.bath_status_id === 1 ? '#f29f67' : '#ced4df';
                                        return (
                                            <div className='bath-polygon' aria-disabled={e.bath_status_id !== 1} style={{ borderColor: colorClass, display: 'flex', justifyContent: 'center', flexDirection: 'column', backgroundColor: e.bath_status_id !== 1 ? '#f4f5f7' : selectedIndex === i ? '#fef5ef' : 'white'  }} key={i} id={`bath_${e.bath_number}`}
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
                                <p style={{ textAlign: 'center' }}>Миний хураалт</p>
                                <p className='balance-text'>{sumObj.copper_count || '-'} ш</p>
                                <p className='balance-text'>{sumObj.total_weight} кг</p>
                            </div>
                            <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                <p style={{ textAlign: 'center' }}>Нийт гологдол</p>
                                <p className='balance-text'>{sumObj.rejected_copper_count || '-'} ш</p>
                                <p className='balance-text'>{sumObj.rejected_copper_count} кг</p>
                            </div>
                        </div>

                        <div className='row m-3' style={{ marginTop: 30 }}>
                            {hangerData &&
                                <Form
                                    onFinish={onSaveCopperMake}
                                    form={form}
                                    className='d-flex'
                                    style={{width: '100%'}}
                                >
                                    <div className='row justify-space-between align-item-end'>
                                        <div className='d-flex g-3'>
                                            <div className='d-flex flex-col' style={{ margin: '50px 0', gap: 32 }}>
                                                <div style={{ fontWeight: '500' }}>Хураасан катодын тоо: <span style={{ color: 'red' }}>*</span></div>
                                                <div style={{ fontWeight: '500', }}>Хураасан хавтангын тоо: <span style={{ color: 'red' }}>*</span></div>
                                                <div style={{ fontWeight: '500', }}>Хураасан хавтангын жин: <span style={{ color: 'red' }}>*</span></div>
                                                <div style={{ fontWeight: '500', }}>Тайлбар:</div>
                                            </div>
                                            <div >
                                                <div className='d-flex g-3'>
                                                    {hangerData && hangerData.hangerData !== undefined && hangerData.hangerData.map((data, i) => {
                                                        return (
                                                            <div className='d-flex flex-col'>
                                                                <div className={'hanger-card'} style={{ marginBottom: 16 }}>
                                                                    {'Өлгүүр ' + data.hanger_number}
                                                                </div>
                                                                <Form.Item name={`katod_count-${i}-${data.bath_number}`} rules={checkRules(data.bath_hang_katod_count)}>
                                                                    <InputNumber
                                                                        controls={false}
                                                                        value={data.katod_count}
                                                                        defaultValue={data.katod_count}
                                                                        type='number'
                                                                        className={'number-card'}
                                                                        onChange={(e) => e !== null && updateHangerKatodCount(data.bath_number, data.hanger_number, e)}
                                                                        addonBefore={<span onClick={() => updateHangerKatodCount(data.bath_number, data.hanger_number, data.bath_hang_katod_count)}>{data.bath_hang_katod_count}</span>}
                                                                        disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || data.hanger_status_id !== 1 || hangerData.bath_status_id !== 1}
                                                                    />
                                                                </Form.Item>
                                                                <Form.Item name={`copper_count-${i}-${data.bath_number}`} rules={checkRules(data.bath_hang_katod_count * 2)}>
                                                                    <InputNumber
                                                                        controls={false}
                                                                        value={data.copper_count}
                                                                        defaultValue={data.katod_count}
                                                                        type='number'
                                                                        className={'number-card'}
                                                                        onChange={(e) => e !== null && updateHangerCopperCount(data.bath_number, data.hanger_number, e)}
                                                                        addonBefore={<span onClick={() => updateHangerKatodCount(data.bath_number, data.hanger_number, data.bath_hang_katod_count * 2)}>{data.bath_hang_katod_count * 2}</span>}
                                                                        disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || data.hanger_status_id !== 1 || hangerData.bath_status_id !== 1}
                                                                    />
                                                                </Form.Item>
                                                                <InputNumber
                                                                    controls={false}
                                                                    value={data.copper_weigth}
                                                                    type='number'
                                                                    className={'number-card'}
                                                                    addonAfter='кг'
                                                                    disabled
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
                                                    onValueChanged={(e) => e.event !== undefined && updateBathDescription(hangerData.bath_number, e.value)}
                                                    disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || hangerData.bath_status_id !== 1}
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
                                                    disabled={true}
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
                                                    disabled={true}
                                                />
                                                <Form.Item name={`total_weight-${hangerData.bath_number}`} rules={[{ required: true, message: 'Заавал оруулах' }, { type: 'number', min: 0, message: 'Утга шалгана уу' }]}>
                                                    <InputNumber
                                                        controls={false}
                                                        value={hangerData.total_weight}
                                                        defaultValue={hangerData.total_weight}
                                                        disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || hangerData.bath_status_id !== 1}
                                                        type='number'
                                                        addonAfter='кг'
                                                        className={'number-card'}
                                                        min={0}
                                                        onChange={(e) => { e !== null && updateBathTotalWeight(hangerData.bath_number, e); }}
                                                    />
                                                </Form.Item>
                                            </div>
                                            <div className='d-flex flex-col' style={{ gap: 14 }}>
                                                <div className={'hanger-card'}>
                                                    Гологдол
                                                </div>
                                                <RadioGroup
                                                    items={yeasNoData}
                                                    value={hangerData.is_copper_rejected}
                                                    disabled={[2, 4].includes(bundleObj.ref_copper_reg_status)}
                                                    valueExpr={'key'}
                                                    displayExpr={'name'}
                                                    layout="horizontal"
                                                    style={{ margin: '7px 0' }}
                                                    onValueChanged={(e) => { e.event !== undefined && updateBathIsRejected(hangerData.bath_number, e.value) }}
                                                />
                                                <InputNumber
                                                    controls={false}
                                                    value={hangerData.rejected_copper_count}
                                                    defaultValue={hangerData.rejected_copper_count}
                                                    type='number'
                                                    width={120}
                                                    min={0}
                                                    className={'number-card'}
                                                    disabled={!hangerData.is_copper_rejected || hangerData.bath_status_id !== 1 ? true : false}
                                                    onChange={(e) => e !== null && updateBathRejectedCount(hangerData.bath_number, e)}
                                                />
                                                <InputNumber
                                                    width={120}
                                                    controls={false}
                                                    value={hangerData.rejected_copper_weigth}
                                                    defaultValue={hangerData.rejected_copper_weigth}
                                                    type='number'
                                                    className={'number-card'}
                                                    min={0}
                                                    disabled={!hangerData.is_copper_rejected || hangerData.bath_status_id !== 1 ? true : false}
                                                    onChange={(e) => e !== null && updateBathRejectedWeight(hangerData.bath_number, e)}
                                                />
                                                <SelectBox
                                                    items={rejectedType} width={120} wrapItemText={true} text='сонгох...'
                                                    value={hangerData.copper_rejected_type_id}
                                                    style={{ borderRadius: 20 }}
                                                    valueExpr='id' displayExpr='name' disabled={!hangerData.is_copper_rejected || hangerData.bath_status_id !== 1 ? true : false}
                                                    onValueChanged={(e) => e.event !== undefined && updateBathRejectedType(hangerData.bath_number, e.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <FormButton
                                                htmlType="submit"
                                                style={{ border: '1px solid #ced4df', fontWeight: 600, marginRight: 25 }}
                                                disabled={[2, 4].includes(bundleObj.ref_copper_reg_status)}
                                                type="text"
                                            >
                                                Хадгалах
                                            </FormButton>
                                        </div>
                                    </div>
                                </Form>
                            }
                        </div>
                    </div>
                </div>
                <div className={'card'} style={{ padding: 10, border: 'none', marginTop: 10 }}>
                    <div className='d-flex justify-space-between m-2'>
                        <b>2. БООЛТ ХИЙХ</b>
                        {!bundleObj.start_balance_copper_count && !bundleObj.start_balance_copper_weight && bundleObj.ref_copper_reg_status === 1 &&
                            <p style={{ color: '#f66160' }}>Өмнөх ээлжийн зэсийн бүртгэлийг <strong>БАТЛААГҮЙ</strong> байгаа тул боолт хийх боломжгүй!</p>}
                    </div>
                    <div className='row' style={{ display: 'flex', gap: 20, paddingTop: 10 }}>
                        <div style={{ display: 'flex' }}>
                            {/* <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                <p style={{ textAlign: 'center' }}>Өмнөх үлдэгдэл, ш</p>
                                <p><b style={{ fontSize: 24 }}>{bundleObj.start_balance_copper_count || 0}</b></p>
                                <p>{bundleObj.start_balance_copper_weight || 0} кг</p>
                            </div>
                            <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                <p style={{ textAlign: 'center' }}>Миний хураалт, ш</p>
                                <p><b style={{ fontSize: 24 }}>{sumObj.copper_count}</b></p>
                                <p>{sumObj.total_weight} кг</p>
                            </div> */}
                            <div className='card d-flex justify-space-between p-2 align-item-center flex-col' style={{ width: 100, height: 150 }}>
                                <p style={{ textAlign: 'center' }}>Нийт үлдэгдэл</p>
                                <p className='balance-text'>{sumObj.balance_copper_count || '-'} ш</p>
                                <p className='balance-text'>{sumObj.balance_copper_weight} кг</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: 'calc(100% - 130px)' }}>
                            <div className='col-12' style={{ display: 'flex', gap: 10, padding: 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '10rem', fontWeight: 500 }}>
                                    <div>Боодлын дугаар:</div>
                                    <div>Боосон хавтангийн тоо:</div>
                                    <div>Боосон хавтангийн жин: </div>
                                    <Button text='+'
                                        style={{ width: 90, borderRadius: 20 }}
                                        onClick={handleBundleColumn}
                                        disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || (!bundleObj.start_balance_copper_count && !bundleObj.start_balance_copper_weight)}
                                    />
                                </div>
                                <div className='bundle-container' style={{ display: 'flex', gap: 10, height: '10rem', overflowX: 'auto' }}>
                                    {bundleObj && bundleObj.bundleData !== undefined &&
                                        bundleObj.bundleData.map((e, i) => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontWeight: 500, width: 100, flex: 1, flexGrow: 'initial' }}>
                                                <InputNumber
                                                    controls={false}
                                                    value={`№${e.bundle_no}`}
                                                    disabled />
                                                <InputNumber
                                                    controls={false}
                                                    value={e.bundled_copper_count}
                                                    disabled={[2, 4].includes(bundleObj.ref_copper_reg_status)}
                                                    defaultValue={e.bundled_copper_count}
                                                    type='number'
                                                    min={0}
                                                    inputMode='numeric'
                                                    onChange={(value) => value !== null && updateBundleCopNum(e.bundle_no, value)}
                                                />
                                                <InputNumber
                                                    controls={false}
                                                    value={e.bundled_copper_weight}
                                                    disabled={[2, 4].includes(bundleObj.ref_copper_reg_status)}
                                                    type='number'
                                                    min={0}
                                                    addonAfter='кг'
                                                    onChange={(value) => value !== null && updateBundleCopWeight(e.bundle_no, value)}
                                                />
                                                <Button visible={i !== 0 && ![2, 4].includes(bundleObj.ref_copper_reg_status)} text='-' className='minus' type='normal' onClick={() => removeBundle(e.bundle_no)} />
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <div style={{ paddingBottom: 22 }}>
                                <Button text={'Хадгалах'} type='normal' style={{ borderRadius: 20, fontWeight: 600, marginRight: 10 }} width={90} height={32} 
                                    disabled={[2, 4].includes(bundleObj.ref_copper_reg_status) || (!bundleObj.start_balance_copper_count && !bundleObj.start_balance_copper_weight)}
                                    onClick={onSaveBundle} />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    <div className="card col-9" style={{ border: 'none' }} >
                        <div style={{ borderBottom: '1px solid #ddd', padding: '10px 20px' }}><b>Өнөөдрийн зэс хураалтын мэдээ</b></div>
                        <div style={{ display: 'flex', gap: 30, padding: '10px 20px' }}>
                            <div className='col-3 d-flex flex-col g-1'>
                                <div className='d-flex justify-space-between'><span className='col-9'>Хураасан хавтангийн тоо:</span><b>{sumObj.copper_count}</b></div>
                                <div className='d-flex justify-space-between'><span className='col-9'>Хураасан хавтангийн жин:</span><b>{sumObj.total_weight} кг</b></div>
                            </div>
                            <div className='col-3 d-flex flex-col g-1'>
                                <div className='d-flex justify-space-between'><span className='col-9'>Өмнөх үлдэгдлийн тоо:</span><b>{bundleObj.start_balance_copper_count || 0}</b></div>
                                <div className='d-flex justify-space-between'><span className='col-9'>Өмнөх үлдэгдлийн жин:</span><b>{bundleObj.start_balance_copper_weight || 0} кг</b></div>
                            </div>
                            <div className='col-3 d-flex flex-col g-1'>
                                <div className='d-flex justify-space-between'><span className='col-9'>Боолтын тоо:</span><b>{bundleObj?.bundleData?.length || 0}</b></div>
                                <div className='d-flex justify-space-between'><span className='col-9'>Боолтын жин:</span><b>{sumObj.bundled_copper_weight} кг</b></div>
                            </div>
                            <div className='col-3 d-flex flex-col g-1'>
                                <div className='d-flex justify-space-between'><span className='col-9'>Гологдлын тоо:</span><b>{sumObj.rejected_copper_count}</b></div>
                                <div className='d-flex justify-space-between'><span className='col-9'>Гологдлын жин:</span><b>{sumObj.rejected_copper_weigth} кг</b></div>
                            </div>
                        </div>
                    </div>
                    <div className="card col-3" style={{ border: 'none' }}>
                        <div style={{ borderBottom: '1px solid #ddd', padding: '10px 20px', display: 'flex', justifyContent: 'space-between' }}>
                            <b>Ээлжийн мэдээлэл</b>
                            {shift === 1 ?
                                <b className='d-flex g-2' style={{ alignItems: 'center' }}>1-р ээлж <FiSun size={18} color='orange' /></b> :
                                <b className='d-flex g-2' style={{ alignItems: 'center' }}>2-р ээлж <FiMoon size={18} color='#003696' /> </b>
                            }
                        </div>
                        <div className='d-flex flex-col g-1' style={{ padding: '10px 20px' }}>
                            <div className='d-flex g-3 justify-space-between'>Бүртгэсэн: {returnNamePosition(bundleObj?.createdUser?.last_name, bundleObj?.createdUser?.first_name, bundleObj?.createdUser?.position_name)}</div>
                            <div className='d-flex g-3 justify-space-between'>Баталсан: {returnNamePosition(bundleObj?.updatedUser?.last_name, bundleObj?.updatedUser?.first_name, bundleObj?.updatedUser?.position_name) || '-'}</div>
                        </div>
                    </div>
                </div>
            </ConfigProvider>
        </div>
    )
}
