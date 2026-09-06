const React = require('react');
const { RefreshControl } = require('react-native');
console.log('RefreshControl:', typeof RefreshControl);
console.log('isReactComponent:', RefreshControl.prototype && RefreshControl.prototype.isReactComponent);
