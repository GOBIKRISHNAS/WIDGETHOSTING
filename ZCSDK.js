/* $Id$ */
var ZCSDK = new function() {
    var isInitTriggered = false;
    var appSDK;//ZSDK.Init();
    var initPromise = undefined;
    var sdkBundle = {};

    this._init = function() {
        if(!isInitTriggered) {
            isInitTriggered = true;
            appSDK = new ZSDK();
            sdkBundle.appSDK = appSDK;
            var promiseResolve;
            initPromise = new Promise(function(resolve, reject) {
                promiseResolve = resolve;
            });
            appSDK.OnLoad(function() {
            	var initParamsPromise = appSDK.getContext().Event.Trigger('GET_INIT_PARAMS', true, true);
            	initParamsPromise.then(function(initParamsResponse) {
            		sdkBundle.initParams = initParamsResponse;
	            	var queryParamsPromise = appSDK.getContext().Event.Trigger('GET_QUERY_PARAMS', true, true);
	            	queryParamsPromise.then(function(queryParamsResponse) {
	            		sdkBundle.queryParams = queryParamsResponse;
	                    promiseResolve();
	            	});
            	});
            });
        }
        return initPromise;
    }
    this._getInitParams = function() {
    	return sdkBundle.initParams;
    }
    this._getQueryParams = function() {
    	return sdkBundle.queryParams;
    }
    this._getApi = function() {
        return {
            API     		: (
		                        function() {
		                            return {
		                                RECORDS : new Records(sdkBundle)
		                            }
		                        }
		                    )(this),
		    UTIL			: new Util(sdkBundle)
        }
    }
}
var ZOHO = new function() {
	var isInitTriggered = false;
    var appSDK = new ZSDK.Init();
    var initPromise = undefined;
	var retInitPromise = undefined;
    var initSuccess = false;
    var sdkBundle = {};

	var promiseResolve;
	initPromise = new Promise(function(resolve, reject) {
		promiseResolve = resolve;
	});
	appSDK.on("Load", function() {
		initSuccess = true;
		promiseResolve();
	});
    
	var _init = function() {
		if(!isInitTriggered) {
			var retPromiseResolve;
			retInitPromise = new Promise(function(resolve, reject) {
				retPromiseResolve = resolve;
			});
			initPromise.then(function() {
				isInitTriggered = true;
				//appSDK = new ZSDK.Init();
				sdkBundle.appSDK = appSDK;
				//appSDK.on("Load", function() {
					var initParamsPromise = appSDK._sendEvent('GET_INIT_PARAMS', true, true);
					initParamsPromise.then(function(initParamsResponse) {
						sdkBundle.initParams = initParamsResponse;
						var queryParamsPromise = appSDK._sendEvent('GET_QUERY_PARAMS', true, true);
						queryParamsPromise.then(function(queryParamsResponse) {
							sdkBundle.queryParams = queryParamsResponse;
							retPromiseResolve();
						});
					});
				//});
			}).catch(function() {
				
			});
        }
        return retInitPromise;
    }
    
	return {
		CREATOR	: (function() {
	        return {
	            API     		: new Records(sdkBundle),
			    UTIL			: new Util(sdkBundle),
			    init			: _init
	        }
		})(this)
	}
}

