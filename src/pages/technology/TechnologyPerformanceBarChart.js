import React, { useState, useEffect, useRef } from "react";
import notify from "devextreme/ui/notify"
import _ from "lodash"
import {blueColorGradient, numberWithCommas, redColorGradient } from "../../util"
import Chart, {
    ArgumentAxis,
    Border,
    CommonSeriesSettings,
    Crosshair,
    Grid,
    Label,
    Legend,
    LoadingIndicator,
    Point,
    ScrollBar,
    Series,
    Title,
    Tooltip,
    ValueAxis,
    ZoomAndPan,
} from "devextreme-react/chart"
import Toolbar, { Item } from 'devextreme-react/toolbar'
import SelectBox from "devextreme-react/select-box";
import moment from "moment";
const chooserData = [{
    code: 'uusgalt_huder_hemjee_tons',
    name: 'Уусгалтанд орж буй хүдрийн хэмжээ/тн/',
    target: 'uusgalt_huder_hemjee_tons_guistetgel'
}   ,
    {
    code: 'uusgalt_huder_hemjee_m3',
    name: 'Уусгалтанд орж буй хүдрийн хэмжээ/м3/',
    target: 'uusgalt_huder_hemjee_m3_guistetgel'
    }
    ,
    {
        code: 'uusgalt_block_hemjee_m2',
        name: 'Уусгалтанд орж буй блокийн хэмжээ/м2/',
        target: 'uusgalt_block_hemjee_m2_guistetgel'
    }
    ,
    {
        code: 'us_m3',
        name: 'Ус /м3/',
        target: 'us_m3_guistetgel'
    }
    ,
    {
        code: 'uusgalt_ursgal_m3_tsag',
        name: 'Уусгалтын урсгал /м3/ц/',
        target: 'uusgalt_ursgal_m3_tsag_guistetgel'
    }
    ,
    {
        code: 'huher_huchil_hemjee_tons',
        name: 'Хүхрийн хүчлийн хэмжээ /тн/',
        target: 'huher_huchil_hemjee_tons_guistetgel'
    }
    ,
    {
        code: 'guartek_hemjee_kg_vikosol',
        name: 'Гуартекийн хэмжээ /кг/ /Викосол/',
        target: 'guartek_hemjee_kg_vikosol_guistetgel'
    }
    ,
    {
        code: 'cobalt_sulfat_kg',
        name: 'Кобальт сульфат /кг/',
        target: 'cobalt_sulfat_kg_guistetgel'
    }
    ,
    {
        code: 'kerosin_tons',
        name: 'Керосин /тн/',
        target: 'kerosin_tons_guistetgel'
    },
    {
        code: 'lix984n_tons',
        name: 'LIX984N /тн/',
        target: 'lix984n_tons_guistetgel'
    }
    ,
    {
        code: 'guidel_a',
        name: 'Гүйдэл  /А/',
        target: 'guidel_a_guistetgel'
    },
    {
        code: 'daily_zes_hemjee_kg',
        name: 'Өдөрт хураах  зэсийн хэмжээ /кг/',
        target: 'daily_zes_hemjee_kg_guistetgel'
    }
]
const TechnologyPerformanceBarChart = (props) => {
    const chartRef = useRef(null);
    const [selectedChooserCode, setSelectedChooserCode] = useState('uusgalt_huder_hemjee_tons');
    const [selectedChooserName, setSelectedChooserName] = useState('Уусгалтанд орж буй хүдрийн хэмжээ/тн/');
    const [selectedChooserTarget, setSelectedChooserTarget] = useState('uusgalt_huder_hemjee_tons_guistetgel');

    useEffect(() => {
    }, [props.chartData])

    const customizeTooltip = (arg) => {
        if (arg.seriesName === "Төлөвлөгөөний өөрчлөлт") {
            let r = _.find(props.chartData, {
                ognoo: moment(arg.argument).add(-1, 'days').format('YYYY-MM-DD')
            })
            let q = (
                arg.value - (r && r[`${selectedChooserCode}`]) > 0
                    ? arg.value / (r && r[`${selectedChooserCode}`])
                    : (r && r[`${selectedChooserCode}`]) / arg.value
            ).toFixed(2)
            let p = ((arg.value * 100) / (r && r[`${selectedChooserCode}`]) - 100).toFixed(2)
            let d = arg.value - (r && r[`${selectedChooserCode}`])
            let f = d < 0 ? "бага" : "их"
            if (isFinite(q) && !isNaN(q)) {
                return {
                    html: `<div class="tooltip-header">
            <span>Төлөвлөгөө ${arg.argumentText} өдөр:</span>
            <span>${numberWithCommas(arg.value)} </span>
            </div>
            <hr/>
            <b><i>Өмнөх өдрөөс</i></b><br/>
            <span class="tooltip-series-name">Зөрүү:</span> ${numberWithCommas(d)}<br/> 
            <span class="tooltip-series-name">Хувь:</span> ${p}%<br/> 
            <span class="tooltip-series-name">Өөрчлөлт:</span> ${q} дахин ${f}`,
                }
            } else {
                return {
                    html: `<div class="tooltip-header">
          <span>Төлөвлөгөө ${arg.argumentText} өдөр:</span>
          <span>${numberWithCommas(arg.value)} </span>
          </div>`,
                }
            }
        } else if (arg.seriesName === "Гүйцэтгэлийн өөрчлөлт") {
            let r = _.find(props.chartData, {
                ognoo: moment(arg.argument).add(-1, 'days').format('YYYY-MM-DD')

            })
            let q = (
                arg.value - (r && r[`${selectedChooserTarget}`]) > 0
                    ? arg.value / (r && r[`${selectedChooserTarget}`])
                    : (r && r.guitsetgel) / arg.value
            ).toFixed(2)
            let p = ((arg.value * 100) / (r && r[`${selectedChooserTarget}`]) - 100).toFixed(2)
            let d = arg.value - (r && r[`${selectedChooserTarget}`])
            let f = d < 0 ? "бага" : "их"
            let r1 = _.find(props.chartData, { ognoo: (arg.argument).toString() })
            let u = (r1 && r1[`${selectedChooserCode}`]) - arg.value
            let u1 = ((arg.value * 100) / (r1 && r1[`${selectedChooserCode}`])).toFixed(2)
            if (isFinite(q) && !isNaN(q)) {
                return {
                    html: `<div class="tooltip-header">
          <span>Гүйцэтгэл ${arg.argumentText} өдөр:</span>
          <span>${numberWithCommas(arg.value)}</span>
          </div>
          <hr/>
          <b><i>Төлөвлөгөөнөөс </b></i><br/>
          <span class="tooltip-series-name">Зөрүү: </span>${numberWithCommas(u)} <br/>
          <span class="tooltip-series-name" style={{marginBottom: 10}}>Xувь: </span>${u1}% <br/>
          <hr/>
          <b><i>Өмнөх өдрөөс </b></i><br/>
          <span class="tooltip-series-name">Зөрүү: </span>${numberWithCommas(d)} <br/>
          <span class="tooltip-series-name">Хувь: </span>${p}% <br/>
          <span class="tooltip-series-name">Өөрчлөлт: </span>${q} дахин ${f}<br/> `,
                }
            } else {
                return {
                    html: `<div class="tooltip-header">
          <span>Гүйцэтгэл ${arg.argumentText} өдөр:</span>
          <span>${numberWithCommas(arg.value)} </span>
          </div>`,
                }
            }
        } else if (arg.seriesName === "Гүйцэтгэл") {
            return {
                html: `<div class="tooltip-header">
        <span>Гүйцэтгэл ${arg.argumentText} өдөр:</span>
        <span>${numberWithCommas(arg.value)}</span>
        </div>
        <hr/>
        <b><i>Төлөвлөгөөнөөс </b></i><br/>
        <span class="tooltip-series-name">Зөрүү: </span> ${numberWithCommas((arg.point.data[`${selectedChooserCode}`] - arg.value))}<br/> 
        <span class="tooltip-series-name">Хувь:</span> ${((arg.value) / (arg.point.data[`${selectedChooserCode}`]) * 100).toFixed(2)}%`
            }
        }
        else {
            return {
                html: `<div class="tooltip-header">
        <span>${arg.seriesName} ${arg.argumentText} он:</span>
        <span>${numberWithCommas(arg.value)}</span>
        </div>
        <hr/>
        <b><i>Төлөвлөгөөнөөс</b></i><br/>
        <span class="tooltip-series-name">Зөрүү:</span> ${numberWithCommas((arg.point.data[`${selectedChooserCode}`] - arg.value))}<br/>
        <span class="tooltip-series-name">Хувь: </span> ${(arg.percent * 100).toFixed(2)}% 
        `,
            }
        }
    }

    const customizeValueAxisLabel = (e) => {
        return `${e.value}`
    }


    if (props.chartData.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    family: "Segoe UI",
                }}
            >
               <div>Хоосон</div>
            </div>
        )
    }

    const handleLegend = (e) => {
        if (e.target.isVisible()) {
            e.target.hide();
        } else {
            e.target.show();
        }
    }

    function markerTemplate(item) {
        const color = item.series.isVisible() ? item.marker.fill : '#888';
        return (
            <svg>
                <rect x={0} y={0} width={12} height={12} fill={color}
                      rx={item.text.includes('өөрчлөлт') ? 6 : 0}
                      ry={item.text.includes('өөрчлөлт') ? 6 : 0}></rect>
            </svg>
        );
    }


    function customizeColor(items) {
        if (items.seriesName === 'Гүйцэтгэл') {
            return { color: blueColorGradient[items.index] }
        } else {
            return { color: redColorGradient[items.index] }
        }
    }
    /*const DropDownItem = useCallback((e) => {
        // console.log('test',e)
        return (
            // <div style={{paddingRight:'1em', paddingLeft:'1em', width:'150%'}}>{e.data.format}</div>
            <div>{e.data.format}</div>
        )
    }, [])
    const downloadChart = useCallback((format) => {
        chartRef.current.instance.exportTo('file', format.toLowerCase())
    }, [chartRef.current])
    const DownloadChartButton = useCallback(() => {
        return (
            <DropDownButton
                icon="download"
                items={[
                    {
                        format: 'PDF'
                    },
                    {
                        format: 'PNG'
                    },
                    {
                        format: 'SVG'
                    },
                    {
                        format: 'JPEG'
                    }
                ]}
                onItemClick={(e) => {
                    // console.log('clicked item: ',e)
                    downloadChart(e.itemData.format)

                }}
                displayExpr="format"
                itemComponent={DropDownItem}
                width={'5em'}
                style={{ paddingLeft: '1em', paddingRight: '1em', paddingTop: '0.5em' }}
                showArrowIcon={false}
            >

            </DropDownButton>
        )
    }, [DropDownItem])*/

    return (
        <div id="load11">
         {/*   <LoadPanelComponent position={{ of: "#load11" }} visible={loader} />*/}
            <Toolbar style={{ marginBottom: '10px' }}>
                <Item location={'after'}>
                    {
                        chooserData && chooserData.length !== 0 &&
                        <SelectBox items={chooserData}
                                   width={600}
                                   label={'Үзүүлэлт сонгох'}
                                   displayExpr="name"
                                   onValueChanged={(e) => { setSelectedChooserCode(e.value.code); setSelectedChooserName(e.value.name); setSelectedChooserTarget(e.value.target); }}
                                   placeholder="сонгох"
                        />
                    }
                </Item>
             {/*   <Item
                    location={'after'}
                    render={DownloadChartButton}
                />*/}
            </Toolbar>
            { <Chart
                dataSource={props.chartData}
                ref={chartRef}
                onLegendClick={handleLegend}
                customizePoint={customizeColor}
            >
                <LoadingIndicator enabled={true} />
                <Crosshair enabled={true} label={true} />
                <ValueAxis valueType="numeric" allowDecimals={false}>
                    <Label format='#' customizeText={customizeValueAxisLabel} />
                </ValueAxis>
                <ScrollBar visible={true} width={5} opacity={0.5} />
                <ZoomAndPan argumentAxis="both" />
                <CommonSeriesSettings
                    argumentField="ognoo">
                    <Label visible={false} />
                </CommonSeriesSettings>
                <Series stack={selectedChooserCode} type="stackedbar" valueField={selectedChooserCode} name="Төлөвлөгөө" color="#F93A3A" border={{ color: 'white', width: 1, visible: true }} />
                <Series valueField={selectedChooserCode} name="Төлөвлөгөөний өөрчлөлт" color="#e12c31" type="spline" dashStyle="solid" visible={true}>
                    <Point size={10} />
                </Series>
                <Series type="bar" barPadding={0.5} valueField={selectedChooserTarget} name="Гүйцэтгэл" cornerRadius={6} color='#003696' />
                <Series valueField={selectedChooserTarget} name="Гүйцэтгэлийн өөрчлөлт" color="#003696" type="spline" dashStyle="solid">
                    <Point size={10} />
                </Series>
                <Legend
                    visible={true}
                    verticalAlignment="bottom"
                    horizontalAlignment="center"
                    font={{ family: "Segoe UI" }}
                    markerRender={markerTemplate}
                />
                <Title text={selectedChooserName}/>
                <Tooltip
                    zIndex={100000}
                    enabled={true}
                    customizeTooltip={customizeTooltip}
                    location="edge"
                    font={{ color: '#fff' }} color="#555"
                    cornerRadius={6}
                    border={{ visible: false }}
                />
            </Chart>}
        </div>
    )
}

export default TechnologyPerformanceBarChart
