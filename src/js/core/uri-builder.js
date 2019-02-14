import CommonUtils from "../utils/common";

class UriBuilder {

    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    build (url, params) {
        // console.log(params);
        let urlPart = CommonUtils.tinyparser(url, params);
        let uri = this.apiEndpoint+urlPart;
        // console.log(uri);
        return this.apiEndpoint+urlPart;
    }
}

export default UriBuilder;