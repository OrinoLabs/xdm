/**
 * @copyright 2015 Orino Labs GmbH
 * @author Michael Bürge <mib@orino.ch>
 */


goog.provide('xdm.NativeTransport');

goog.require('goog.log');


/**
 * @constructor
 */
xdm.NativeTransport = function() {
  /** 
   * @type {Object.<string, xdm.Link>}
   * @private
   */
  this.links_ = {};

  window.addEventListener('message', this.handleMessageEvent_.bind(this));
  this.logger.fine('Message event handler registered.');
};
goog.addSingletonGetter(xdm.NativeTransport);


/** @type {goog.debug.Logger} */
xdm.NativeTransport.logger = xdm.NativeTransport.prototype.logger =
    goog.log.getLogger('xdm.NativeTransport');


/**
 * @type {Array.<string>}
 */
xdm.messageProperties = ['linkId', 'port', 'payload'];


/**
 * @param {Event} e
 * @private
 */
xdm.NativeTransport.prototype.handleMessageEvent_ = function(e) {
  // Check whether the received message is intended for us.
  if (!goog.isObject(e.data) ||
      !xdm.messageProperties.every(function(prop) { return prop in e.data; })) {
    this.logger.info('Not an XDM message, discarding.');
    return;
  }

  var linkId = e.data['linkId'];
  var link = this.links_[linkId];
  if (!link) {
    this.logger.info('No link with id "' + linkId + '".');
    return;
  }

  if (link.targetOrigin != e.origin) {
    this.logger.severe('Origin mismatch: ' + link.targetOrigin + ' != ' + e.origin);
    return;
  }

  link.deliver(e.data['port'], e.data['payload']);
};


/**
 * @param {xdm.Link} link
 */
xdm.NativeTransport.prototype.registerLink = function(link) {
  this.links_[link.id] = link;
};


/**
 * @param {xdm.Link} link
 * @param {Object} data
 */
xdm.NativeTransport.prototype.send = function(link, data) {
  link.targetWindow.postMessage(data, link.targetOrigin);
};
