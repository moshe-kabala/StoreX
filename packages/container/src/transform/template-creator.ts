import {TimeSpen} from '../format'

const timeSpen = new TimeSpen();

const enumValSymbol = "{}";

class TemplateCreator{
    typesMetadata
    templates
    constructor(typesMetadata, templates){
        this.typesMetadata = typesMetadata;
        this.templates = templates;
    }

    create(obj,templateName){
        var _this = this;
        var self:any = {};

        // properties
        self.tempSetting = createTempSetting(templateName); // create templateSetting
        self.temp = [] // store all here

        // methods
       
        renderObj(obj);
       
        return self.temp;    
       
       
        /////////////


        function createTempSetting(templateName){
            templateName = templateName || 'default';
            // todo: improve the marge (types,enums)
            return _this.mergeTempToDefault(templateName);
        }

        function renderObj(obj){
            var type = obj.type
            if (!type)
                return -1;
            var objTemp = getObjTemplate(obj);
            var objMeta = getObjMeta(obj)
            var strObjTemp = getTempString(objTemp);
            var strDiv = _this.divideTem(strObjTemp);
            if(!strDiv){
                console.log("================================================================");                
                console.log("this obj dont match:");
                console.log(obj);
                console.log("the str template is:");
                console.log(strObjTemp);
                console.log("the type is:");
                console.log(type);
                console.log("================================================================");                
                return;                  
            }

            for(var i = 0;i < strDiv.length;i++){
                var str = strDiv[i];
                if(str[0] == '#'){
                    var key = str.slice(1, str.length);
                    if(generateVal(key, obj) == -1){
                       removeSpaceFromNext(strDiv , i)
                    }
                }
                else{
                    pushToTemp({text:str});
                }
            }
        }

        function removeSpaceFromNext(strDiv, i){
             // check if next item exist
             if(i + 1 < strDiv.length){
                var strLen = strDiv[i + 1].length
                if(strDiv[i + 1] = ' '){
                    // if only one digit remove the item
                    if(strLen == 1){
                        strDiv.splice( i+1, 1);
                    }
                    else{
                        // remove the space digit
                        strDiv[i + 1] = strDiv.slice(1, strLen);
                    }

                }
             }
        }
        
        function getParamByPath(path, obj){
            var arrayPath = path.split('.');
            var type = obj.type;
            var key = arrayPath[0];
            var obj = obj;

            for(var i = 1; i < arrayPath.length;i++){
                if(!obj.hasOwnProperty(key))
                    return -1 // ("the path: "+path+"  is not correct on the obj.type:" +type);
                obj = obj[key];
                key = arrayPath[i];
            }
            return {
                obj: obj,
                key: key
            }
        }
        // get $var from $var.var2 or $var.
        function getLocalVarName(str){
            var index = str.indexOf('.');
            if(index > -1)
                return str.slice(0,index);
            return str;
        }

        function renderEnum(enumName, obj,key){
            
            var enumValue = obj[key];
            var enumTemp = getEnumTemp(enumName);
            var fieldMeta = getObjMeta(obj)[key];
            var objTemp = getObjTemplate(obj)
            var val = fieldMeta.enum[enumValue];

            // if not exist template for this enum
            if(!enumTemp){ // todo: maybe set style for this field on its obj
                pushToTemp({text:val, type:"string"});
                return;
            }
            
            
            // get the meta for generale enum
            var enumGeneralTempMeta =  getGeneralMetaEnumTemp(enumName);
            // if not specified temp for this filed on the enum Temp
            if(!enumTemp[enumValue]){
                var style = getFieldStyleFromMeta(enumGeneralTempMeta,enumValSymbol)
                style = mergeObj({text:val, type:"string"},style);
                pushToTemp(style);
                return;
            }
            // if temp exist for this enum
            var fieldEnumTemp = enumTemp[enumValue]
            var strTemp = getTempString(fieldEnumTemp);
            // todo check if setup style for enum temp
            var strDiv = _this.divideTem(strTemp);
            var enumTempMeta = getMetaEnumTemp(enumName, enumValue);
            for(var i = 0;i < strDiv.length;i++){
                var str = strDiv[i];
                if(str == '#' + enumValSymbol){
                   var _key = str.slice(1,str.length);
                   var style1 = getFieldStyleFromMeta(enumGeneralTempMeta, _key)
                   var style2 = getFieldStyleFromMeta(enumTempMeta, objKey);
                   var style = mergeObj(style1, style2);
                   pushToTemp(mergeObj({text:val,type:"string"},style));
                }
                else if(str[0] == '#'){
                   var objKey = str.slice(1, str.length);
                   var localObj = obj;
                   var style1 = getFieldStyleFromMeta(enumGeneralTempMeta, objKey);
                   var style2 = getFieldStyleFromMeta(enumTempMeta, objKey);
                   var style = mergeObj(style1, style2);
                   
                   // if contain local var
                   if(objKey[0] == '$'){
                       var localVarName = getLocalVarName(objKey);
                       var varName= FromLocalNameToName(localVarName, objTemp, obj);
                       objKey = objKey.replace(localVarName, varName);
                   } 
                   if(objKey.indexOf('.') > -1){
                       var param:any = getParamByPath(objKey, obj);
                       objKey = param.key;
                       localObj = param.obj;
                   }
                   if(generateVal(objKey, localObj, style) == -1){
                       removeSpaceFromNext(strDiv , i)
                   }
                }
                else{
                    pushToTemp({text:str});
                }
            }
        }

        function FromLocalNameToName(local,temp, obj){
            
            if(!temp || !temp.locals || !temp.locals.hasOwnProperty(local)){ // if not define local var search on the obj;
               var key = local.slice(1, local.length);
               if(!obj || !obj.hasOwnProperty(key))
                    return -1;
               return key;
            }
            return temp.locals[local];
        }

        function getFieldStyleFromEnumTemp(enumTemp, field){
            var meta = enumTemp.meta
            if(!meta)
                return; // meta not exist 

            return getFieldStyleFromMeta(meta,field)
        }
        
        function getFieldStyleFromMeta(meta, field){
            if(!meta)
                return;
            // todo check if function
            return meta[field];
        }

        function generateVal(key, obj, style?){
            // if not exist
            if(!obj || !obj.hasOwnProperty(key)){
                return -1;
            }
            var temp = getObjTemplate(obj)
            if(!temp || temp == -1 || typeof(temp) == 'string' || !temp.meta || !temp.meta[key]){
                return takeProperty(key, obj, style);
            }
            // if exist setting for this field in the class
            var fieldStyle = getFieldStyleFromMeta(temp.meta, key);
            
            if(fieldStyle && fieldStyle.text){ // if already setup text
                pushToTemp(fieldStyle);
            }
            else{
                if(style) // if style exist merge to the tempMeta
                    fieldStyle = mergeObj(fieldStyle, style);
                return takeProperty(key, obj, fieldStyle);
            }
            
        }        
        
        function getFieldMeta(obj,key){
           var objMeta =  getObjMeta(obj)
           if(objMeta && objMeta.hasOwnProperty(key))
             return objMeta[key];
             return creatDefaultFieldMeta(obj,key);
        }

        function creatDefaultFieldMeta(obj,key){
            var type:string = typeof(obj[key]);
            switch(type){
                case "string":
                case "number":
                    type = "string";
                break;
                case "object":
                    type = "obj";
                break;

            }
            return {type:type};
        }

        function takeProperty(key, obj,style){
            var val = obj[key];
            if (!val){ //
                return -1; 
            }
            var type;
            var fieldMeta = getFieldMeta(obj,key);
            if(style && style.type)
                type = style.type
            else {
                type = fieldMeta.type;
            }
           
            switch(type){
                case 'timeSpen':
                    val = timeSpen.update(val).asView();
                case 'number':
                    if(type == "number")
                    val = val.toString();
                case 'string':
                case 'text':
                case 'date':
                
                    style = mergeObj({style:"emphasis"},style); // default property style.
                    style.text = val
                    style.type = type;
                    pushToTemp(style);
                    return;
                case 'obj':
                    renderObj(val);
                    return;
                case 'enum':
                    renderEnum(fieldMeta.name,obj,key);
                    return;
                default:
                    throw new TypeError('type: '+type+' not recognized')
            }
        }

        function pushToTemp(args){
            // console.log(args);
            self.temp.push(args);
        }
        
        function getTempString(objTemp){
            if(!objTemp)
                return;
            if(typeof(objTemp) == 'string'){
                return objTemp;
            }
            return objTemp.temp
        }
        
        function getObjTemplate(obj){
            if(!obj)
                return;
            var type = obj.type;
            if(!type || !self.tempSetting.types[type])
                return -1;
            return self.tempSetting.types[type];
        } 

        function getEnumTemp(enumName){
            var temp = self.tempSetting.enums[enumName];
            if(temp && temp.enumTemp)
                return temp.enumTemp;
            // if (!temp)
            //     throw new Error("enumName: "+ enumName +" not exist in the templateSetting");
            return temp;
        }

        function getGeneralMetaEnumTemp(enumName){
            var temp = self.tempSetting.enums[enumName];
            if(temp)
                return temp.meta;
        }

        function getMetaEnumTemp(enumName, enumOptionName){
            var enumTemp = getEnumTemp(enumName);
            if(enumTemp && enumTemp[enumOptionName])
                return enumTemp[enumOptionName].meta
        }

        function getObjMeta(obj){
            var type = obj.type;
            if(!type)
                return;
            if(_this.typesMetadata[type] && _this.typesMetadata[type].metadata)
                return _this.typesMetadata[type].metadata;
            return _this.typesMetadata[type]
        } 
    }

