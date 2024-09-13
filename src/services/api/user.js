import request from '../../shared/lib/request'

function getUser(){
    return request({
        url:'/user/getUser',
        method:'GET'
    })
}

const changeUserInfo = (body) => {
    return request({
        url: '/user/changeUserInfo',
        method: 'POST',
        data: body,
    })
}

const UserService = {
    getUser,
    changeUserInfo,

}

export default UserService;