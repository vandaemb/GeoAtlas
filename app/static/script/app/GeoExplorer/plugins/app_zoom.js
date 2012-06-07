/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = Zoom
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides two actions for zooming in and out.
 */
gxp.plugins.Zoom = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_zoom */
    ptype: "gxp_zoom",
    
    /** api: config[zoomInMenuText]
     *  ``String``
     *  Text for zoom in menu item (i18n).
     */
    zoomInMenuText: "Zoom In",

    /** api: config[zoomOutMenuText]
     *  ``String``
     *  Text for zoom out menu item (i18n).
     */
    zoomOutMenuText: "Zoom Out",

    /** api: config[zoomInTooltip]
     *  ``String``
     *  Text for zoom in action tooltip (i18n).
     */
    zoomInTooltip: "Zoom In",

    /** api: config[zoomOutTooltip]
     *  ``String``
     *  Text for zoom out action tooltip (i18n).
     */
    zoomOutTooltip: "Zoom Out",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Zoom.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var actions = [{
            menuText: this.zoomInMenuText,
            text: "Zoom in",
            iconCls: "app-zoomin",
            iconAlign  : 'top',
            rowspan    : '2',
            scale      : 'medium',
            tooltip: this.zoomInTooltip,
            handler: function() {
                this.target.mapPanel.map.zoomIn();    
            },
            scope: this
        }, {
            menuText: this.zoomOutMenuText,
            text: "Zoom uit",
            iconCls: "app-zoomout",
            iconAlign  : 'top',
			scale      : 'medium',
            rowspan    : '2',
            tooltip: this.zoomOutTooltip,
            handler: function() {
                this.target.mapPanel.map.zoomOut();
            },
            scope: this
        }];
        return gxp.plugins.Zoom.superclass.addActions.apply(this, [actions]);
    }
        
});

Ext.preg(gxp.plugins.Zoom.prototype.ptype, gxp.plugins.Zoom);
