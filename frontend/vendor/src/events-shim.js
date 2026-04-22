// events shim (EventEmitter polyfill for browser)
export class EventEmitter {
  constructor() { this._events = {}; }
  on(e, cb) { (this._events[e] = this._events[e]||[]).push(cb); return this; }
  emit(e, ...a) { (this._events[e]||[]).forEach(cb=>cb.apply(this,a)); return this; }
  once(e,cb){const h=(...a)=>{cb.apply(this,a);this.off(e,h);};return this.on(e,h);return this;}
  off(e,cb){this._events[e]=(this._events[e]||[]).filter(x=>x!==cb);return this;}
  removeAllListeners(e){if(e)this._events[e]=[];else this._events={};return this;}
}
