import Uri from "./uri-builder";
import ajax from "./ajax";
import Logger from "./logger";

class Tracker {

    constructor(widget) {
        let uriBuilder = new Uri (widget.config('feed.apiEndpoint'));
        this.urlFeedTack = uriBuilder.build('/restricted/feeds/{{feedId}}/track',{feedId:widget.config('feed.id')});
    }

    track (a) {
        ajax.get (
            this.urlFeedTack,
            {a:a},
            (data) => {
                Logger.log('Tracker->track success');
                Logger.log(data);
            },
            (jqXHR, textStatus, errorThrown) => {
                Logger.log('Tracker->track fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);
            }
        );
    }
}

export default Tracker;