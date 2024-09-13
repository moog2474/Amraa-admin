import request from '../../shared/lib/request'

function getTechnologyPlanByDate(date){
    return request({
        url:`/technology/getTechnologyPlanByDate?startDate=${date}`,
        method:'GET'
    })
}

function getTechnologyPlan(startDate,endDate){
    return request({
        url:`/technology/getTechnologyPlan?startDate=${startDate}&endDate=${endDate}`,
        method:'GET'
    })
}

const addTechnologyPlan = (body) => {
    return request({
        url: '/technology/addTechnologyPlan',
        method: 'POST',
        data: body,
    })
}
const editTechnologyPlan = (body) => {
    return request({
        url: `/technology/editTechnologyPlan`,
        method: 'POST',
        data: body,
    })
}
const removeTechnologyPlan = (id) => {
    return request({
        url: '/technology/removeTechnologyPlan/'+id,
        method: 'POST'
    })
}

function getTechnologyPerformanceByPlan(startDate,endDate){
    return request({
        url:`/technology/getTechnologyPerformanceByPlan?startDate=${startDate}&endDate=${endDate}`,
        method:'GET'
    })
}

function getTechnologyPerformance(){
    return request({
        url:'/technology/getTechnologyPerformance',
        method:'GET'
    })
}

const addTechnologyPerformance = (body) => {
    return request({
        url: '/technology/addTechnologyPerformance',
        method: 'POST',
        data: body,
    })
}
const editTechnologyPerformance = (body) => {
    return request({
        url: `/technology/editTechnologyPerformance`,
        method: 'POST',
        data: body,
    })
}
const removeTechnologyPerformance = (id) => {
    return request({
        url: '/technology/removeTechnologyPerformance/'+id,
        method: 'POST'
    })
}
const setExcelTechnologyPlan = (body) => {
    return request({
        url: '/technology/setExcelTechnologyPlan',
        method: 'POST',
        data: body,
    })
}

const TechnologyService = {
    getTechnologyPlanByDate,
    setExcelTechnologyPlan,
    getTechnologyPlan,
    addTechnologyPlan,
    editTechnologyPlan,
    removeTechnologyPlan,
    getTechnologyPerformance,
    addTechnologyPerformance,
    editTechnologyPerformance,
    removeTechnologyPerformance,
    getTechnologyPerformanceByPlan,
}

export default TechnologyService;