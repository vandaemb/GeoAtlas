/**
 * Copyright (c) 2009-2011 The Open Planning Project
 */

Ext.USE_NATIVE_JSON = true;


Ext.Window.prototype.shadow = false;


Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(), s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

(function() {

    Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
    Ext.preg("gx_olsource", gxp.plugins.OLSource);
    Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
    Ext.preg("gx_bingsource", gxp.plugins.BingSource);
    Ext.preg("gx_osmsource", gxp.plugins.OSMSource);

    Ext.preg("gxp_layertree", gxp.plugins.LayerManager);
})();

/**
 * api: (define)
 * module = GeoExplorer
 * extends = gxp.Viewer
 */

/** api: constructor
 *  .. class:: GeoExplorer(config)
 *     Create a new GeoExplorer application.
 *
 *     Parameters:
 *     config - {Object} Optional application configuration properties.
 *
 *     Valid config properties:
 *     map - {Object} Map configuration object.
 *     sources - {Object} An object with properties whose values are WMS endpoint URLs
 *
 *     Valid map config properties:
 *         projection - {String} EPSG:xxxx
 *         units - {String} map units according to the projection
 *         maxResolution - {Number}
 *         layers - {Array} A list of layer configuration objects.
 *         center - {Array} A two item array with center coordinates.
 *         zoom - {Number} An initial zoom level.
 *
 *     Valid layer config properties (WMS):
 *     name - {String} Required WMS layer name.
 *     title - {String} Optional title to display for layer.
 */
