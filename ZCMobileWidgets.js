/* $Id$ */
/**
 * This file is the bridge between WEB Framework and Native Mobile WebViews.
 * 
 * @author arun-5656
 */

 var zAppsHost   = zappsHostDomain;//"localzappscontents.com";
 var zAppsPort   = zappsHostPort;//"";
 var device      = "2";
 
 
 var promiseId = 100;
 var funcStack = [];
 var fileStack = [];
 var mobileScheme = 'zcprotocol://';
 var Console = window.console;
 
 function getFileFromRequest(promiseId) {
     return fileStack[promiseId];
 }
 
 /*
   Function to handle decoding of 16 bit unicode chars encoded with native UTF-8 Encoder
 */
 function decodeUnicode(str) {
   return decodeURIComponent(atob(str).split('').map(function (c) {
     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
   }).join(''));
 }
 
 function responseForRequest(promiseId, responseString, errordesc) {
     responseString = decodeUnicode(responseString);
     Console.log(`promiseId : ${promiseId} :::  responseString : ${responseString}`);
     responseString = JSON.parse(responseString);
     if(errordesc) {
         errordesc = decodeUnicode(errordesc);
         Console.log(`promiseId : ${promiseId} :::  errordesc : ${errordesc}`);
         errordesc = JSON.parse(errordesc);
     }
     funcStack[promiseId](responseString, errordesc);
 }
 
 function responseForDownloadRequest(promiseId, responseString, errordesc) {
     if(errordesc) {
         errordesc = decodeUnicode(errordesc);
         Console.log(`${promiseId} :: ${errordesc}`);
         errordesc = JSON.parse(errordesc);
     }
     Console.log(`promiseId : ${promiseId} ::: responseString : ${responseString}`);
     funcStack[promiseId](responseString, errordesc);
 }
 
 function responseForCurrentLocationRequest(promiseId, latitude, longtitude) {
     alert("hello");
     console.log(latitude, longtitude)
 }
 
 /*
   Function to handle encoding of 16 bit unicode chars
 */
 function encodeUnicode(str)
 {
    utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
         return String.fromCharCode('0x' + p1);
     });
     return btoa(utf8Bytes);
 }
 
 var ZCMobileSDK = function(dataObj) {
     return new Promise(function (resolve, reject) {
         var _self           = this;
         _self.resolve       = resolve;
         _self.reject        = reject;
 
         var data            = dataObj.data;
         var inputData       = "";
         
         /**
             var i               = 0;
             $.each(data, function(key,value){
                 if(i < (Object.keys(data).length - 1)) {
                    inputData = inputData + key + "=" + value + "&";
                 } else {
                     inputData = inputData + key + "=" + value;
                 }
                 i++;
             });
         */
         
         /*
         var headers = "";
         for(var key in dataObj.header) {
             if (dataObj.header.hasOwnProperty(key)) {
                 let keyString = key;
                 let valueString = _self.header[key];
                 
                 headers =    headers + keyString + "--ZCHeaderPieceSeparator--" + valueString + "--ZCHeaderSeparator--";
             }
         }
         */
         
         //TODO:
         //dataObj.operation - discussion
         //dataObj.url
         var dataString  = `${mobileScheme}--ZCSeparator--${promiseId}--ZCSeparator--${dataObj.operationType}--ZCSeparator--${dataObj.url}--ZCSeparator--${dataObj.httpMethod}`;
         //dataString 		+= /*(headers) ? "--ZCSeparator--" + btoa(headers) :*/ "--ZCSeparator--";
         if(dataObj.operationType == "upload" && data) {
             if(data.file) {
                 dataString += `--ZCSeparator--${encodeUnicode(data.fileName)}`;
                 fileStack[promiseId] = data.file;
             } else {
                 fileStack[promiseId] = "";
             }
         } else {
             dataString += (data) ? `--ZCSeparator--${encodeUnicode(data)}` : `--ZCSeparator--`;
         }
         
         window.location     = dataString;
         Console.log(dataString);
 
         funcStack[promiseId] = function(responseString, errordesc) {
             if(errordesc) {
                 _self.reject(errordesc);
             } else {
                 _self.resolve(responseString);
             }
         }
         promiseId++;
     });
 }
 
