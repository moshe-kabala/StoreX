import * as React from "react";

const c = <></>
const Com = () => {
    return <div/>
}

const comIns = <Com />
const fun = () => {};
function func1 (){

}
console.log("c", c instanceof React.Component);
console.log("c", c instanceof Function);
console.log("com", Com instanceof Function);

console.log("comIns", comIns instanceof Function);

console.log("fun", fun instanceof Function);
console.log("func1", func1 instanceof Function);



