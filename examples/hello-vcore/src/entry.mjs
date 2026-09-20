import {main} from './main.mjs';
import {engineContext,emitResult} from '../public/sdk/engine.js';
const context=engineContext();
emitResult(await main(context));
// Keep the bounded process observable; Native Container controls its lifetime.
setTimeout(()=>{},60000);
