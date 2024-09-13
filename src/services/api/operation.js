import request from '../../shared/lib/request'

const getBathsByWeek = (year, weekNo) => {
    return request({
        url: `/op/getBathsByWeek?year=${year}&weekNo=${weekNo}`,
        method: 'GET'
    })
}

const changeShiftDayByWeek = (body, year, weekNo) => {
    return request({
        url: `/op/changeShiftDayByWeek?year=${year}`,
        method: 'POST',
        data: body,
    })
}

const getDetailsPerBath = (year, weekNo, bathNo) => {
    return request({
        url: `/op/getDetailsPerBath?year=${year}&weekNo=${weekNo}&bathNo=${bathNo}`,
        method: 'GET'
    })
}

const changeBathDetails = (body, year, weekNo, bathNo) => {
    return request({
        url: `/op/changeBathDetails?year=${year}&weekNo=${weekNo}&bathNo=${bathNo}`,
        method: 'POST',
        data: body,
    })
}

const OperationService = {
    getBathsByWeek,
    changeShiftDayByWeek,
    getDetailsPerBath,
    changeBathDetails,
}

export default OperationService;