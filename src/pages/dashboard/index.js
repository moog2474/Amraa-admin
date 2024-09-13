import React, { useContext, useEffect, useState } from 'react'

export const Dashboard = () => {
    const [bathArr, setBathArr] = useState({ first: [], second: [] })
    useEffect(() => {
        setBathArr(
            {
                first: Array.from({ length: 25 }, (_, index) => 50 - index),
                second: Array.from({ length: 25 }, (_, index) => index + 1)
            })
    }, [])


    return (
        <div className='m-2'>
            <h4>ЭЛЕКТРОЛИЗИЙН ЦЕХ</h4>
            <div className='layout mt-2'>
                <div className='m-3' style={{ display: 'flex', flexDirection: 'column', gap: 30, }}>
                    {bathArr.first.length > 0 && <div className='row' style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <div className='add-minus' style={{ backgroundColor: '#fff2f2', color: '#f66160' }}>-</div>
                        <hr style={{ width: 20 }} />
                        {bathArr.first.map((e, i) => {
                            const colorClass = Math.floor(i / 5) % 2 === 0 ? '#f58f31' : '#000';
                            const active = '#09b5e1'
                            return (
                                <div className='bath-sketch' style={{ borderColor: colorClass, display: 'flex', justifyContent: 'center', flexDirection: 'column' }} key={i} id={`bath_${e}`}>
                                    <div className='bath-number' style={{ color: colorClass }}>{e}</div>
                                    <div>
                                        {Array.from({ length: 15 }, (_, index) => (
                                            <hr key={index} style={{ backgroundColor: index % 2 === 0 ? '#50c687' : '#f66160', border: 0, height: 1, margin: '2px 0' }} />
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </div>}
                    {bathArr.second.length > 0 && <div className='row' style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <div className='add-minus' style={{ backgroundColor: '#e2fbee', color: '#50c687' }}>+</div>
                        <hr style={{ width: 20 }} />
                        {bathArr.second.map((e, i) => {
                            const colorClass = Math.floor(i / 5) % 2 !== 0 ? '#f58f31' : '#000';
                            const active = '#09b5e1'
                            return (
                                <div className='bath-sketch' style={{ borderColor: colorClass, display: 'flex', justifyContent: 'center', flexDirection: 'column' }} key={i} id={`bath_${e}`}>
                                    <div className='bath-number' style={{ color: colorClass }}>{e}</div>
                                    <div>
                                        {Array.from({ length: 15 }, (_, index) => (
                                            <hr key={index} style={{ backgroundColor: index % 2 === 0 ? '#50c687' : '#f66160', border: 0, height: 1, margin: '2px 0' }} />
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </div>}
                </div>
            </div>
        </div>
    )
}