var GeoExplorer = Ext.extend(gxp.Viewer, {

    // Begin i18n.
        zoomSliderText: "<div>Zoomniveau: {zoom}</div><div>Schaal: 1:{scale}</div>",
        loadConfigErrorText: "Problemen met inladen van de opgeslagen configuratie: <br />",
        loadConfigErrorDefaultText: "Server Error.",
        xhrTroubleText: "Communicatieproblemen: Status ",
        layersText: "Lagen",
        titleText: "Titel",
        zoomLevelText: "Zoomniveau",
        bookmarkText: "Favorieten URL",
        permakinkText: 'Permalink',
        appInfoText: "GeoAtlas",
        aboutText: "Over GeoAtlas",
        mapInfoText: "Kaartinfo",
        descriptionText: "Beschrijving",
        contactText: "Contact",
        aboutThisMapText: "Over deze applicatie",
    // End i18n.
    
    /**
     * private: property[mapPanel]
     * the :class:`GeoExt.MapPanel` instance for the main viewport
     */
    mapPanel: null,
    
    toggleGroup: "toolGroup",

    constructor: function(config) {
        this.mapItems = [
            {
                xtype: "gxp_scaleoverlay"
            }, {
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100,
                plugins: new GeoExt.ZoomSliderTip({
                    template: this.zoomSliderText
                })
            }
        ];

        config.viewerTools = [
            {
                leaf: true,
                text: gxp.plugins.Print.prototype.tooltip,
                ptype: "gxp_print",
                iconCls: "gxp-icon-print",
                customParams: {outputFilename: 'GeoExplorer-print'},
                printService: config.printService,
                checked: true
            }, {
                leaf: true, 
                text: gxp.plugins.Navigation.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-pan",
                ptype: "gxp_navigation", 
                toggleGroup: this.toggleGroup
            }, {
                leaf: true, 
                text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip, 
                checked: true, 
                iconCls: "gxp-icon-getfeatureinfo",
                ptype: "gxp_wmsgetfeatureinfo",
                format: 'grid',
                toggleGroup: this.toggleGroup
            }, {
                leaf: true, 
                text: gxp.plugins.Measure.prototype.measureTooltip, 
                checked: true, 
                iconCls: "gxp-icon-measure-length",
                ptype: "gxp_measure",
                controlOptions: {immediate: true},
                toggleGroup: this.toggleGroup
            }, {
                leaf: true, 
                text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-in",
                numberOfButtons: 2,
                ptype: "gxp_zoom"
            }, {
                leaf: true, 
                text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-previous",
                numberOfButtons: 2,
                ptype: "gxp_navigationhistory"
            }, {
                leaf: true, 
                text: gxp.plugins.ZoomToExtent.prototype.tooltip, 
                checked: true, 
                iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
                ptype: "gxp_zoomtoextent"
            }, {
                leaf: true, 
                text: gxp.plugins.Legend.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-legend",
                ptype: "gxp_legend"
            }, {
                leaf: true,
                text: gxp.plugins.GoogleEarth.prototype.tooltip,
                checked: true,
                iconCls: "gxp-icon-googleearth",
                ptype: "gxp_googleearth"
        }];

        GeoExplorer.superclass.constructor.apply(this, arguments);
    }, 

    loadConfig: function(config) {
        
        var mapUrl = window.location.hash.substr(1);
        var match = mapUrl.match(/^maps\/(\d+)$/);
        if (match) {
            this.id = Number(match[1]);
            OpenLayers.Request.GET({
                url: "../" + mapUrl,
                success: function(request) {
                    var addConfig = Ext.util.JSON.decode(request.responseText);
                    // Don't use persisted tool configurations from old maps
                    delete addConfig.tools;
                    this.applyConfig(Ext.applyIf(addConfig, config));
                },
                failure: function(request) {
                    var obj;
                    try {
                        obj = Ext.util.JSON.decode(request.responseText);
                    } catch (err) {
                        // pass
                    }
                    var msg = this.loadConfigErrorText;
                    if (obj && obj.error) {
                        msg += obj.error;
                    } else {
                        msg += this.loadConfigErrorDefaultText;
                    }
                    this.on({
                        ready: function() {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    window.location.hash = "";
                    this.applyConfig(config);
                },
                scope: this
            });
        } else {
            var query = Ext.urlDecode(document.location.search.substr(1));
            if (query && query.q) {
                var queryConfig = Ext.util.JSON.decode(query.q);
                Ext.apply(config, queryConfig);
            }
            this.applyConfig(config);
        }
        
    },
    
    displayXHRTrouble: function(msg, status) {
        
        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });
        
    },
    
    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {
        
        var westPanel = new Ext.Panel({
            id: "tree",
            region: "west",
            width: 300,
            split: true,
            autoScroll: true,
            collapsible: true,
            collapseMode: "mini",
            hideCollapseTool: true,
            header: false
        });
        
        var Navigation = new Ext.ButtonGroup({
		   title   : 'Verslepen & zoomen',
		   id: 'groupNavigation',
		   columns : 6,
		   layout  : 'table',
		   height  : 73,
		   items   : []
		});
		
		var othersearch = new Ext.menu.Menu({
			id: 'othersearchid',
			items: []});
		
		var Search = new Ext.ButtonGroup({
		   title   : 'Locatie zoeken',
		   id: 'groupSearch',
		   columns : 1,
		   layout  : 'table',
		   height  : 73,
		   items   : [{xtype: "container",width: 170,id: "geocoder"}, 
		   
		   {
			  text       : 'Andere zoekomdrachten',
			  iconCls    : 'gxp-icon-find',
			  arrowAlign : 'right',
			  menu       : othersearch
		   }]
		});
		
        var Information = new Ext.ButtonGroup({
		   title   : 'Onderzoeken',
		   id: 'groupInformation',
		   columns : 3,
		   layout  : 'table',
		   height  : 73,
		   items   : []
		});
		
		var Application = new Ext.ButtonGroup({
		   title   : 'Applicatie',
		   id: 'groupApplication',
		   columns : 4,
		   layout  : 'table',
		   height  : 73,
		   items   : [        {
            text: "Over",
            iconCls: "app-about",
            handler: this.displayAppInfo,
            scope: this,
            iconAlign  : 'top',
            rowspan    : '2',
            scale      : 'medium'
        }, {
            tooltip: this.exportMapText,
            handler: function() {
                this.doAuthorized(["ROLE_ADMINISTRATOR"], function() {
                    this.save(this.showEmbedWindow);
                }, this);
            },
            scope: this,
            iconCls: 'app-publish',
            text: 'Publiceren',
            iconAlign  : 'top',
            rowspan    : '2',
            scale      : 'medium'
        }, {
            tooltip: this.saveMapText,
            handler: function() {
                this.doAuthorized(["ROLE_ADMINISTRATOR"], function() {
                    this.save(this.showUrl);
                }, this);
            },
            scope: this,
            iconCls: "app-save",
            iconAlign  : 'top',
            rowspan    : '2',
            scale      : 'medium',
            text: "Opslaan"
        }]
		});
		
		 var Editing = new Ext.ButtonGroup({
		   title   : 'Editeren',
		   id: 'groupEditing',
		   columns : 2,
		   layout  : 'table',
		   height  : 73,
		   items   : []
		});
		
		var General = new Ext.ButtonGroup({
		   title   : 'Algemeen',
		   id: 'groupGeneral',
		   columns : 5,
		   layout  : 'table',
		   height  : 73,
		   items   : []
		});
		

      
        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: 'paneltbar',
				items: [
					Application,
					General,
					Navigation,
					Information,
					Editing,
					Search,
					'->',
					this.createTools()
					
					
					
				]
			
        });
        
        
        //oldmenu
                //this.toolbar = new Ext.Toolbar({
				//disabled: true,
				//id: 'paneltbar',
				//items: [
				//this.createTools(),
				//Search,
				//Navigation,
				//
			//]
			
        //});
        
        
        this.on("ready", function() {
            var disabled = this.toolbar.items.filterBy(function(item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            this.toolbar.enable();
            disabled.each(function(item) {
                item.disable();
            });
        });

        var googleEarthPanel = new gxp.GoogleEarthPanel({
            mapPanel: this.mapPanel,
            listeners: {
                beforeadd: function(record) {
                    return record.get("group") !== "background";
                }
            }
        });
        
        var preGoogleDisabled = [];

        googleEarthPanel.on("show", function() {
            preGoogleDisabled.length = 0;
            this.toolbar.items.each(function(item) {
                if (item.disabled) {
                    preGoogleDisabled.push(item);
                }
            });
            this.toolbar.disable();

            for (var key in this.tools) {
                var tool = this.tools[key];
                if (tool.outputTarget === "map") {
                    tool.removeOutput();
                }
            }
            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.items.each(function(item) {
                    if (item.disabled) {
                        preGoogleDisabled.push(item);
                    }
                });
                layersToolbar.disable();
            }
        }, this);

        googleEarthPanel.on("hide", function() {

            this.toolbar.enable();
            
            var layersContainer = Ext.getCmp("tree");
            var layersToolbar = layersContainer && layersContainer.getTopToolbar();
            if (layersToolbar) {
                layersToolbar.enable();
            }

            for (var i=0, ii=preGoogleDisabled.length; i<ii; ++i) {
                preGoogleDisabled[i].disable();
            }

        }, this);

        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center",
            defaults: {
                border: false
            },
            items: [
                this.mapPanel,
                googleEarthPanel
            ],
            activeItem: 0
        });
        
        this.portalItems = [{
            region: "center",
            layout: "border",
            tbar: this.toolbar,
            items: [
                this.mapPanelContainer,
                westPanel
            ]
        }];
        
        GeoExplorer.superclass.initPortal.apply(this, arguments);        
    },
    
    /** private: method[createTools]
     * Create the toolbar configuration for the main panel.  This method can be 
     * overridden in derived explorer classes such as :class:`GeoExplorer.Composer`
     * or :class:`GeoExplorer.Viewer` to provide specialized controls.
     */
    createTools: function() {
        var tools = [];
        return tools;
    },
    
    /** private: method[showUrl]
     */
    showUrl: function() {
        var win = new Ext.Window({
            title: this.bookmarkText,
            layout: 'form',
            labelAlign: 'top',
            modal: true,
            bodyStyle: "padding: 5px",
            width: 300,
            items: [{
                xtype: 'textfield',
                fieldLabel: this.permakinkText,
                readOnly: true,
                anchor: "100%",
                selectOnFocus: true,
                value: window.location.href
            }]
        });
        win.show();
        win.items.first().selectText();
    },
    
    /** api: method[getBookmark]
     *  :return: ``String``
     *
     *  Generate a bookmark for an unsaved map.
     */
    getBookmark: function() {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(),
            {q: Ext.util.JSON.encode(this.getState())}
        );
        

        var url = 
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);
        
        return url;
    },

    /** private: method[displayAppInfo]
     * Display an informational dialog about the application.
     */
    displayAppInfo: function() {
        var appInfo = new Ext.Panel({
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='../about.html' frameborder='0' border='0'><a target='_blank' href='../about.html'>"+this.aboutText+"</a> </iframe>"
        });

        var about = Ext.applyIf(this.about, {
            title: '', 
            "abstract": '', 
            contact: ''
        });

        var mapInfo = new Ext.Panel({
            title: this.mapInfoText,
            html: '<div class="gx-info-panel">' +
                  '<h2>'+this.titleText+'</h2><p>' + about.title +
                  '</p><h2>'+this.descriptionText+'</h2><p>' + about['abstract'] +
                  '</p> <h2>'+this.contactText+'</h2><p>' + about.contact +'</p></div>',
            height: 'auto',
            width: 'auto'
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            items: [mapInfo, appInfo]
        });

        var win = new Ext.Window({
            title: this.aboutThisMapText,
            modal: true,
            layout: "fit",
            width: 300,
            height: 300,
            items: [tabs]
        });
        win.show();
    },
    
    /** private: method[getState]
     *  :returns: ``Òbject`` the state of the viewer
     */
    getState: function() {
        var state = GeoExplorer.superclass.getState.apply(this, arguments);

        delete state.tools;
        return state;
    }
});

