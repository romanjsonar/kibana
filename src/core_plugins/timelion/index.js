
module.exports = function (kibana) {
  let mainFile = 'plugins/timelion/app';// eslint-disable-line no-unused-vars

  const ownDescriptor = Object.getOwnPropertyDescriptor(kibana, 'autoload');
  const protoDescriptor = Object.getOwnPropertyDescriptor(kibana.constructor.prototype, 'autoload');
  const descriptor = ownDescriptor || protoDescriptor || {};
  if (descriptor.get) {
    // the autoload list has been replaced with a getter that complains about
    // improper access, bypass that getter by seeing if it is defined
    mainFile = 'plugins/timelion/app_with_autoload';
  }

  return;

};
