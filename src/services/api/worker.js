import request from '../../shared/lib/request'

function getWorker(){
    return request({
        url:'/worker/getWorker',
        method:'GET'
    })
}

const addWorker = (body) => {
    return request({
        url: '/worker/addWorker',
        method: 'POST',
        data: body,
    })
}
const editWorker = (body) => {
    return request({
        url: `/worker/editWorker`,
        method: 'POST',
        data: body,
    })
}
const removeWorker = (id) => {
    return request({
        url: '/worker/removeWorker/'+id,
        method: 'POST'
    })
}

const WorkerService = {
    getWorker,
    addWorker,
    editWorker,
    removeWorker,
}

export default WorkerService;