function Records(sdkBundle){
    
    function fillConfig(config) {
    	if(!config.scope) {
    		config.scope = sdkBundle.initParams.scope;
    	}
    	if(!config.envUrlFragment) {
            config.envUrlFragment = sdkBundle.initParams.envUrlFragment.substr(1);
        }
    	if(!config.appName) {
    		config.appName = sdkBundle.initParams.appLinkName;
    	}
    }
    
    function isEmptyObj(obj) {
    	for (var val in obj) {
            return false;
    	}
        return true;
    }
    function isEmptyObject(obj, skipVals) {
    	var retVal = false;
    	for(var name in obj) {
    		var isSkip = (skipVals && skipVals.includes(name));
    		 if(!isSkip && isEmpty(obj[name])) {
    			retVal = true;
    		}
    	}
    	return retVal;
    }
    function isEmpty(checkVal) {
    	var retVal = false;
    	if(!checkVal || checkVal == null || checkVal === "" || 
    			(typeof(checkVal) == "string" && checkVal.trim().length == 0) ||
    			(typeof(checkVal) == "object" && isEmptyObj(checkVal))) {
    		retVal = true;
    	}
    	return retVal;
    }
    
    function getFileAsBase64File(file) {
    	return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function (error) {
                reject(error);
            };
        });
    }
    
    return {
        addRecord : function (config) {
        	if(isEmptyObject(config)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	fillConfig(config);
        	//scopeName: config.scope, envUrlFragment: config.envUrlFragment , appLinkName: config.appLinkName,
        	var input = {
        	        appLinkName		: config.appName,
        			formLinkName	: config.formName, 
        			body			: config.data
        		};
        	return sdkBundle.appSDK._sendEvent('ADD_RECORD', input, true);
        },
        updateRecord : function (config) {
        	if(isEmptyObject(config)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	var listOfRecords = config.id.toString().split(",");
        	fillConfig(config);
        	//scopeName: config.scope, envUrlFragment: config.envUrlFragment , appLinkName: config.appLinkName,
        	var input = {
        	        appLinkName		: config.appName,
        			viewLinkName	: config.reportName, 
        			body			: config.data, 
        			listOfRecords	: listOfRecords
        		};
        	return sdkBundle.appSDK._sendEvent('EDIT_RECORDS', input, true);
        },
        deleteRecord : function (config) {
        	if(isEmptyObject(config)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	fillConfig(config);
        	//scopeName: config.scope, envUrlFragment: config.envUrlFragment , appLinkName: config.appLinkName,
        	var input = {
        	        appLinkName		: config.appName,
        			viewLinkName	: config.reportName, 
        			criteria 		: config.criteria
        		};
        	return sdkBundle.appSDK._sendEvent('DELETE_RECORDS', input, true);
        },
        getRecordById : function (config) {
        	if(isEmptyObject(config)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	fillConfig(config);
        	//scopeName: config.scope, envUrlFragment: config.envUrlFragment , appLinkName: config.appLinkName,
        	var input = {
        	        appLinkName		: config.appName,
        			viewLinkName	: config.reportName, 
        			id				: config.id
        		};
        	return sdkBundle.appSDK._sendEvent('GET_RECORD', input, true);
        },
        getAllRecords : function (config) {
        	var skipVals = ["criteria", "page", "pageSize"];
        	if(isEmptyObject(config, skipVals)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	fillConfig(config);
        	//scopeName: config.scope, envUrlFragment: config.envUrlFragment , appLinkName: config.appLinkName,
        	//sortField : config.sortField, sortOrder : config.sortOrder,
        	var input = {
        	        appLinkName		: config.appName,
        			viewLinkName	: config.reportName, 
        			criteria		: config.criteria, 
        			page			: config.page, 
        			pageSize : config.pageSize
        		};
        	return sdkBundle.appSDK._sendEvent('GET_RECORDS', input, true);
        },
        uploadFile : function (config) {
        	var skipVals = ["file", "parentId"];
        	if(isEmptyObject(config, skipVals)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	fillConfig(config);
        	
        	if(!config.file) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	} else if(config.file.size && ((config.file.size / 1024 / 1024) > 50)) {
        		return new Promise((resolve, reject) => {
        			reject(`Improper Configuration..!!`);
        		});
        	}
        	
        	var uploadFilePromise = new Promise((upldFlePromResolve, upldFlePromReject) => {
	        	var base64FilePromise = getFileAsBase64File(config.file);
	        	var base64File = "";
	        	var fileName = config.file.name;
	        	base64FilePromise.then(function(base64FileData) {
	        		base64File = base64FileData;
		        	//scopeName: config.scope, appLinkName: config.appName,
		        	var input = {
		        	        appLinkName		: config.appName,
		        			viewLinkName	: config.reportName, 
		        			id				: config.id,
		        			fieldName		: config.fieldName,
		        			file			: base64File,
		        			fileName		: fileName
		        		};
		        	
		        	/**
		        	 * Commenting the code as the specification changed from 
		        	 * `JSON` format for SubForm to `DOT` notation. 
		        	if(config.subform) {
		        		if(isEmptyObject(config.subform)) {
		            		return new Promise((resolve, reject) => {
		            			reject(`Improper Configuration..!!`);
		            		});
		            	} else {
		            		input.subformName 	= config.subformName;
		            		input.parentId 		= config.parentId;
		            	}
		        	}
		        	*/
		        	
		        	if(config.parentId) {
		        		input.parentId = config.parentId;
		        	}
		        	
		        	var sdkEvent = sdkBundle.appSDK._sendEvent('UPLOAD_FILE', input, true);
		        	sdkEvent.then(function(response) {
		        		upldFlePromResolve(response);
		        	}).catch(function(error) {
		        		upldFlePromReject(error);
		        	});
	        	}).catch(function(error) {
	        		upldFlePromReject(error);
	        	});
        	});
        	return uploadFilePromise;
        },
		getCurrentLocation : function () {
			return sdkBundle.appSDK._sendEvent('GET_LOCATION', undefined, true);
		}
    }
}

function Util(sdkBundle){
    var _self = this;
    return {
        setImageData : function (imageTag, sourceURL, callback) {
	        var Console = window.console;
        	if(sourceURL.startsWith("/api/v2/")) {
        		var data = {};
        		data.src = sourceURL;
        		var imageDownloadPromise = sdkBundle.appSDK._sendEvent('IMAGE_LOAD', data, true);
        		imageDownloadPromise.then(function(imageSrc) {
        			imageTag.setAttribute('src', imageSrc);
        			
        			var returnResp = {};
                    returnResp.status = "200";
                    returnResp.statusText = "success";
            		callback(returnResp);
        		}).catch(function(returnResp){
        			if(callback) {
        				callback(returnResp);
        			} else {
            			var Console = window.console;
        				Console.log("Error: Unable to set image data");
        				Console.log(returnResp);
        			}
        		});
        	} else {
        		imageTag.setAttribute('src', sourceURL);
        	}
        },
	    getInitParams : function() {
	    	return sdkBundle.initParams;
	    },
	    getQueryParams : function() {
	    	return sdkBundle.queryParams;
	    }
    }
}
