/* $Id$ */
/**
 * This file is responsible for establishing handshake between Client SDK and Creator
 * 
 * @author arun-5656
 */

 $(document).ready(function() {
    var _BroadcastEvent = function (evt) {
        setTimeout(function () {
            evt.promise.resolve({
                name: 'SUCCESS'
            });
        }, 2000);
    };

    var httpScheme  = "ht" + "tps://";
    
    function zcWidgets(widget) {
        var _self = this;
		_self.widgetInstance = null;
		if(widget.uniqueID) {
			_self.frameIdentifier = widget.uniqueID;//no i18n
		} else {
			_self.frameIdentifier = `widget_${Date.now()}`;
		}
        var elemDiv = widget.target;
        var relatedListFrame = document.createElement("iframe");
        relatedListFrame = $(relatedListFrame);
        relatedListFrame.attr("id",frameIdentifier);//no i18n
        relatedListFrame.attr("frameborder","0");//no i18n
        relatedListFrame.attr("height","100%");//no i18n
        relatedListFrame.attr("width","100%");//no i18n
        relatedListFrame.addClass("widget_Frame widget_Frame_homePage widget_Frame_loading");
        relatedListFrame.attr("allow","geolocation; microphone; camera; midi; encrypted-media; clipboard-write");//no i18n
        elemDiv.html(relatedListFrame[0]); // NO OUTPUTENCODING
        if(widget.isExternalHost) {
			ZApp.LoadExtension({
				"hashkey"	: widget.uniqueID, 
				"id"		: widget.uniqueID, 
				"zappid"	: widget.uniqueID,
				"modules"	: { 
								"widgets"	: [{
									"location" 	: frameIdentifier,
									"url"		: widget.url
								}]
							}
			});
		} else {
			ZApp.LoadExtension({ 
				"locale"	: "en",
				"hashkey"	: widget.hash, 
				"id"		: widget.uniqueID, 
				"zappid"	: widget.extension_id,
				"version"	: widget.extension_version, 
				"modules"	: { 
								"widgets"	: [{
									"location" 	: frameIdentifier,
									"url"		: widget.url
								}]
							}
			});
		}
        _self._init = function() {
        	if(widget.isExternalHost) {
				_self.widgetInstance = ZApp.LoadWidget({
					"id"			: widget.uniqueID,
					"extension_id"	: widget.uniqueID,
					"zappid"		: widget.uniqueID,
					"location" 		: _self.frameIdentifier,
					"url"			: widget.url
				});
			} else {
				_self.widgetInstance = ZApp.LoadWidget({
					"id"			: widget.uniqueID,
					"extension_id"	: widget.uniqueID,
					"zappid"		: widget.extension_id,
					"version"		: widget.extension_version, 
					"location" 		: _self.frameIdentifier,
					"url"			: widget.url
				});
			}
        }
        return {
            init 			: _init,
			widgetInstance 	: widgetInstance
        }
    }

    $.fn.ZCWidgets = function(widget) {
        var _self = this;
        var slashSeparator = "/";

        var localConfig = widget;
        if(localConfig == undefined){
            localConfig = {};
        }
        if(localConfig.isExternalHost) {
            localConfig.uniqueID             = localConfig.uniqueID ? localConfig.uniqueID : "";
            localConfig.path                 = localConfig.path;
        } else {
            localConfig.uniqueID             = localConfig.uniqueID ? localConfig.uniqueID : "";
            localConfig.extension_id         = localConfig.extension_id ? localConfig.extension_id : "";
            localConfig.extension_version    = localConfig.extension_version ? localConfig.extension_version : "1.0";
            localConfig.path                 = localConfig.path ? localConfig.path : "/widget.html";
            localConfig.hash                 = localConfig.hash ? localConfig.hash : "";
            localConfig.revision             = localConfig.revision ? localConfig.revision : "";
        }

        var urlConstruct = function() {
            var returnUrl;
            if(ZCGlobal.setup == "dev" || ZCGlobal.buildSetup == "dev") {
            	returnUrl = `${httpScheme + zAppsHost}`;
            } else {
            	returnUrl = `${httpScheme + localConfig.uniqueID}.${zAppsHost}`;
            }
			if(localConfig.revision) {
				returnUrl = `${returnUrl}/appfiles/v2/${localConfig.uniqueID + slashSeparator + localConfig.extension_version + slashSeparator + localConfig.hash + slashSeparator + localConfig.revision}/app${localConfig.path}`;
			} else {
				returnUrl = `${returnUrl}/appfiles/v2/${localConfig.uniqueID + slashSeparator + localConfig.extension_version + slashSeparator + localConfig.hash}/app${localConfig.path}`;
			}
            return returnUrl;
        }

        var _createWidgetElement = function(element, config){
            var zcWidgetData = $(element).data('zcWidget');
            if(zcWidgetData != undefined) {
                return zcWidgetData;
            } else {
                config.target = element;
                if(localConfig.isExternalHost) {
                	config.url = localConfig.path;
                } else {
                	config.url = urlConstruct();
                }
                var returnObj = zcWidgets(config);
                $(element).data('zcWidget', returnObj);
                localConfig.success && localConfig.success();
                return returnObj;
            }
        };
        return _createWidgetElement(this, localConfig);
    }

    function DeepFreeze(obj) {
        var propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach(function(name) {
            var prop = obj[name];
            if (prop !== null && typeof prop === 'object') {
                DeepFreeze(prop);
            }
        });
        return Object.freeze(obj);
    }

    function APIHelper() {
		var Console = window.console;
        return {
        	MandatoryParams : {
            	ADD_RECORD           : new Map([["allField", ["formLinkName", "body"]], 								["subField", new Map()]]),
            	EDIT_RECORD   		 : new Map([["allField", ["viewLinkName", "body", "listOfRecords"]], 				["subField", new Map()]]),
            	EDIT_RECORDS  		 : new Map([["allField", ["viewLinkName", "body", "listOfRecords"]], 				["subField", new Map()]]),
            	DELETE_RECORD 		 : new Map([["allField", ["viewLinkName", "listOfRecords"]], 						["subField", new Map()]]),
            	DELETE_RECORDS   	 : new Map([["allField", ["viewLinkName", "criteria"]], 							["subField", new Map()]]),
            	GET_RECORD			 : new Map([["allField", ["viewLinkName", "id"]], 									["subField", new Map()]]),
            	GET_RECORDS          : new Map([["allField", ["viewLinkName"]], 										["subField", new Map()]]),
            	UPLOAD_FILE          : new Map([["allField", ["viewLinkName", "id", "fieldName", "file"]], 				["subField", new Map()]]),
            	UPLD_SBFRM_FLE       : new Map([["allField", ["viewLinkName", "id", "fieldName", "file", "parentId"]], 	["subField", new Map()]])	//["subField", new Map([["subform", ["subformName", "parentId"]]])]
        	},
        	OptionalParams : {
        		ADD_RECORD           : [],
            	EDIT_RECORD   		 : [],
            	EDIT_RECORDS  		 : [],
            	DELETE_RECORD 		 : [],
            	DELETE_RECORDS   	 : [],
            	GET_RECORD			 : [],
            	GET_RECORDS          : ["criteria", "page", "pageSize"],
            	UPLOAD_FILE          : [],
            	UPLD_SBFRM_FLE       : []
        	},
            APISpec : {
            	ADD_RECORD           : "/widgetapi/{0}/{1}/form/{2}",							// {0} = ScopeName, {1} = App Link Name, {2} = Form Link Name 														//NO I18N
            	EDIT_RECORD   		 : "/widgetapi/{0}/{1}/view/{2}/{3}",						// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	EDIT_RECORDS  		 : "/widgetapi/{0}/{1}/view/{2}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	DELETE_RECORD 		 : "/widgetapi/{0}/{1}/view/{2}/{3}",						// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	DELETE_RECORDS   	 : "/widgetapi/{0}/{1}/view/{2}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	
                //GET_RECORDS          : "/widgetapi/{0}/{1}/view/{2}/viewrecords"				// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	GET_RECORD			 : "/widgetapi/{0}/{1}/view/{2}/{3}",						// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	GET_RECORDS          : "/widgetapi/{0}/{1}/view/{2}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	UPLOAD_FILE          : "/widgetapi/{0}/{1}/view/{2}/{3}/{4}/upload",			// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID, {4} = Field Name 				//NO I18N
            	UPLD_SBFRM_FLE       : "/widgetapi/{0}/{1}/view/{2}/{3}/{4}/{5}/upload"				// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID (or) Parent Record Id
																																				// {4} = Sub Form Name with Field Name, {5} = SubFormRec Link Id	//NO I18N
            },
            MobileAPISpec : {
            	ADD_RECORD           : "/api/v2/{0}/{1}/form/{2}",								// {0} = ScopeName, {1} = App Link Name, {2} = Form Link Name 														//NO I18N
            	EDIT_RECORD		 	 : "/api/v2/{0}/{1}/view/{2}/{3}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	EDIT_RECORDS   		 : "/api/v2/{0}/{1}/view/{2}",								// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	DELETE_RECORD 		 : "/api/v2/{0}/{1}/view/{2}/{3}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	DELETE_RECORDS   	 : "/api/v2/{0}/{1}/view/{2}",								// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	
                //GET_RECORDS          : "/api/v2/{0}/{1}/view/{2}/viewrecords"					// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	GET_RECORD			 : "/api/v2/{0}/{1}/view/{2}/{3}",							// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID 								//NO I18N
            	GET_RECORDS          : "/api/v2/{0}/{1}/view/{2}",								// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name 														//NO I18N
            	UPLOAD_FILE          : "/api/v2/{0}/{1}/view/{2}/{3}/{4}/upload",				// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID, {4} = Field Name 				//NO I18N
            	UPLD_SBFRM_FLE       : "/api/v2/{0}/{1}/view/{2}/{3}/{4}/{5}/upload"				// {0} = ScopeName, {1} = App Link Name, {2} = View Link Name, {3} = Record Link ID (or) Parent Record Id
            																																	// {4} = Sub Form Name with Field Name, {5} = SubFormRec Link Id	//NO I18N
            },
            urlGenerator : function(){
                var s = arguments[0];
                var len = arguments.length;
                for (var i = 0; i < len - 1; i += 1) {
                    var reg = new RegExp('\\{' + i + '\\}', 'gm');
                    s = s.replace(reg, arguments[i + 1]);
                }
                return s;//ZCGlobal.appbuilderserverprefix
            },
            base64Encode : function(str) {
                var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var out = "", i = 0, len = str.length, c1, c2, c3;
                while (i < len) {
                    c1 = str.charCodeAt(i++) & 0xff;
                    if (i == len) {
                        out += CHARS.charAt(c1 >> 2);
                        out += CHARS.charAt((c1 & 0x3) << 4);
                        out += "==";
                        break;
                    }
                    c2 = str.charCodeAt(i++);
                    if (i == len) {
                        out += CHARS.charAt(c1 >> 2);
                        out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                        out += CHARS.charAt((c2 & 0xF) << 2);
                        out += "=";
                        break;
                    }
                    c3 = str.charCodeAt(i++);
                    out += CHARS.charAt(c1 >> 2);
                    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                    out += CHARS.charAt(c3 & 0x3F);
                }
                return out;
            },
            getCSRF : function () {
        		try {
        			var cookies = document.cookie.split(";");
        			var csrfName = "zccpn"; 
        			for(var i = 0; i < cookies.length ; i++){
        				cookie = cookies[i].trim();
        				if(cookie.indexOf(csrfName + '=') === 0){
        					return cookie.substring(csrfName.length+1);
        				}
        			}
        		}
        		catch(e) {
        			Console.log("Unable to fetch CSRF :: " + e);
        		}
        		Console.log("Returning empty CSRF!!!");
        		return "";
            },
            isEmptyObjEmptyVal : function(obj, skipVals) {
            	var retVal = false;
            	for(var name in obj) {
            		var isSkip = (skipVals && skipVals.includes(name));
            		 if(!isSkip && APIHelper.isEmpty(obj[name])) {
            			retVal = true;
            		}
            	}
            	return retVal;
            },
            isEmptyObj : function(obj) {
            	for (var val in obj) {
                    return false;
            	}
                return true;
            },
            isEmpty : function(checkVal) {
            	var retVal = false;
            	if(!checkVal || checkVal == null || checkVal === "" || 
            			(typeof(checkVal) == "string" && checkVal.trim().length == 0) ||
            			(typeof(checkVal) == "object" && APIHelper.isEmptyObj(checkVal))) {
            		retVal = true;
            	}
            	return retVal;
            },
            isNotEmpty : function(checkVal) {
            	return !APIHelper.isEmpty(checkVal);
            },
            getInitParams : function() {
            	var initMap = {};
            	
            	initMap.scope			= ZCGlobal.scopeName;
            	initMap.envUrlFragment  = ZCGlobal.envUrlFragment.length == 0 ? '' : ZCGlobal.envUrlFragment;
            	initMap.appLinkName		= ZCGlobal.appLinkName;
            	
            	return initMap;
            },
            getQueryParams : function() {
            	var queryMap = {};
            	if(device == "1") {
        	    	var url = window.location.href;
        	    	var inputData= {};
        	    	var locationParams;
        	    	locationParams = window.PAGE.getModel().getQueryString();
        	    	
        	    	var data = locationParams.split("&");
        	    	$.each(data, function(index, value) {
									var keyValPair = {};
									value = decodeURIComponent(value);
        	    		keyValPair = value.split('=');
        	    		if(keyValPair[1]) {
        	    			var val = {};
        	    			val = keyValPair[1].split('#');
        		    		queryMap[keyValPair[0]] = val[0];
        	    		}
        	    	});
            	}
            	if(device == "2" && zcPageParams && zcPageParams != "") {
            		var data = zcPageParams.split("-;-");
            		$.each(data, function(index, value) {
        	    		var keyValPair = {};
        	    		keyValPair = value.split('-:-');
        		    	queryMap[keyValPair[0]] = keyValPair[1];
        	    	});
            	}
            	
            	return queryMap;
            },
            dataURLtoFile : function(dataurl, filename) {
                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), 
                    n = bstr.length, 
                    u8arr = new Uint8Array(n);

                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }

                return new File([u8arr], filename, {type:mime});
            },
            validateInputs : function(operation, data) {
            	var isValid = true;
            	
            	var mndtParams = APIHelper.MandatoryParams[operation];
            	var optParams = APIHelper.OptionalParams[operation];
            	
            	var allMndt = mndtParams.get("allField");
            	allMndt.forEach(function(value) {
            		if(isValid && APIHelper.isEmpty(data[value])) {
            			isValid = false;
            		}
            	});

            	var subParamMndt = mndtParams.get("subField");
            	var subFldKeys = subParamMndt.keys();
                if(subFldKeys && subFldKeys.length > 0) {
        	    	subFldKeys.forEach(function(value) {
        	    		if(isValid && APIHelper.isNotEmpty(data[value])) {
        	    			var subFldInputData = data[value];
        	    			var subFldParams = subParamMndt[value];
        	    			subFldParams.forEach(function(subFldValue) {
        	    				if(isValid && APIHelper.isEmpty(subFldInputData[subFldValue])) {
        	    					isValid = false;
        	    				}
        	    			});
        	    		}
        	    	});
            	}
            	
            	optParams.forEach(function(value) {
        			if(isValid && data[value] && APIHelper.isEmpty(data[value])) {
        				isValid = false;
        			}
        		});
            	
            	return isValid;
            }
        }
    }

    DeepFreeze(APIHelper);
    var APIHelper = APIHelper();

    function RequestProcessor(evt) {

        //var config          = evt.config;
		var promise 		= evt.promise;
        var callback        = promise.resolve;
        var callbackFailure = promise.reject;
        //var promise       = evt.promise;
        //var iframe        = evt.iframe;

        var dataObj         = evt.dataObj;

        var url             = dataObj.url;
        var httpMethod      = dataObj.httpMethod;
        var data            = dataObj.data;
        var headerData      = {'X-ZCSRF-TOKEN'  : "zccpn=" + APIHelper.getCSRF(), 'AGENT-TYPE' : 'ZohoWidgets' , 'demo_user_name' : ZCGlobal.loginName};
        if(evt.data.environmentName)
        {
            headerData.environment = evt.data.environmentName;
        }
        dataObj.contentType = (dataObj.contentType) ? dataObj.contentType : "application/x-www-form-urlencoded; charset=UTF-8";

        switch(device) {
            case '1'    : $.ajax({
                                url         : url,
                                type        : httpMethod,
                                headers		: headerData,
                                data        : data,
                                contentType	: dataObj.contentType,
                                success     : function(response, status, xhr) {
                                                    callback(response);
                                            },
                                 error      : function(xhr,status,e){
                                	 				/**
                                	 				 * callbackFailure(e);
                                	 				 * As error thrown in many cases is "blank", changing the handling.
                                	 				 */
                                	 				var returnResp = {};
                                	 				returnResp.status = xhr.status;
                                	 				returnResp.statusText = xhr.statusText;
                                	 				returnResp.responseText = xhr.responseText;
                                	 				
                                	 				callbackFailure(returnResp);
                                            }
                            });
                            break;
            case '2'    :   ZCMobileSDK(dataObj).then(function(returnData){
                                if(returnData && !returnData.errordesc) {
                                    callback(returnData);
                                } else {
                                    callbackFailure(returnData.errordesc);
                                }
                            }).catch(function(errorData) {
                                callbackFailure(errorData);
                            });
        }
    }
    
    function overrideInitParams(data) {
    	data.scopeName			= ZCGlobal.scopeName;
    	data.appLinkName        = data.appLinkName ? data.appLinkName : ZCGlobal.appLinkName;
    	data.environmentName    = ZCGlobal.environmentName;
    }

	var ZCLayoutManager = (function() {
	
		function WidgetHandler(appLocation, widgetInstance, options) {
			console.log(ZApp.GetExtensionBaseURL(widgetInstance.getExtensionID()));
			var appURL = widgetInstance.getResolvedURL();
			var IFrameComponent = document.getElementById(appLocation);
			IFrameComponent.setAttribute('src', appURL);
			return IFrameComponent;
		}
	
		return {
			WidgetHandler: WidgetHandler 
		};
	})();
    
    /**
     * Bootstrap method installs EventListeners and
     * initial activities for ZAPPS Widgets
     * 
     * EVENT-LISTENERS:
     * 
     * evt : event provides the input data, callback, failure callback along 
     * 
     */
    ZApp.Bootstrap({
		RenderHandlers	: ZCLayoutManager,
        _BroadcastEvent : _BroadcastEvent,
        defaultLocale   : 'en',
		serverConfig	: {
							zappsHost	: {
								            host    : `{{id}}.${zAppsHost}`,
											/*
											* For Dev Setup enable the below line and comment the above line
											 */
											// host	: zAppsHost ,
											port	: null,
											path	: ''
							}
		},
        EventListeners  : {
        	GET_INIT_PARAMS : function(evt) {
								evt.promise.resolve(APIHelper.getInitParams());
							},
        	GET_QUERY_PARAMS : function(evt) {
        						evt.promise.resolve(APIHelper.getQueryParams());
							},
        	IMAGE_LOAD 		: function(evt) {
        						var data            	= evt.data;
                                var httpMethod      	= "GET";
                                var operation       	= "IMAGE_LOAD";
                                var dataObj         	= {};
                                dataObj.httpMethod  	= httpMethod;
                                if(APIHelper.isEmpty(data.src) || !(data.src.startsWith("/api/v2/"))) {
                                	evt.promise.reject("Invalid Configuration...!!!");
                                	return;
                                }
        						if(device == "1") {
        							var url = `/widgetapi${data.src.substring(7)}`;
        							var headerData      = {'X-ZCSRF-TOKEN'  : "zccpn=" + APIHelper.getCSRF(), 'AGENT-TYPE' : 'ZohoWidgets' , 'demo_user_name' : ZCGlobal.loginName};
                                    if(ZCGlobal.environmentName)
                                    {
                                    	headerData.environment = ZCGlobal.environmentName;
                                    }
	        						$.ajax({
	        	            			url : url,
	        	            			type : httpMethod,
	        	            			processData : false,
	        	            			contentType : 'application/octet-stream',
	        	            			mimeType : "text/plain; charset=x-user-defined",
	                                    headers		: headerData,
	        	            			success : function(res, status, xhr){
	        	            				var contentType = xhr.getResponseHeader("Content-Type");
	        	            				var fileType = contentType ? contentType.split(";")[0] : "image/png";
	        	            				var rawData = APIHelper.base64Encode(res);
	        	            				
	        	            				var srcData = `data:${fileType};base64,${rawData}`;
	        	            				evt.promise.resolve(srcData);
	        	            			},
	        	            			error : function(xhr, status, e){
                        	 				var returnResp = {};
                        	 				returnResp.status = xhr.status;
                        	 				returnResp.statusText = xhr.statusText;
                        	 				returnResp.responseText = xhr.responseText;
	        	            				evt.promise.resolve(returnResp);
	        	            			}
	        	            		});
        						} else {
                                    dataObj.operation   	= operation;
            						dataObj.operationType 	= "download";
        							dataObj.url     = data.src;
        							evt.dataObj     = dataObj;
        							RequestProcessor(evt);
        						}
        					},
            ADD_RECORD      : function(evt) {
                                var data            	= evt.data;
                                var url             	= "";
                                var httpMethod      	= "POST";
                                var operation       	= "ADD_RECORD";
                                var dataObj         	= {};
                                dataObj.httpMethod  	= httpMethod;
                                dataObj.data        	= JSON.stringify(data.body);
                                dataObj.operation   	= operation;
        						dataObj.operationType 	= "data";
        						dataObj.contentType 	= "application/json; charset=utf-8";
        						
        						overrideInitParams(data);
        						if(!APIHelper.validateInputs(operation, data)) {
        							evt.promise.reject("Invalid Configuration...!!!");
        							return;
        						}
                                if(device == "1") {
                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.formLinkName);
                                } else if (device == "2") {
                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.formLinkName);
                                } else {
                                    evt.promise.reject("Invalid Device Type");
                                }

                                dataObj.url     = url;
                                evt.dataObj     = dataObj;

                                RequestProcessor(evt);
                                // setTimeout(function() {
                                //     //promise.resolve({ data: data});
                                //     callback(data);
                                // }, 1000);
                            },
            EDIT_RECORDS    : function(evt) {
                                var data            	= evt.data;
                                var url             	= "";
                                var httpMethod      	= "PATCH";
                                var dataObj         	= {};
                                dataObj.httpMethod  	= httpMethod;
                                var operation       	= "EDIT_RECORD";
                                dataObj.operation   	= operation;
        						dataObj.operationType 	= "data";
        						dataObj.contentType 	= "application/json; charset=utf-8";
								
        						overrideInitParams(data);
        						if(data.listOfRecords.length == 1) {
            						if(!APIHelper.validateInputs(operation, data)) {
            							evt.promise.reject("Invalid Configuration...!!!");
            							return;
            						}
	                                if(device == "1") {
	                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.listOfRecords[0]);
	                                } else if (device == "2") {
	                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.listOfRecords[0]);
	                                } else {
	                                    evt.promise.reject("Invalid Device Type");
	                                }
        						} else {
                                    var operation       	= "EDIT_RECORDS";
                                    dataObj.operation   	= operation;
            						if(!APIHelper.validateInputs(operation, data)) {
            							evt.promise.reject("Invalid Configuration...!!!");
            							return;
            						}
        							if(device == "1") {
	                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
	                                } else if (device == "2") {
	                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
	                                } else {
	                                    evt.promise.reject("Invalid Device Type");
	                                }
        							var criteria = "(";
        							$.each(data.listOfRecords, function(index, value){
        								if(index < data.listOfRecords.length - 1) {
        									criteria += "ID == " + value + " || ";
        								} else {
        									criteria += "ID == " + value + ")";
        								}
        							});
        							data.body.criteria = criteria;
        						}

                                dataObj.data	= JSON.stringify(data.body);
                                dataObj.url     = url;
                                evt.dataObj     = dataObj;

                                RequestProcessor(evt);
                            },
            DELETE_RECORDS  : function(evt) {
                                var data            	= evt.data;
                                var url             	= "";
                                var httpMethod      	= "DELETE";
                                var dataObj         	= {};
                                dataObj.httpMethod  	= httpMethod;
                                var operation       	= "DELETE_RECORDS";
                                dataObj.operation   	= operation;
        						dataObj.operationType 	= "data";
        						
        						overrideInitParams(data);
        						if(data.listOfRecords) {
	        						if(data.listOfRecords.length == 1) {
	                                    var operation       	= "DELETE_RECORD";
	                                    dataObj.operation   	= operation;
	            						if(!APIHelper.validateInputs(operation, data)) {
	            							evt.promise.reject("Invalid Configuration...!!!");
	            							return;
	            						}
		                                if(device == "1") {
		                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.listOfRecords[0]);
		                                } else if (device == "2") {
		                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.listOfRecords[0]);
		                                } else {
		                                    evt.promise.reject("Invalid Device Type");
		                                }
	        						} else {
	            						if(!APIHelper.validateInputs(operation, data)) {
	            							evt.promise.reject("Invalid Configuration...!!!");
	            							return;
	            						}
	            						dataObj.contentType 	= "application/json; charset=utf-8";
	        							if(device == "1") {
		                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
		                                } else if (device == "2") {
		                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
		                                } else {
		                                    evt.promise.reject("Invalid Device Type");
		                                }
	        							var criteria = "(";
	        							var i = 0;
	        							$.each(data.listOfRecords, function(index, value){
	        								if(index < data.listOfRecords.length - 1) {
	        									criteria += "ID == " + value + " || ";
	        								} else {
	        									criteria += "ID == " + value + ")";
	        								}
	        							});
	        							data.body = {};
	        							data.body.criteria = criteria;
	                                    dataObj.data = JSON.stringify(data.body);
	        						}
        						} else {
            						if(!APIHelper.validateInputs(operation, data)) {
            							evt.promise.reject("Invalid Configuration...!!!");
            							return;
            						}
            						dataObj.contentType 	= "application/json; charset=utf-8";
        							if(device == "1") {
	                                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
	                                } else if (device == "2") {
	                                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
	                                } else {
	                                    evt.promise.reject("Invalid Device Type");
	                                }
        							
        							data.body = {};
        							data.body.criteria = data.criteria;
        							dataObj.data = JSON.stringify(data.body);
        						}

                                dataObj.url     = url;
                                evt.dataObj     = dataObj;

                                RequestProcessor(evt);
                            },
			GET_RECORD	    : function(evt) {
				                var data            = evt.data;
				                var url             = "";
				                var httpMethod      = "GET";
				                var operation       = "GET_RECORD";
				                var dataObj         = {};
				                dataObj.httpMethod  = httpMethod;
				                dataObj.operation   = operation;
        						dataObj.operationType 	= "data";
        						
        						overrideInitParams(data);
        						if(!APIHelper.validateInputs(operation, data)) {
        							evt.promise.reject("Invalid Configuration...!!!");
        							return;
        						}
				                if(device == "1") {
				                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.id);
				                } else if (device == "2") {
				                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.id);
				                } else {
				                    evt.promise.reject("Invalid Device Type");
				                }
				
				                dataObj.url     = url;
				                evt.dataObj     = dataObj;
				
				                RequestProcessor(evt);
				            },
			GET_RECORDS     : function(evt) {
				                var data            = evt.data;
				                var url             = "";
				                var httpMethod      = "GET";
				                var operation       = "GET_RECORDS";
				                var dataObj         = {};
				                dataObj.httpMethod  = httpMethod;
				                dataObj.operation   = operation;
        						dataObj.operationType 	= "data";
        						
        						overrideInitParams(data);
        						if(!APIHelper.validateInputs(operation, data)) {
        							evt.promise.reject("Invalid Configuration...!!!");
        							return;
        						}
				                if(device == "1") {
				                    url       = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
				                } else if (device == "2") {
				                    url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName);
				                } else {
				                    evt.promise.reject("Invalid Device Type");
				                }
				                
				                var reqParams = "";
				                
				                data.criteria && (reqParams += `criteria=${encodeURIComponent(data.criteria)}&`);
				                
				                if(data.page && !isNaN(data.page)) {
									if(data.pageSize && !isNaN(data.pageSize)) {
										var startVal = (data.page - 1) * data.pageSize;
										startVal = (startVal < 0) ? 0 : startVal;
										reqParams += `from=${startVal + 1}&limit=${data.pageSize}&`;
									} else {
										var startVal = (data.page - 1) * 100;
										startVal = (startVal < 0) ? 0 : startVal;
										reqParams += `from=${startVal + 1}&limit=100&`;
									}
				                } else {
									if(data.pageSize && !isNaN(data.pageSize)) {
										reqParams += `from=1&limit=${data.pageSize}&`;
									} else {
										reqParams += `from=1&limit=100&`;
									}
				                }
				                
				                //commenting sort temporarily
				                /* if(data.sortField && data.sortOrder) {
				                	reqParams += "sortBy=" + data.sortField +  ((data.sortOrder == "1") ? ":true&" : ":false&");
				                } */
				                
				                (reqParams.charAt(reqParams.length - 1) == "&") && (reqParams = reqParams.slice(0, reqParams.length - 1));
				                reqParams && (url = url + "?" + reqParams);
				
				                dataObj.url     = url;
				                evt.dataObj     = dataObj;
				
				                RequestProcessor(evt);
				            },
			UPLOAD_FILE	    : function(evt) {
				                var data            	= evt.data;
				                var url             	= "";
				                var httpMethod      	= "POST";
				                var operation       	= "UPLOAD_FILE";
				                var dataObj         	= {};
				                dataObj.httpMethod  	= httpMethod;
				                dataObj.operation   	= operation;
				                
			                	/**
			                	 * Commenting the code as the specification changed from 
			                	 * `JSON` format for SubForm to `DOT` notation.
			                	 data.subform && (operation = "UPLD_SBFRM_FLE");
			                	 */
				                data.parentId && (operation = "UPLD_SBFRM_FLE");
				                
				                var isValidInputs = !APIHelper.validateInputs(operation, data);
				                if(isValidInputs) {
        							evt.promise.reject("Invalid Configuration...!!!");
        							return;
        						}
				                
				                if(APIHelper.isEmpty(data.fileName)) {
				                	data.fileName = Date.now() + "ZC_WIDGET_FILE";
				                }
				                var reconstructedFile = APIHelper.dataURLtoFile(data.file, data.fileName);
				                var reconstructedFileSize = reconstructedFile / 1024 / 1024;
			                	
        						overrideInitParams(data);
        						if(reconstructedFileSize > 50) {
        							evt.promise.reject("Invalid Configuration...!!!");
        							return;
        						}
				                if(device == "1") {
				                	
				                	/**
				                	if(data.subform) {
				                		var subFormJson = data.subform;
				                		var fieldLinkName = `${subFormJson.subformName}.${data.fieldName}`;
					                	url = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, subFormJson.parentId, fieldLinkName, data.id);
				                	}
				                	*/
				                	
				                	if(data.parentId) {
					                	url = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.parentId, data.fieldName, data.id);
				                	} else {
					                	url = APIHelper.urlGenerator(APIHelper.APISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.id, data.fieldName);
				                	}
					                dataObj.url     = url;
					                evt.dataObj     = dataObj;
					                var headerData  = {'AGENT-TYPE' : 'ZohoWidgets' , 'demo_user_name' : ZCGlobal.loginName };
                                    if(data.environmentName)
                                    {
                                    	headerData.environment = data.environmentName;
                                    }

					                var formData = new FormData();
					        		formData.append("file", reconstructedFile);
					        		formData.append("zccpn", APIHelper.getCSRF());
					        		
					        		$.ajax({
					        			url			: dataObj.url,
					        			type		: httpMethod,
					        			data		: formData,
                                        headers     : headerData,
					        			processData	: false,	// tell jQuery not to process the data
					        			contentType	: false,	// tell jQuery not to set contentType
	                                    
					        			success:function(res, status, e){
	        	            				evt.promise.resolve(res);
					        			}, error: function(res, status, e){
					        				evt.promise.reject(e);
					        			}
					        		});
        						} else if (device == "2") {
        							/**
				                	if(data.subform) {
				                		var subFormJson = data.subform;
				                		var fieldLinkName = `${subFormJson.subformName}.${data.fieldName}`;
					                	url = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, subFormJson.parentId, fieldLinkName, data.id);
				                	}
				                	*/
				                	
				                	if(data.parentId) {
					                	url = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.parentId, data.fieldName, data.id);
				                	} else {
				                		url       = APIHelper.urlGenerator(APIHelper.MobileAPISpec[operation], data.scopeName, data.appLinkName, data.viewLinkName, data.id, data.fieldName);
				                	}
                                    dataObj.operation   		= operation;
            						dataObj.operationType 		= "upload";
        							dataObj.url     			= url;
        							dataObj.data				= data;
        							evt.dataObj     			= dataObj;
        							RequestProcessor(evt);
        						} else {
				                    evt.promise.reject("Invalid Device Type");
				                }
				            }
        }
    });
});