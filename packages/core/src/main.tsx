import {DepIns, des1, des2} from "./core/sub-ins"


const dep1 = new DepIns();

des1.dispatch();

des1.dispatch();

des1.dispatch();



console.log(dep1.count1)