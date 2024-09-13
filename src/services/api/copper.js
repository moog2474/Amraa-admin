import request from '../../shared/lib/request'

const getCopperProduct = (startDate,endDate)=>{
    return request({
        url:`/copper/getCopperProduct?startDate=${startDate}&endDate=${endDate}`,
        method:'GET'
    })
}

const getCopperProductByDateMax = (date)=>{
    return request({
        url:`/copper/getCopperProductByDateMax?date=${date}`,
        method:'GET'
    })
}

const addCopperProduct = (body) => {
    return request({
        url: '/copper/addCopperProduct',
        method: 'POST',
        data: body,
    })
}

const copperRegistration = (body) => {
    return request({
        url: '/copper/copperRegistration',
        method: 'POST',
        data: body,
    })
}

const editCopperProduct = (body) => {
    return request({
        url: `/copper/editCopperProduct`,
        method: 'POST',
        data: body,
    })
}
const removeCopperProduct = (id) => {
    return request({
        url: '/copper/removeCopperProduct/'+id,
        method: 'POST'
    })
}
const changeStatus = (body) => {
    return request({
        url: `/copper/changeStatus`,
        method: 'POST',
        data: body
    })
}
const getCopperProductTransferLogs = (pId)=>{
    return request({
        url:`/copper/getCopperProductTransferLogs?pId=${pId}`,
        method:'GET'
    })
}
const editCopperRegistration = (body) => {
    return request({
        url: `/copper/editCopperRegistration`,
        method: 'POST',
        data: body,
    })
}
const removeCopperRegistration = (id) => {
    return request({
        url: '/copper/removeCopperRegistration/'+id,
        method: 'POST'
    })
}

const getCopperBathRegByDate = (date,shift)=>{
    return request({
        url:`/copper/getCopperBathRegByDate?date=${date}&shift=${shift}`,
        method:'GET'
    })
}

const mergeCopperRegistration = (body) => {
    return request({
        url: `/copper/mergeCopperRegistration`,
        method: 'POST',
        data: body,
    })
}

const getCopperRegDetail = (date,shift)=>{
    return request({
        url:`/copper/getCopperRegDetail?date=${date}&shift=${shift}`,
        method:'GET'
    })
}

const mergeBundleRegistration = (body) => {
    return request({
        url: `/copper/mergeBundleRegistration`,
        method: 'POST',
        data: body,
    })
}

const changeRequestStatus = (body)=>{
    return request({
        url:`/copper/changeRequestStatus`,
        method:'POST',
        data: body,
    })
}
const changeCurrentBundle = (body)=>{
    return request({
        url:`/copper/changeCurrentBundle`,
        method:'POST',
        data: body,
    })
}
const getSentDate = (date ,shift) => {
    return request({
        url: `/copper/getSentTime?date=${date}&shift=${shift}`,
        method: 'GET'
    })
}

const getProdChartData = (shift, year, month) => {
    return request({
        url: `/copper/getProductionChartData/${shift}/${year}/${month}`,
        method: 'GET'
    })
}
const CopperService = {
    getCopperProduct,
    addCopperProduct,
    copperRegistration,
    editCopperProduct,
    removeCopperProduct,
    getCopperProductByDateMax,
    changeStatus,
    getCopperProductTransferLogs,
    editCopperRegistration,
    removeCopperRegistration,
    getCopperBathRegByDate,
    mergeCopperRegistration,
    getCopperRegDetail,
    mergeBundleRegistration,
    changeRequestStatus,
    changeCurrentBundle,
    getSentDate,
    getProdChartData
}

export default CopperService;