    divideTem(tempStr){
        if(!tempStr)
            return;
        var div = [];
        var str = tempStr;
        do{
            // if first not #
            if(str[0] != '#'){
                var index = str.indexOf('#');
                // if not found
                if (index == -1){
                    div.push(str)
                    return div;
                }
                div.push(str.slice(0,index));
                str = str.slice(index,str.length);
            }
            index = str.indexOf(' ');
            if (index == -1){
                div.push(str)
                return div;
            }
            div.push(str.slice(0,index));
            str = str.slice(index,str.length);
        }while(str.length > 0)
        return div;
    }

    mergeTempToDefault(templateName){
       var defTemp = this.templates['default'];
       if(templateName == 'default')
            return defTemp;
        if(!this.templates.hasOwnProperty(templateName))
            throw new TypeError("templateName: "+templateName+" not exist go to template.js and setup it")
        
        var temp = this.templates[templateName];
        return  mergeObj (defTemp, temp);
    }
}

module.exports = TemplateCreator

//////////////

// override first.x by second.x
function mergeObj(first, second){
    first = first || {};
    second = second || {};
    var copyOne = clone(first);
    var copyTwo = clone(second);

    var keys = Object.keys(copyTwo);
    
    for(var i = 0; i <  keys.length; i++ ){
        var key = keys[i];
        copyOne[key] = copyTwo[key];
    }
    return copyOne;
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// todo:
function getIndex(array, func){
     for(var index = 0; index < array.length; index++) {
        var item = array[index]; 
        if (func(item))
        return index;
    }
    return -1;
}
