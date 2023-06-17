import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback) => {
    process.nextTick(callback);
  };
}

if (typeof clearImmediate === 'undefined') {
  global.clearImmediate = (immediateId) => {
    process.nextTick(immediateId);
  };
}
