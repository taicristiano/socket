var axios = require('axios');

var callApi = (method, url, data = {}, headers = {}) => {
    return axios({
        method: method,
        url: url,
        data: data,
        headers: headers
    })
    .then((response) => response)
}

module.exports = callApi;