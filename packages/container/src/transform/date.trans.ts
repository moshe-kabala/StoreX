import {CustomDate} from "../format";

const cusDate = new CustomDate();

export function dateTransform(data) {
    return cusDate.update(data).asView();
}

export function exactDateTransform(data) {
    return cusDate.update(data).asSeconds();
}
