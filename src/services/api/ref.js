import request from '../../shared/lib/request'

function getAllLogs() {
    return request({
        url: '/ref/getAllLogs',
        method: 'GET'
    })
}

function getRefDepartment(){
    return request({
        url:'/ref/getRefDepartment',
        method:'GET'
    })
}

const addRefDepartment = (body) => {
    return request({
        url: '/ref/addRefDepartment',
        method: 'POST',
        data: body,
    })
}
const editRefDepartment = (body) => {
    return request({
        url: `/ref/editRefDepartment`,
        method: 'POST',
        data: body,
    })
}
const removeRefDepartment = (id) => {
    return request({
        url: '/ref/removeRefDepartment/'+id,
        method: 'POST'
    })
}

function getRefMeasure(){
    return request({
        url:'/ref/getRefMeasure',
        method:'GET'
    })
}

const addRefMeasure = (body) => {
    return request({
        url: '/ref/addRefMeasure',
        method: 'POST',
        data: body,
    })
}
const editRefMeasure = (body) => {
    return request({
        url: `/ref/editRefMeasure`,
        method: 'POST',
        data: body,
    })
}
const removeRefMeasure = (id) => {
    return request({
        url: '/ref/removeRefMeasure/'+id,
        method: 'POST'
    })
}

function getRefChemicalName(){
    return request({
        url:'/ref/getRefChemicalName',
        method:'GET'
    })
}

const addRefChemicalName = (body) => {
    return request({
        url: '/ref/addRefChemicalName',
        method: 'POST',
        data: body,
    })
}
const editRefChemicalName = (body) => {
    return request({
        url: `/ref/editRefChemicalName`,
        method: 'POST',
        data: body,
    })
}
const removeRefChemicalName = (id) => {
    return request({
        url: '/ref/removeRefChemicalName/'+id,
        method: 'POST'
    })
}

function getRefStatus(){
    return request({
        url:'/ref/getRefStatus',
        method:'GET'
    })
}

function getActionStatus(){
    return request({
        url:'/ref/getActionStatus',
        method:'GET'
    })
}

function getRole(){
    return request({
        url:'/ref/getRole',
        method:'GET'
    })
}

const updateRoleMenu = (newFileInfo) => {
    return request({
        url: '/ref/updateRoleMenu',
        data: {...newFileInfo},
        method: 'PUT'
    })
}

const getRoleMenu = (body) => {
    return request({
        url: '/ref/getRoleMenu',
        method: 'GET',
        data: body,
    })
}

const getMenu = (body) => {
    return request({
        url: '/ref/getMenu',
        method: 'GET',
        data: body,
    })
}

const editRole = (body) => {
    return request({
        url: `/ref/editRole`,
        method: 'POST',
        data: body,
    })
}
const addRole = (body) => {
    return request({
        url: `/ref/addRole`,
        method: 'POST',
        data: body,
    })
}
const getRejectedTypes = () => {
    return request({
        url:'/ref/getRejectedTypes',
        method:'GET'
    })
}
const getBathStatus = () => {
    return request({
        url:'/ref/getBathStatus',
        method:'GET'
    })
}
const getHangerStatus = () => {
    return request({
        url:'/ref/getHangerStatus',
        method:'GET'
    })
}
const getOperationConfigStatus = () => {
    return request({
        url:'/ref/getOperationConfigStatus',
        method:'GET'
    })
}
const getBaths = () => {
    return request({
        url:'/ref/getBaths',
        method:'GET'
    })
}
function getRefPosition(){
    return request({
        url:'/ref/getRefPosition',
        method:'GET'
    })
}

const addRefPosition = (body) => {
    return request({
        url: '/ref/addRefPosition',
        method: 'POST',
        data: body,
    })
}
const editRefPosition = (body) => {
    return request({
        url: `/ref/editRefPosition`,
        method: 'POST',
        data: body,
    })
}
const removeRefPosition = (id) => {
    return request({
        url: '/ref/removeRefPosition/'+id,
        method: 'POST'
    })
}
function getWorkerStatus(){
    return request({
        url:'/ref/getWorkerStatus',
        method:'GET'
    })
}

const RefService = {
    getMenu,
    getRoleMenu,
    updateRoleMenu,
    getRefStatus,
    getRefDepartment,
    addRefDepartment,
    editRefDepartment,
    removeRefDepartment,
    getAllLogs,
    getRefMeasure,
    addRefMeasure,
    editRefMeasure,
    removeRefMeasure,
    getActionStatus,
    addRefChemicalName,
    editRefChemicalName,
    removeRefChemicalName,
    getRole,
    editRole,
    addRole,
    getRejectedTypes,
    getBathStatus,
    getHangerStatus,
    getOperationConfigStatus,
    getBaths,
    getRefPosition,
    addRefPosition,
    editRefPosition,
    removeRefPosition,
    getWorkerStatus,



}

export default RefService;