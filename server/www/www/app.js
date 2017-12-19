(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
!function(global, factory) {
    'object' == typeof exports && 'undefined' != typeof module ? factory(exports) : 'function' == typeof define && define.amd ? define([ 'exports' ], factory) : factory(global.preact = global.preact || {});
}(this, function(exports) {
    function VNode(nodeName, attributes, children) {
        this.nodeName = nodeName;
        this.attributes = attributes;
        this.children = children;
        this.key = attributes && attributes.key;
    }
    function h(nodeName, attributes) {
        var children, lastSimple, child, simple, i;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) instanceof Array) for (i = child.length; i--; ) stack.push(child[i]); else if (null != child && child !== !0 && child !== !1) {
            if ('number' == typeof child) child = String(child);
            simple = 'string' == typeof child;
            if (simple && lastSimple) children[children.length - 1] += child; else {
                (children || (children = [])).push(child);
                lastSimple = simple;
            }
        }
        var p = new VNode(nodeName, attributes || void 0, children || EMPTY_CHILDREN);
        if (options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        if (props) for (var i in props) obj[i] = props[i];
        return obj;
    }
    function clone(obj) {
        return extend({}, obj);
    }
    function delve(obj, key) {
        for (var p = key.split('.'), i = 0; i < p.length && obj; i++) obj = obj[p[i]];
        return obj;
    }
    function isFunction(obj) {
        return 'function' == typeof obj;
    }
    function isString(obj) {
        return 'string' == typeof obj;
    }
    function hashToClassName(c) {
        var str = '';
        for (var prop in c) if (c[prop]) {
            if (str) str += ' ';
            str += prop;
        }
        return str;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(clone(vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function createLinkedState(component, key, eventPath) {
        var path = key.split('.');
        return function(e) {
            var t = e && e.target || this, state = {}, obj = state, v = isString(eventPath) ? delve(e, eventPath) : t.nodeName ? t.type.match(/^che|rad/) ? t.checked : t.value : e, i = 0;
            for (;i < path.length - 1; i++) obj = obj[path[i]] || (obj[path[i]] = !i && component.state[path[i]] || {});
            obj[path[i]] = v;
            component.setState(state);
        };
    }
    function enqueueRender(component) {
        if (!component._dirty && (component._dirty = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p._dirty) renderComponent(p);
    }
    function isFunctionalComponent(vnode) {
        var nodeName = vnode && vnode.nodeName;
        return nodeName && isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render);
    }
    function buildFunctionalComponent(vnode, context) {
        return vnode.nodeName(getNodeProps(vnode), context || EMPTY);
    }
    function isSameNodeType(node, vnode) {
        if (isString(vnode)) return node instanceof Text;
        if (isString(vnode.nodeName)) return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
        if (isFunction(vnode.nodeName)) return (node._componentConstructor ? node._componentConstructor === vnode.nodeName : !0) || isFunctionalComponent(vnode); else return;
    }
    function isNamedNode(node, nodeName) {
        return node.normalizedNodeName === nodeName || toLowerCase(node.nodeName) === toLowerCase(nodeName);
    }
    function getNodeProps(vnode) {
        var props = clone(vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function removeNode(node) {
        var p = node.parentNode;
        if (p) p.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('class' === name && value && 'object' == typeof value) value = hashToClassName(value);
        if ('key' === name) ; else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || isString(value) || isString(old)) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if (!isString(old)) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !NON_DIMENSION_PROPS[i] ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var l = node._listeners || (node._listeners = {});
            name = toLowerCase(name.substring(2));
            if (value) {
                if (!l[name]) node.addEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
            } else if (l[name]) node.removeEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
            l[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || value === !1) node.removeAttribute(name);
        } else {
            var ns = isSvg && name.match(/^xlink\:?(.+)/);
            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1])); else node.removeAttribute(name); else if ('object' != typeof value && !isFunction(value)) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this._listeners[e.type](options.event && options.event(e) || e);
    }
    function collectNode(node) {
        removeNode(node);
        if (node instanceof Element) {
            node._component = node._componentConstructor = null;
            var _name = node.normalizedNodeName || toLowerCase(node.nodeName);
            (nodes[_name] || (nodes[_name] = [])).push(node);
        }
    }
    function createNode(nodeName, isSvg) {
        var name = toLowerCase(nodeName), node = nodes[name] && nodes[name].pop() || (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName));
        node.normalizedNodeName = name;
        return node;
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = parent && void 0 !== parent.ownerSVGElement;
            hydrating = dom && !(ATTR_KEY in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll) {
        var ref = vnode && vnode.attributes && vnode.attributes.ref;
        while (isFunctionalComponent(vnode)) vnode = buildFunctionalComponent(vnode, context);
        if (null == vnode) vnode = '';
        if (isString(vnode)) {
            if (dom && dom instanceof Text && dom.parentNode) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                if (dom) recollectNodeTree(dom);
                dom = document.createTextNode(vnode);
            }
            return dom;
        }
        if (isFunction(vnode.nodeName)) return buildComponentFromVNode(dom, vnode, context, mountAll);
        var out = dom, nodeName = String(vnode.nodeName), prevSvgMode = isSvgMode, vchildren = vnode.children;
        isSvgMode = 'svg' === nodeName ? !0 : 'foreignObject' === nodeName ? !1 : isSvgMode;
        if (!dom) out = createNode(nodeName, isSvgMode); else if (!isNamedNode(dom, nodeName)) {
            out = createNode(nodeName, isSvgMode);
            while (dom.firstChild) out.appendChild(dom.firstChild);
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
            recollectNodeTree(dom);
        }
        var fc = out.firstChild, props = out[ATTR_KEY];
        if (!props) {
            out[ATTR_KEY] = props = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && fc && fc instanceof Text && !fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || fc) innerDiffNode(out, vchildren, context, mountAll, !!props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        if (ref) (props.ref = ref)(out);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, absorb) {
        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren && vchildren.length;
        if (len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child[ATTR_KEY], key = vlen ? (c = _child._component) ? c.__key : props ? props.key : null : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (hydrating || absorb || props || _child instanceof Text) children[childrenLen++] = _child;
        }
        if (vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && key in keyed) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) {
                c = children[j];
                if (c && isSameNodeType(c, vchild)) {
                    child = c;
                    children[j] = void 0;
                    if (j === childrenLen - 1) childrenLen--;
                    if (j === min) min++;
                    break;
                }
            }
            child = idiff(child, vchild, context, mountAll);
            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) {
                if (child === originalChildren[i + 1]) removeNode(originalChildren[i]);
                dom.insertBefore(child, originalChildren[i] || null);
            }
        }
        if (keyedLen) for (var i in keyed) if (keyed[i]) recollectNodeTree(keyed[i]);
        while (min <= childrenLen) {
            child = children[childrenLen--];
            if (child) recollectNodeTree(child);
        }
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component, !unmountOnly); else {
            if (node[ATTR_KEY] && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);
            if (!unmountOnly) collectNode(node);
            var c;
            while (c = node.lastChild) recollectNodeTree(c, unmountOnly);
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if (!(attrs && name in attrs) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        if (attrs) for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name, list = components[name];
        if (list) list.push(component); else components[name] = [ component ];
    }
    function createComponent(Ctor, props, context) {
        var inst = new Ctor(props, context), list = components[Ctor.name];
        Component.call(inst, props, context);
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.nextBase = list[i].nextBase;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component._disable) {
            component._disable = !0;
            if (component.__ref = props.ref) delete props.ref;
            if (component.__key = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.prevContext) component.prevContext = component.context;
                component.context = context;
            }
            if (!component.prevProps) component.prevProps = component.props;
            component.props = props;
            component._disable = !1;
            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__ref) component.__ref(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component._disable) {
            var skip, rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.prevProps || props, previousState = component.prevState || state, previousContext = component.prevContext || context, isUpdate = component.base, nextBase = component.nextBase, initialBase = isUpdate || nextBase, initialChildComponent = component._component;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
            component._dirty = !1;
            if (!skip) {
                if (component.render) rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(clone(context), component.getChildContext());
                while (isFunctionalComponent(rendered)) rendered = buildFunctionalComponent(rendered, context);
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if (isFunction(childComponent)) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__key) setComponentProps(inst, childProps, 1, context); else {
                        toUnmount = inst;
                        inst = createComponent(childComponent, childProps, context);
                        inst.nextBase = inst.nextBase || nextBase;
                        inst._parentComponent = component;
                        component._component = inst;
                        setComponentProps(inst, childProps, 0, context);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount, base !== initialBase);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t._parentComponent) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            var fn, cb = component._renderCallbacks;
            if (cb) while (fn = cb.pop()) fn.call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c._parentComponent)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent, !0);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.nextBase) {
                c.nextBase = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom);
            }
        }
        return dom;
    }
    function unmountComponent(component, remove) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component._disable = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner, remove); else if (base) {
            if (base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);
            component.nextBase = base;
            if (remove) {
                removeNode(base);
                collectComponent(component);
            }
            var c;
            while (c = base.lastChild) recollectNodeTree(c, !remove);
        }
        if (component.__ref) component.__ref(null);
        if (component.componentDidUnmount) component.componentDidUnmount();
    }
    function Component(props, context) {
        this._dirty = !0;
        this.context = context;
        this.props = props;
        if (!this.state) this.state = {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var lcCache = {};
    var toLowerCase = function(s) {
        return lcCache[s] || (lcCache[s] = s.toLowerCase());
    };
    var resolved = 'undefined' != typeof Promise && Promise.resolve();
    var defer = resolved ? function(f) {
        resolved.then(f);
    } : setTimeout;
    var EMPTY = {};
    var ATTR_KEY = 'undefined' != typeof Symbol ? Symbol.for('preactattr') : '__preactattr_';
    var NON_DIMENSION_PROPS = {
        boxFlex: 1,
        boxFlexGroup: 1,
        columnCount: 1,
        fillOpacity: 1,
        flex: 1,
        flexGrow: 1,
        flexPositive: 1,
        flexShrink: 1,
        flexNegative: 1,
        fontWeight: 1,
        lineClamp: 1,
        lineHeight: 1,
        opacity: 1,
        order: 1,
        orphans: 1,
        strokeOpacity: 1,
        widows: 1,
        zIndex: 1,
        zoom: 1
    };
    var NON_BUBBLING_EVENTS = {
        blur: 1,
        error: 1,
        focus: 1,
        load: 1,
        resize: 1,
        scroll: 1
    };
    var items = [];
    var nodes = {};
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        linkState: function(key, eventPath) {
            var c = this._linkedStates || (this._linkedStates = {});
            return c[key + eventPath] || (c[key + eventPath] = createLinkedState(this, key, eventPath));
        },
        setState: function(state, callback) {
            var s = this.state;
            if (!this.prevState) this.prevState = clone(s);
            extend(s, isFunction(state) ? state(s, this.props) : state);
            if (callback) (this._renderCallbacks = this._renderCallbacks || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function() {
            renderComponent(this, 2);
        },
        render: function() {}
    });
    exports.h = h;
    exports.cloneElement = cloneElement;
    exports.Component = Component;
    exports.render = render;
    exports.rerender = rerender;
    exports.options = options;
});

},{}],2:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _preactCycle = require('preact-cycle');

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _conversation = require('./conversation');

var _console = require('./console');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var state = getState();

function getState() {
  var savedState = localStorage.getItem('savedState');

  if (!savedState) {
    savedState = { currentId: new Uint8Array(64), partners: {} };
    window.crypto.getRandomValues(savedState.currentId);
    saveState(savedState);
  } else {
    savedState = JSON.parse(savedState, function (k, v) {
      if (k === 'currentId') return new Uint8Array(v);
      return v;
    });
  }

  var state = {
    status: {
      started: false
    },
    signaler: {
      currentId: savedState.currentId,
      status: 'Not Connected'
    },
    partners: savedState.partners,
    input: {
      connectTo: undefined,
      message: undefined
    },
    conversations: {},
    log: []
  };

  return state;
}

function saveState(state) {
  localStorage.setItem('savedState', stringifyState(state));
}

var connectTo = void 0;
var START = function START(_, mutation) {
  mutation(STARTED)();

  connectTo = (0, _server2.default)(_.signaler.currentId, createActions(mutation));
};

function createActions(mutation) {
  // jshint ignore:start
  var _SIGNAL_CONNECTION_ST = {
    SIGNAL_CONNECTION_STATE_CHANGE: function SIGNAL_CONNECTION_STATE_CHANGE(_, state) {
      _.signaler.connectionState = state;
    },

    PARTNER_MESSAGE: function PARTNER_MESSAGE(_, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          partnerId = _ref2[0],
          message = _ref2[1];

      var id = partnerId.toString();

      var context = _.partners[id];

      console.log('context', context);

      if (context === undefined) {
        context = _.partners[id] = {
          id: id,
          discoveredAt: new Date().getTime()
        };

        saveState({ currentId: _.signaler.currentId, partners: _.partners });
      }

      if (!_.conversations[id]) {
        _.conversations[id] = _.conversations[id] || { partner: partnerId, context: context, channels: {} };
      }

      (0, _console.ADD_LOG_MESSAGE)(_, renderShortID(partnerId) + ': ' + JSON.stringify(message));
    },

    ICE_CONNECTION_STATE_CHANGE: function ICE_CONNECTION_STATE_CHANGE(_, partner, iceConnectionState) {
      var id = partner.toString(),
          context = _.partners[id];

      if (iceConnectionState === 'connected') {
        (context.connectedAt = context.connectedAt || []).unshift(new Date().getTime());
      } else if (iceConnectionState === 'closed') {
        context.closedAt = new Date().getTime();
      } else if (iceConnectionState === 'disconnected') {
        (context.disconnectedAt = context.disconnectedAt || []).unshift(new Date().getTime());
      }

      console.log(context);

      context.iceConnectionState = iceConnectionState;
    },

    ICE_GATHERING_STATE_CHANGE: function ICE_GATHERING_STATE_CHANGE(_, partner, iceGatheringState) {
      var id = partner.toString(),
          context = _.partners[id];

      context.iceGatheringState = iceGatheringState;
    }
  },
      SIGNAL_CONNECTION_STATE_CHANGE = _SIGNAL_CONNECTION_ST.SIGNAL_CONNECTION_STATE_CHANGE,
      PARTNER_MESSAGE = _SIGNAL_CONNECTION_ST.PARTNER_MESSAGE,
      ICE_CONNECTION_STATE_CHANGE = _SIGNAL_CONNECTION_ST.ICE_CONNECTION_STATE_CHANGE,
      ICE_GATHERING_STATE_CHANGE = _SIGNAL_CONNECTION_ST.ICE_GATHERING_STATE_CHANGE;
  // jshint ignore:end

  return actionize({
    'signal': {
      'connection-state': [SIGNAL_CONNECTION_STATE_CHANGE],
      'partner-message': [PARTNER_MESSAGE]
    },
    'peer': {
      'connection-state': [function (_, connectionState) {
        console.log('***', connectionState);
      }],
      'ice-connection-state': [ICE_CONNECTION_STATE_CHANGE],
      'ice-gathering-state': [ICE_GATHERING_STATE_CHANGE],
      'chat-channel-open': [_conversation.CHAT_CHANNEL, mutation],
      'issues-channel-open': [_conversation.ISSUES_CHANNEL, mutation],
      'time-channel-open': [_conversation.TIME_CHANNEL, mutation],
      'game-channel-open': [_conversation.GAME_CHANNEL, mutation]
    }
  });

  function actionize(config) {
    return transform(config, function (value) {
      return transform(value, function (_ref3) {
        var _ref4 = _toArray(_ref3),
            args = _ref4.slice(0);

        return mutation.apply(undefined, _toConsumableArray(args));
      });
    });
  }
}

function transform(obj, fn) {
  return Object.keys(obj).reduce(function (agg, key) {
    agg[key] = fn(obj[key], key);
    return agg;
  }, {});
}

// jshint ignore:start
var _STARTED$SET_SIGNALER = {
  STARTED: function STARTED(_) {
    _.status.started = true;
  },

  SET_SIGNALER_STATUS: function SET_SIGNALER_STATUS(_, status) {
    _.signaler.status = status;
  },

  CONNECT_TO: function CONNECT_TO(_, mutation) {
    return CONNECT_TO_PARTNER(_, _.input.connectTo, mutation);
  },

  CONNECT_TO_PARTNER: function CONNECT_TO_PARTNER(_, name, mutation) {
    return connectTo(new Uint8Array(name.split(',').map(function (n) {
      return parseInt(n, 10);
    })), [_conversation.CHAT_CHANNEL_NAME, _conversation.ISSUES_CHANNEL_NAME, _conversation.TIME_CHANNEL_NAME, _conversation.GAME_CHANNEL_NAME], createActions(mutation), undefined);
  },

  CONNECT_TO_INPUT: function CONNECT_TO_INPUT(_, _ref5) {
    var value = _ref5.target.value;

    _.input.connectTo = value;
  },

  CLEAR_PARTNERS: function CLEAR_PARTNERS(_) {
    _.partners = {};
    saveState({ currentId: _.signaler.currentId, partners: _.partners });
  }
},
    STARTED = _STARTED$SET_SIGNALER.STARTED,
    SET_SIGNALER_STATUS = _STARTED$SET_SIGNALER.SET_SIGNALER_STATUS,
    CONNECT_TO = _STARTED$SET_SIGNALER.CONNECT_TO,
    CONNECT_TO_PARTNER = _STARTED$SET_SIGNALER.CONNECT_TO_PARTNER,
    CONNECT_TO_INPUT = _STARTED$SET_SIGNALER.CONNECT_TO_INPUT,
    CLEAR_PARTNERS = _STARTED$SET_SIGNALER.CLEAR_PARTNERS;
// jshint ignore:end


// jshint ignore:start

var App = function App(_ref6, _ref7) {
  var started = _ref6.status.started,
      signaler = _ref6.signaler,
      conversations = _ref6.conversations,
      issues = _ref6.issues;
  var mutation = _ref7.mutation;
  return (0, _preactCycle.h)(
    'app',
    null,
    !started ? mutation(START)(mutation) : undefined,
    (0, _preactCycle.h)(
      'conversations',
      null,
      Object.values(conversations).map(function (c) {
        return (0, _preactCycle.h)(_conversation.Conversation, { conversation: c });
      })
    ),
    (0, _preactCycle.h)(
      'div',
      null,
      (0, _preactCycle.h)(
        'form',
        { onSubmit: mutation(CONNECT_TO, mutation), action: 'javascript:', autoFocus: true },
        'Connect To: ',
        (0, _preactCycle.h)('input', { type: 'text', onInput: mutation(CONNECT_TO_INPUT) })
      )
    ),
    (0, _preactCycle.h)(Partners, null),
    (0, _preactCycle.h)(
      'div',
      null,
      'Your ID: ',
      (0, _preactCycle.h)(
        'id',
        null,
        signaler.currentId.toString()
      )
    ),
    (0, _preactCycle.h)(_console.Console, null)
  );
};
// jshint ignore:end


// jshint ignore:start
var Partners = function Partners(_, _ref8) {
  var partners = _ref8.partners,
      mutation = _ref8.mutation;
  return (0, _preactCycle.h)(
    'partners',
    null,
    (0, _preactCycle.h)(
      'div',
      null,
      'Past Partners ',
      (0, _preactCycle.h)(
        'button',
        { onClick: mutation(CLEAR_PARTNERS) },
        'clear'
      )
    ),
    (0, _preactCycle.h)(
      'ol',
      null,
      Object.keys(partners).map(function (name) {
        return (0, _preactCycle.h)(
          'li',
          { onClick: mutation(CONNECT_TO_PARTNER, name, mutation) },
          (0, _preactCycle.h)(Partner, { name: name, data: partners[name] })
        );
      })
    )
  );
};
// jshint ignore:end

// jshint ignore:start
var Partner = function Partner(_ref9, _ref10) {
  var name = _ref9.name,
      data = _ref9.data;
  var mutation = _ref10.mutation;
  return (0, _preactCycle.h)(
    'partner',
    null,
    name
  );
};
// jshint ignore:end

(0, _preactCycle.render)(App, state, document.body);

function stringifyState(state) {
  return JSON.stringify(state, function (k, v) {
    if (v instanceof Uint8Array) {
      return Array.from(v);
    }
    return v;
  });
}

function renderShortID(id) {
  return id.slice(0, 3).toString() + '..' + id.slice(id.length - 4, id.length - 1).toString();
}

},{"./console":4,"./conversation":5,"./server":10,"preact-cycle":"preact-cycle"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CHAT_CHANNEL_NAME = exports.CHAT_CHANNEL = exports.Chat = undefined;

var _preactCycle = require('preact-cycle');

var _createChannelHandler = require('./createChannelHandler');

var _createChannelHandler2 = _interopRequireDefault(_createChannelHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CHAT_CHANNEL_NAME = 'chat';

// https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
var notificationSound = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

// jshint ignore:start
var _ADD_CHAT_MESSAGE$SEN = {
  ADD_CHAT_MESSAGE: function ADD_CHAT_MESSAGE(_, chat, type, _ref) {
    var data = _ref.data;

    console.log('_', _);
    chat.messages.unshift({ type: type, data: data, time: new Date().getTime() });
    notificationSound.play();
  },

  SEND_CHAT_MESSAGE: function SEND_CHAT_MESSAGE(_, chat) {
    console.log('send');
    var message = chat.input.message;


    ADD_CHAT_MESSAGE(_, chat, 'self', { data: message });

    chat.channel.send(message);
    chat.input.message = '';
  },

  CHAT_MESSAGE_INPUT: function CHAT_MESSAGE_INPUT(_, chat, _ref2) {
    var value = _ref2.target.value;

    console.log('input', _);
    chat.input.message = value;
  }
},
    ADD_CHAT_MESSAGE = _ADD_CHAT_MESSAGE$SEN.ADD_CHAT_MESSAGE,
    SEND_CHAT_MESSAGE = _ADD_CHAT_MESSAGE$SEN.SEND_CHAT_MESSAGE,
    CHAT_MESSAGE_INPUT = _ADD_CHAT_MESSAGE$SEN.CHAT_MESSAGE_INPUT;
// jshint ignore: end

var CHAT_CHANNEL = (0, _createChannelHandler2.default)(CHAT_CHANNEL_NAME, ADD_CHAT_MESSAGE, function (partner, channel) {
  return {
    partner: partner,
    channel: channel,
    start: new Date().getTime(),
    messages: [],
    input: {
      message: undefined
    }
  };
});

// jshint ignore:start
var Chat = function Chat(_ref3, _ref4) {
  var chat = _ref3.chat;
  var mutation = _ref4.mutation;
  return (0, _preactCycle.h)(
    'chat',
    null,
    (0, _preactCycle.h)(
      'form',
      { onSubmit: mutation(SEND_CHAT_MESSAGE, chat), action: 'javascript:', autoFocus: true },
      (0, _preactCycle.h)('input', { type: 'text', value: chat.input.message, onInput: mutation(CHAT_MESSAGE_INPUT, chat), placeholder: 'Type your chat message here...' })
    ),
    (0, _preactCycle.h)(Messages, { messages: chat.messages, start: chat.start })
  );
};
// jshint ignore: end

// jshint ignore:start
var Messages = function Messages(_ref5) {
  var messages = _ref5.messages,
      start = _ref5.start;
  return (0, _preactCycle.h)(
    'messages',
    null,
    messages.map(function (_ref6) {
      var type = _ref6.type,
          data = _ref6.data,
          time = _ref6.time;
      return (0, _preactCycle.h)(
        'message',
        { className: type },
        (0, _preactCycle.h)(
          'container',
          { className: 'message-time-' + 5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5) },
          (0, _preactCycle.h)(
            'data',
            null,
            data
          ),
          (0, _preactCycle.h)(
            'time',
            null,
            new Date(time).toISOString()
          )
        )
      );
    })
  );
};
// jshint ignore:end


exports.Chat = Chat;
exports.CHAT_CHANNEL = CHAT_CHANNEL;
exports.CHAT_CHANNEL_NAME = CHAT_CHANNEL_NAME;

},{"./createChannelHandler":6,"preact-cycle":"preact-cycle"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ADD_LOG_MESSAGE = exports.Console = undefined;

var _preactCycle = require('preact-cycle');

var _ADD_LOG_MESSAGE = {
  ADD_LOG_MESSAGE: function ADD_LOG_MESSAGE(_ref, message) {
    var log = _ref.log;

    log.unshift(message);
  }
},
    ADD_LOG_MESSAGE = _ADD_LOG_MESSAGE.ADD_LOG_MESSAGE;

// jshint ignore:start

var Console = function Console(_, _ref2) {
  var _ref2$log = _ref2.log,
      log = _ref2$log === undefined ? [] : _ref2$log;
  return (0, _preactCycle.h)(
    'console',
    null,
    (0, _preactCycle.h)(
      'div',
      null,
      'Log'
    ),
    (0, _preactCycle.h)(
      'log',
      null,
      log.map(function (message) {
        return (0, _preactCycle.h)(
          'div',
          null,
          message
        );
      })
    )
  );
};
// jshint ignore:end

exports.Console = Console;
exports.ADD_LOG_MESSAGE = ADD_LOG_MESSAGE;

},{"preact-cycle":"preact-cycle"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LOCATION_CHANNEL_NAME = exports.LOCATION_CHANNEL = exports.TIME_CHANNEL_NAME = exports.TIME_CHANNEL = exports.GAME_CHANNEL_NAME = exports.GAME_CHANNEL = exports.ISSUES_CHANNEL_NAME = exports.ISSUES_CHANNEL = exports.CHAT_CHANNEL_NAME = exports.CHAT_CHANNEL = exports.Conversation = undefined;

var _preactCycle = require('preact-cycle');

var _chat = require('./chat');

var _issues = require('./issues');

var _time = require('./time');

var _game = require('./game');

var _location = require('./location');

// jshint ignore:start
var Conversation = function Conversation(_ref, _ref2) {
  var _ref$conversation = _ref.conversation,
      partner = _ref$conversation.partner,
      context = _ref$conversation.context,
      _ref$conversation$cha = _ref$conversation.channels,
      chat = _ref$conversation$cha.chat,
      issues = _ref$conversation$cha.issues,
      time = _ref$conversation$cha.time,
      game = _ref$conversation$cha.game;
  var partners = _ref2.partners,
      mutation = _ref2.mutation;
  return (0, _preactCycle.h)(
    'conversation',
    { className: context.iceConnectionState },
    (0, _preactCycle.h)(
      'partner-info',
      null,
      (0, _preactCycle.h)(
        'id',
        null,
        renderShortID(partner)
      ),
      context.discoveredAt ? (0, _preactCycle.h)(
        'discovered-at',
        null,
        'Discovered At: ',
        new Date(context.discoveredAt).toString()
      ) : undefined,
      context.connectedAt ? (0, _preactCycle.h)(
        'connected-at',
        null,
        'Connected At: ',
        new Date(context.connectedAt[0]).toString()
      ) : undefined,
      context.disconnectedAt ? (0, _preactCycle.h)(
        'disconnected-at',
        null,
        'Disconnected At: ',
        new Date(context.disconnectedAt[0]).toString()
      ) : undefined
    ),
    (0, _preactCycle.h)(
      'channels',
      null,
      time ? (0, _preactCycle.h)(_time.Time, { time: time }) : undefined,
      chat ? (0, _preactCycle.h)(_chat.Chat, { chat: chat }) : undefined,
      issues ? (0, _preactCycle.h)(_issues.Issues, { issues: issues }) : undefined,
      game ? (0, _preactCycle.h)(_game.Game, { game: game }) : undefined,
      location ? (0, _preactCycle.h)(_location.Location, { location: location }) : undefined
    )
  );
};
// jshint ignore:end

exports.Conversation = Conversation;
exports.CHAT_CHANNEL = _chat.CHAT_CHANNEL;
exports.CHAT_CHANNEL_NAME = _chat.CHAT_CHANNEL_NAME;
exports.ISSUES_CHANNEL = _issues.ISSUES_CHANNEL;
exports.ISSUES_CHANNEL_NAME = _issues.ISSUES_CHANNEL_NAME;
exports.GAME_CHANNEL = _game.GAME_CHANNEL;
exports.GAME_CHANNEL_NAME = _game.GAME_CHANNEL_NAME;
exports.TIME_CHANNEL = _time.TIME_CHANNEL;
exports.TIME_CHANNEL_NAME = _time.TIME_CHANNEL_NAME;
exports.LOCATION_CHANNEL = _location.LOCATION_CHANNEL;
exports.LOCATION_CHANNEL_NAME = _location.LOCATION_CHANNEL_NAME;


function renderShortID(id) {
  return id.slice(0, 3).toString() + '..' + id.slice(id.length - 4, id.length - 1).toString();
}

},{"./chat":3,"./game":7,"./issues":8,"./location":9,"./time":11,"preact-cycle":"preact-cycle"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createChannelHandler;
function createChannelHandler(name, handler, contextCreator) {
  return function (_, mutation, partner, channel) {
    var context = contextCreator(partner, channel);

    _.conversations[partner.toString()].channels[name] = context;

    channel.addEventListener('message', mutation(handler, context, 'partner'));
  };
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GAME_CHANNEL_NAME = exports.GAME_CHANNEL = exports.Game = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require('preact');

var _preactCycle = require('preact-cycle');

var _createChannelHandler = require('./createChannelHandler');

var _createChannelHandler2 = _interopRequireDefault(_createChannelHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GAME_CHANNEL_NAME = 'game';

var Player = function Player(color) {
  return {
    commands: [],
    color: color,
    resources: {
      r: { value: 10, max: 100 },
      g: { value: 5, max: 100 },
      b: { value: 0, max: 100 }
    }
  };
};

var Entity = function () {
  function Entity(_ref) {
    var x = _ref.x,
        y = _ref.y,
        vx = _ref.vx,
        vy = _ref.vy,
        color = _ref.color,
        gameState = _ref.gameState;

    _classCallCheck(this, Entity);

    this.init(x, y, vx, vy, color, gameState);
  }

  _createClass(Entity, [{
    key: 'init',
    value: function init(x, y, vx, vy, color, gameState) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.gameState = gameState;

      this.vxp = vx / gameState.ticksPerSecond;
      this.vyp = vy / gameState.ticksPerSecond;

      delete this.dontDraw;
      delete this.return;
    }
  }, {
    key: 'update',
    value: function update() {
      this.x += this.vxp;
      this.y += this.vyp;

      // this.x = Math.min(Math.max(this.x, 0), this.gameState.worldSize.x - 1);
      // this.y = Math.min(Math.max(this.y, 0), this.gameState.worldSize.y - 1);

      if (this.x >= this.gameState.worldSize.x || this.y >= this.gameState.worldSize.y) {
        this.return = true;
        this.dontDraw = true;
      }
    }
  }]);

  return Entity;
}();

function createEntity(gameState, x, y, vx, vy, color) {
  var entity = gameState.entityPool.pop();

  if (entity) {
    console.log('using pool entity');
    entity.init(x, y, vx, vy, color, gameState);
    gameState.entities.push(entity);
    return entity;
  } else return gameState.entities.push(new Entity({ x: x, y: y, vx: vx, vy: vy, color: color, gameState: gameState }));
}

var _ADD_GAME_MESSAGE$COM = {
  ADD_GAME_MESSAGE: function ADD_GAME_MESSAGE(_, game, who, _ref2) {
    var data = _ref2.data;

    console.log(who, data);

    PROCESS_COMMAND(_, game, who, JSON.parse(data));
  },

  COMMAND: function COMMAND(_, game, mutation) {
    var message = { type: 'start' };

    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message, mutation);
    console.log('sent command');
  },

  PROCESS_COMMAND: function PROCESS_COMMAND(_, _ref3, who, message, mutation) {
    var messages = _ref3.messages,
        gameState = _ref3.gameState,
        NEW_FRAME = _ref3.NEW_FRAME;
    var type = message.type,
        data = message.data;


    messages.push(message);

    if (!gameState.started) {
      switch (type) {
        case 'start':
          gameState.started = true;
          gameState.tick = 0;
          gameState.localStart = new Date().getTime();
          gameState.worldSize = { x: 100, y: 50 };
          gameState.players = [Player('rgb(255, 255, 255)'), Player('rgb(255, 64, 64')];
          gameState.localPlayer = who === 'self' ? 0 : 1;
          gameState.remotePlayer = who === 'self' ? 1 : 0;

          runGame(gameState, NEW_FRAME); // should pass mutation?
          break;
      }
    } else {
      switch (type) {
        case 'spawn':
          var playerIndex = who === 'self' ? gameState.localPlayer : gameState.remotePlayer;

          if (gameState.players[playerIndex].resources.r.value > 1) {
            var x = data.x,
                y = data.y;


            createEntity(gameState, x, y, playerIndex === 0 ? 3 : -3, 0, gameState.players[playerIndex].color);

            gameState.players[playerIndex].commands.push(message);

            gameState.players[playerIndex].resources.r.value--;
          }
          break;
      }
    }
  },

  NEW_FRAME: function NEW_FRAME(_, game) {
    // console.log('new frame');
  },

  CANVAS_CLICK: function CANVAS_CLICK(_, game, event) {
    var x = event.x,
        y = event.y,
        _event$target = event.target,
        clientWidth = _event$target.clientWidth,
        width = _event$target.width,
        clientHeight = _event$target.clientHeight,
        height = _event$target.height,
        offsetTop = _event$target.offsetTop,
        offsetLeft = _event$target.offsetLeft,
        message = { type: 'spawn', data: { x: Math.floor((x - offsetLeft) / clientWidth * width), y: Math.floor((y - offsetTop) / clientHeight * height) } };


    game.channel.send(JSON.stringify(message));

    PROCESS_COMMAND(_, game, 'self', message);

    console.log(event);
  }
},
    ADD_GAME_MESSAGE = _ADD_GAME_MESSAGE$COM.ADD_GAME_MESSAGE,
    COMMAND = _ADD_GAME_MESSAGE$COM.COMMAND,
    PROCESS_COMMAND = _ADD_GAME_MESSAGE$COM.PROCESS_COMMAND,
    NEW_FRAME = _ADD_GAME_MESSAGE$COM.NEW_FRAME,
    CANVAS_CLICK = _ADD_GAME_MESSAGE$COM.CANVAS_CLICK;


function runGame(gameState, updateUI) {
  requestAnimationFrame(gameTick);

  function gameTick() {
    gameState.tick++;

    gameState.entities.forEach(function (entity) {
      return entity.update();
    });

    for (var i = gameState.entities.length - 1; i >= 0; i--) {
      var entity = gameState.entities[i];

      if (entity.return) {
        gameState.entities.splice(i, 1);
        gameState.entityPool.push(entity);
      } else entity.update();
    }

    // gameState.entities.forEach(entity => {
    //   entity.x += entity.vxp;
    //   entity.y += entity.vyp;

    //   entity.x = Math.min(Math.max(entity.x, 0), gameState.worldSize.x - 1);
    //   entity.y = Math.min(Math.max(entity.y, 0), gameState.worldSize.y - 1);
    // });

    if (gameState.tick % gameState.ticksPerSecond === 0) {
      gameState.players.forEach(function (_ref4) {
        var resources = _ref4.resources;

        resources.r.value++;
        resources.g.value += 0.5;
        resources.b.value += 0.05;

        resources.r.max = Math.max(resources.r.max, resources.r.value);
        resources.g.max = Math.max(resources.g.max, resources.g.value);
        resources.b.max = Math.max(resources.b.max, resources.b.value);
      });
    }

    requestAnimationFrame(gameTick);

    updateUI();
  }
}

var GAME_CHANNEL = (0, _createChannelHandler2.default)(GAME_CHANNEL_NAME, ADD_GAME_MESSAGE, function (partner, channel) {
  return {
    partner: partner,
    channel: channel,
    start: new Date().getTime(),
    messages: [],
    input: {
      message: undefined
    },
    gameState: {
      tick: 0,
      entities: [],
      entityPool: [],
      players: [],
      ticksPerSecond: 60
    }
  };
});

function setGameMutation(game, mutation) {
  game.mutation = mutation;
  game.NEW_FRAME = mutation(NEW_FRAME);
}

// jshint ignore:start
var Game = function Game(_ref5, _ref6) {
  var game = _ref5.game;
  var mutation = _ref6.mutation;
  return (0, _preactCycle.h)(
    'game',
    null,
    setGameMutation(game, mutation),
    (0, _preactCycle.h)(
      'span',
      null,
      'Game'
    ),
    game.gameState.started ? (0, _preactCycle.h)(GameArea, { game: game }) : (0, _preactCycle.h)(StartGame, { game: game })
  );
};
// jshint ignore:end

// jshint ignore:start
var StartGame = function StartGame(_ref7, _ref8) {
  var game = _ref7.game;
  var mutation = _ref8.mutation;
  return (0, _preactCycle.h)(
    'start-game',
    null,
    (0, _preactCycle.h)(
      'button',
      { onClick: mutation(COMMAND, game, mutation) },
      'Start Game'
    )
  );
};
// jshint ignore:end

// jshint ignore:start
var GameArea = function GameArea(_ref9, _ref10) {
  var game = _ref9.game;
  var mutation = _ref10.mutation;
  return (0, _preactCycle.h)(
    'game-area',
    null,
    (0, _preactCycle.h)(
      'stats',
      null,
      game.gameState.players.map(function (player) {
        return (0, _preactCycle.h)(PlayerStats, { player: player });
      })
    ),
    (0, _preactCycle.h)(Canvas, { game: game, onClick: mutation(CANVAS_CLICK, game) }),
    (0, _preactCycle.h)(
      'message-area',
      null,
      (0, _preactCycle.h)(Messages, { messages: game.messages }),
      game.gameState.players.map(function (player) {
        return (0, _preactCycle.h)(Messages, { messages: player.commands });
      })
    )
  );
};
// jshint ignore:end

// jshint ignore:start
var PlayerStats = function PlayerStats(_ref11) {
  var resources = _ref11.player.resources;
  return (0, _preactCycle.h)(
    'player-stats',
    null,
    Object.keys(resources).map(function (name) {
      return (0, _preactCycle.h)(
        'resource-container',
        { className: name },
        (0, _preactCycle.h)(
          'resource-value',
          null,
          resources[name].value.toFixed(1)
        ),
        (0, _preactCycle.h)('resource-bar', { style: { 'width': resources[name].value / resources[name].max * 100 + '%' } })
      );
    })
  );
};
// jshint ignore:end

// jshint ignore:start
var Messages = function Messages(_ref12) {
  var messages = _ref12.messages;
  return (0, _preactCycle.h)(
    'messages',
    null,
    messages.map(function (_ref13) {
      var data = _ref13.data,
          type = _ref13.type;
      return (0, _preactCycle.h)(
        'div',
        null,
        type
      );
    })
  );
};
// jshint ignore:end

// jshint ignore:start

var Canvas = function (_Component) {
  _inherits(Canvas, _Component);

  function Canvas() {
    _classCallCheck(this, Canvas);

    return _possibleConstructorReturn(this, (Canvas.__proto__ || Object.getPrototypeOf(Canvas)).apply(this, arguments));
  }

  _createClass(Canvas, [{
    key: 'setCanvas',
    value: function setCanvas(canvas) {
      this.canvas = canvas;
      this.canvasContext = this.canvasContext || canvas.getContext('2d');
      this.canvasContext.imageSmoothingEnabled = false;
      this.canvasContext.webkitImageSmoothingEnabled = false;
      this.canvasContext.msImageSmoothingEnabled = false;
      // console.log('canvas', canvas);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.game = this.props.game;

      requestAnimationFrame(this.animate.bind(this));
    }
  }, {
    key: 'animate',
    value: function animate() {
      var _this2 = this;

      this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
      this.canvasContext.fillRect(0, 0, 500, 250);

      this.game.gameState.entities.forEach(function (_ref14) {
        var x = _ref14.x,
            y = _ref14.y,
            color = _ref14.color,
            dontDraw = _ref14.dontDraw;

        if (!dontDraw) {
          _this2.canvasContext.fillStyle = color;
          _this2.canvasContext.fillRect(x, y, 1, 1);
        }
      });

      requestAnimationFrame(this.animate.bind(this));
    }
  }, {
    key: 'render',
    value: function render(_ref15) {
      var game = _ref15.game,
          onClick = _ref15.onClick;

      return (0, _preactCycle.h)('canvas', { width: '100', height: '50', ref: this.setCanvas.bind(this), onClick: onClick });
    }
  }]);

  return Canvas;
}(_preact.Component);
// jshint ignore:end

exports.Game = Game;
exports.GAME_CHANNEL = GAME_CHANNEL;
exports.GAME_CHANNEL_NAME = GAME_CHANNEL_NAME;

},{"./createChannelHandler":6,"preact":1,"preact-cycle":"preact-cycle"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ISSUES_CHANNEL_NAME = exports.ISSUES_CHANNEL = exports.Issues = undefined;

var _preactCycle = require('preact-cycle');

var _createChannelHandler = require('./createChannelHandler');

var _createChannelHandler2 = _interopRequireDefault(_createChannelHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ISSUES_CHANNEL_NAME = 'issues';

var _PROCESS_ISSUE_MESSAG = {
  PROCESS_ISSUE_MESSAGE: function PROCESS_ISSUE_MESSAGE(_, issue, type, _ref) {
    var data = _ref.data;

    ADD_ISSUE(_, issue, 'partner', JSON.parse(data));
  },

  NEW_ISSUE: function NEW_ISSUE(_, issues) {
    var message = issues.input.message,
        data = { time: new Date().getTime(), message: message, creator: _.signaler.currentId.toString() };


    ADD_ISSUE(_, issues, 'self', data);

    issues.channel.send(JSON.stringify(data));
    issues.input.message = '';
  },

  ADD_ISSUE: function ADD_ISSUE(_, issues, type, data) {
    var issue = { id: issues.issues.length + 1, messages: [data] };

    issues.messages.push(issue);
    issues.issues.push(issue);

    SHOW_ISSUE(_, issues, issue);
  },

  ISSUES_MESSAGE_INPUT: function ISSUES_MESSAGE_INPUT(_, issues, _ref2) {
    var value = _ref2.target.value;

    issues.input.message = value;
  },

  SHOW_ISSUE: function SHOW_ISSUE(_, issues, issue) {
    issues.issueDetail = issue;
  }
},
    PROCESS_ISSUE_MESSAGE = _PROCESS_ISSUE_MESSAG.PROCESS_ISSUE_MESSAGE,
    NEW_ISSUE = _PROCESS_ISSUE_MESSAG.NEW_ISSUE,
    ADD_ISSUE = _PROCESS_ISSUE_MESSAG.ADD_ISSUE,
    ISSUES_MESSAGE_INPUT = _PROCESS_ISSUE_MESSAG.ISSUES_MESSAGE_INPUT,
    SHOW_ISSUE = _PROCESS_ISSUE_MESSAG.SHOW_ISSUE;


var ISSUES_CHANNEL = (0, _createChannelHandler2.default)(ISSUES_CHANNEL_NAME, PROCESS_ISSUE_MESSAGE, function (partner, channel) {
  return {
    partner: partner,
    channel: channel,
    issues: [],
    messages: [],
    input: {
      message: undefined
    }
  };
});

// jshint ignore:start
var Issues = function Issues(_ref3, _ref4) {
  var issues = _ref3.issues;
  var mutation = _ref4.mutation;
  return (0, _preactCycle.h)(
    'issues',
    null,
    (0, _preactCycle.h)(
      'div',
      null,
      'Issues'
    ),
    (0, _preactCycle.h)(
      'issue-list',
      null,
      issues.issues.map(function (issue) {
        return (0, _preactCycle.h)(
          'issue-id',
          { onClick: mutation(SHOW_ISSUE, issues, issue), className: { 'shown': issue === issues.issueDetail } },
          issue.id
        );
      })
    ),
    (0, _preactCycle.h)(
      'issue-detail',
      null,
      issues.issueDetail ? (0, _preactCycle.h)(Issue, { issue: issues.issueDetail }) : undefined
    ),
    (0, _preactCycle.h)(
      'issue-input',
      null,
      (0, _preactCycle.h)(
        'form',
        { onSubmit: mutation(NEW_ISSUE, issues), action: 'javascript:', autoFocus: true },
        (0, _preactCycle.h)('input', { type: 'text', value: issues.input.message, onInput: mutation(ISSUES_MESSAGE_INPUT, issues), placeholder: 'Type your issue here...' }),
        (0, _preactCycle.h)(
          'button',
          null,
          'New Issue'
        )
      )
    )
  );
};
// jshint ignore:end

// jshint ignore:start
var Issue = function Issue(_ref5) {
  var _ref5$issue = _ref5.issue,
      id = _ref5$issue.id,
      messages = _ref5$issue.messages;
  return (0, _preactCycle.h)(
    'issue',
    null,
    (0, _preactCycle.h)(
      'messages',
      null,
      messages.map(function (_ref6) {
        var message = _ref6.message;
        return (0, _preactCycle.h)(
          'message',
          null,
          message
        );
      })
    )
  );
};
// jshint ignore:end


exports.Issues = Issues;
exports.ISSUES_CHANNEL = ISSUES_CHANNEL;
exports.ISSUES_CHANNEL_NAME = ISSUES_CHANNEL_NAME;

},{"./createChannelHandler":6,"preact-cycle":"preact-cycle"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LOCATION_CHANNEL_NAME = exports.LOCATION_CHANNEL = exports.Location = undefined;

var _preactCycle = require('preact-cycle');

var _createChannelHandler = require('./createChannelHandler');

var _createChannelHandler2 = _interopRequireDefault(_createChannelHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOCATION_CHANNEL_NAME = 'time';

// jshint ignore:start
var _ADD_LOCATION_MESSAGE = {
  ADD_LOCATION_MESSAGE: function ADD_LOCATION_MESSAGE(_, time, type, _ref) {
    var data = _ref.data;

    if (type === 'partner') {
      var parsed = JSON.parse(data);

      if (parsed.type === 'ping') {
        time.channel.send(JSON.stringify({ type: 'pong', time: new Date().getTime(), yours: parsed.time }));
      } else if (parsed.type === 'pong') {
        var now = new Date().getTime(),
            rtt = now - parsed.yours,
            offset = now - parsed.time,
            latency = (now - parsed.yours) / 2;

        time.partnerClock = parsed.time + latency;

        time.rtt = rtt;
        time.latency = latency;
        time.offset = offset;

        time.maxLatency = Math.max(time.maxLatency || 0, time.latency);
        time.maxOffset = Math.max(time.maxOffset || 0, time.offset);

        time.messages.unshift({ type: 'pingpong', time: new Date().getTime(), data: { rtt: rtt, offset: offset, latency: latency, adjustedPartnerClock: time.partnerClock, localClock: now, diff: now - time.partnerClock } });
      }
    }
  },

  SEND_LOCATION_MESSAGE: function SEND_LOCATION_MESSAGE(_, time) {
    var message = { type: 'ping', time: new Date().getTime() };

    ADD_LOCATION_MESSAGE(_, time, 'self', { data: message });

    time.channel.send(JSON.stringify(message));
  }
},
    ADD_LOCATION_MESSAGE = _ADD_LOCATION_MESSAGE.ADD_LOCATION_MESSAGE,
    SEND_LOCATION_MESSAGE = _ADD_LOCATION_MESSAGE.SEND_LOCATION_MESSAGE,
    TOGGLE_LATENCY_LOG = _ADD_LOCATION_MESSAGE.TOGGLE_LATENCY_LOG;
// jshint ignore: end

var LOCATION_CHANNEL = (0, _createChannelHandler2.default)(LOCATION_CHANNEL_NAME, ADD_LOCATION_MESSAGE, function (partner, channel) {
  return {
    partner: partner,
    channel: channel,
    start: new Date().getTime(),
    messages: [],
    partnerLocation: [],
    yourLocation: [],
    distance: 0
  };
});

var interval = void 0;
function ensurePing(time, mutation) {
  if (!interval) {
    interval = setInterval(mutation(SEND_LOCATION_MESSAGE, time), 1000);
  }
}

window.addEventListener('devicemotion', function (event) {
  return console.log('devicemotion', event);
});
window.addEventListener('deviceorientation', function (event) {
  return console.log('deviceorientation', event);
});

if (window.navigator.geolocation) {
  window.navigator.geolocation.watchPosition(function (position) {
    return console.log('position', position);
  }, function (error) {
    return console.log('position error!', error);
  });
}

// jshint ignore:start
var Location = function Location(_ref2, _ref3) {
  var location = _ref2.location;
  var mutation = _ref3.mutation;
  return (0, _preactCycle.h)(
    'location',
    null,
    'Partner Location: Your Location: Surface Distance:'
  );
};
// jshint ignore: end


exports.Location = Location;
exports.LOCATION_CHANNEL = LOCATION_CHANNEL;
exports.LOCATION_CHANNEL_NAME = LOCATION_CHANNEL_NAME;

},{"./createChannelHandler":6,"preact-cycle":"preact-cycle"}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connect;
// function updateState(state) {
//   for (let partner in peerConnections) sendState(partner, state);
// }

// function sendState(partner, state) {
//   const {dataChannel} = peerConnections[partner];
//   try {
//     dataChannel.send(stringifyState(state));
//   }
//   catch (e) {
//     console.log(`Error sending to ${partner}`, e);
//   }
// }

var SIGNALER_IP = 'localhost',
    //'192.168.0.105',
SIGNALER_PORT = 443,
    HOST = window.location.host; //`${SIGNALER_IP}:${SIGNALER_PORT}`; //8080;

/*
actions:
  set-signaler-status,
  chat-channel,
  partner-message
*/
function connect(id, actions) {
  if (WebSocket && window.crypto) {

    // const socket = new WebSocket(`ws://${SIGNALER_IP}:${SIGNALER_PORT}`);
    var socket = new WebSocket('wss://' + HOST + '/signaler');

    handle(socket, id, actions);

    return function (partner, programs, actions) {
      socket.send(partner);

      var peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
        iceTransports: 'all'
      });

      var data = { connection: peerConnection };
      peerConnections[partner.join(',')] = data;

      programs.forEach(function (program) {
        var dataChannel = createDataChannel(program, peerConnection, actions);
        data[program + 'DataChannel'] = dataChannel;
      });

      peerConnection.createOffer(function (offer) {
        return peerConnection.setLocalDescription(offer).then(function () {
          return socket.send(JSON.stringify(offer));
        });
      }, function (error) {
        return console.log('error', error);
      });

      peerConnection.addEventListener('icecandidate', function (_ref) {
        var candidate = _ref.candidate;

        if (candidate) {
          socket.send(JSON.stringify(candidate));
        }
      });

      peerConnection.addEventListener('icegatheringstatechange', function (event) {
        // actions['set-status'](event.target.iceGatheringState);
      });

      peerConnection.addEventListener('iceconnectionstatechange', function (event) {
        actions['peer']['ice-connection-state'](partner, event.target.iceConnectionState);
      });

      peerConnection.addEventListener('open', function (event) {
        actions['peer']['connection-state'](partner, 'connected');
      });

      peerConnection.addEventListener('close', function (event) {
        actions['peer']['connection-state'](partner, 'closed');
      });

      function createDataChannel(name, peerConnection, actions) {
        var dataChannel = peerConnection.createDataChannel(name);

        dataChannel.addEventListener('open', function () {
          return actions['peer'][name + '-channel-open'](partner, dataChannel);
        });
        // dataChannel.addEventListener('close', () => actions[`${name}-channel-close`](partner, dataChannel));
      }
    };
  }
}

var peerConnections = {};

function handle(socket, id, actions) {
  var queue = [];

  var partner = void 0,
      readingPartner = false;

  socket.addEventListener('open', function (event) {
    actions['signal']['connection-state']('connected');

    socket.send(id);
  });

  function processQueue() {
    queue.forEach(function (message) {
      processPartnerMessage(partner, message);
    });

    queue.splice(0);
  }

  socket.addEventListener('message', function (event) {
    console.log(event);
    var data = event.data;

    if (data instanceof Blob) {
      readingPartner = true;
      var reader = new FileReader();
      reader.addEventListener('load', function () {
        partner = new Uint8Array(reader.result);readingPartner = false;processQueue();
      });
      reader.readAsArrayBuffer(data);
    } else if (data !== '') {
      queue.push(data);

      if (!readingPartner) processQueue();
    }
  });

  socket.addEventListener('close', function () {
    actions['signal']['connection-state']('Not Connected');

    setTimeout(function () {
      return connect(actions);
    }, 5000);
  });

  function processPartnerMessage(partner, data) {
    if (!partner) throw new Error('Protocol error! No Partner!', partner, data);

    var message = JSON.parse(data);

    actions['signal']['partner-message']([partner, message]);

    switch (message.type) {
      case 'offer':
        receiveOffer(partner, message);break;
      case 'answer':
        receiveAnswer(partner, message);break;
      default:
        receiveCandidate(partner, message);break;
    }

    console.log('Message from ' + partner.join(',') + ': ' + data);
  }

  var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

  function receiveOffer(partner, message) {
    var peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
      iceTransports: 'all'
    });

    peerConnections[partner] = { connection: peerConnection, partner: partner };

    peerConnection.addEventListener('datachannel', function (event) {
      var channel = event.channel;


      console.dir(channel);

      peerConnections[partner].dataChannel = channel;

      actions['peer'][channel.label + '-channel-open'](partner, channel);
    });

    peerConnection.setRemoteDescription(message).then(function () {
      return peerConnection.createAnswer().then(function (answer) {
        peerConnection.setLocalDescription(answer);
        socket.send(partner);
        socket.send(JSON.stringify(answer));
      });
    }).catch(function (error) {
      return console.log(error);
    });

    peerConnection.addEventListener('icecandidate', function (_ref2) {
      var candidate = _ref2.candidate;

      if (candidate) {
        if (!readingPartner) socket.send(partner);
        socket.send(JSON.stringify(candidate));
      }
    });

    peerConnection.addEventListener('iceconnectionstatechange', function (event) {
      actions['peer']['ice-connection-state'](partner, event.target.iceConnectionState);
    });
  }

  function receiveAnswer(partner, message) {
    var connection = peerConnections[partner].connection;

    connection.setRemoteDescription(message);
  }

  function receiveCandidate(partner, candidate) {
    var connection = peerConnections[partner].connection;

    connection.addIceCandidate(candidate);
  }
}

function stringifyState(state) {
  return JSON.stringify(state, function (k, v) {
    if (v instanceof Uint8Array) {
      return Array.from(v);
    }
    return v;
  });
}

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIME_CHANNEL_NAME = exports.TIME_CHANNEL = exports.Time = undefined;

var _preactCycle = require('preact-cycle');

var _createChannelHandler = require('./createChannelHandler');

var _createChannelHandler2 = _interopRequireDefault(_createChannelHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIME_CHANNEL_NAME = 'time';

// jshint ignore:start
var _ADD_TIME_MESSAGE$SEN = {
  ADD_TIME_MESSAGE: function ADD_TIME_MESSAGE(_, time, type, _ref) {
    var data = _ref.data;

    if (type === 'partner') {
      var parsed = JSON.parse(data);

      if (parsed.type === 'ping') {
        time.channel.send(JSON.stringify({ type: 'pong', time: new Date().getTime(), yours: parsed.time }));
      } else if (parsed.type === 'pong') {
        var now = new Date().getTime(),
            rtt = now - parsed.yours,
            offset = now - parsed.time,
            latency = (now - parsed.yours) / 2;

        time.partnerClock = parsed.time + latency;

        time.rtt = rtt;
        time.latency = latency;
        time.offset = offset;

        time.maxLatency = Math.max(time.maxLatency || 0, time.latency);
        time.maxOffset = Math.max(time.maxOffset || 0, time.offset);

        time.messages.unshift({ type: 'pingpong', time: new Date().getTime(), data: { rtt: rtt, offset: offset, latency: latency, adjustedPartnerClock: time.partnerClock, localClock: now, diff: now - time.partnerClock } });
      }
    }
  },

  SEND_TIME_MESSAGE: function SEND_TIME_MESSAGE(_, time) {
    var message = { type: 'ping', time: new Date().getTime() };

    ADD_TIME_MESSAGE(_, time, 'self', { data: message });

    time.channel.send(JSON.stringify(message));
  },

  TOGGLE_LATENCY_LOG: function TOGGLE_LATENCY_LOG(_, time) {
    time.showLog = !time.showLog;
  }
},
    ADD_TIME_MESSAGE = _ADD_TIME_MESSAGE$SEN.ADD_TIME_MESSAGE,
    SEND_TIME_MESSAGE = _ADD_TIME_MESSAGE$SEN.SEND_TIME_MESSAGE,
    TOGGLE_LATENCY_LOG = _ADD_TIME_MESSAGE$SEN.TOGGLE_LATENCY_LOG;
// jshint ignore: end

var TIME_CHANNEL = (0, _createChannelHandler2.default)(TIME_CHANNEL_NAME, ADD_TIME_MESSAGE, function (partner, channel) {
  return {
    partner: partner,
    channel: channel,
    start: new Date().getTime(),
    messages: [],
    latency: 0,
    maxLatency: 0
  };
});

var interval = void 0;
function ensurePing(time, mutation) {
  if (!interval) {
    interval = setInterval(mutation(SEND_TIME_MESSAGE, time), 1000);
  }
}

// jshint ignore:start
var Time = function Time(_ref2, _ref3) {
  var time = _ref2.time;
  var mutation = _ref3.mutation;
  return (0, _preactCycle.h)(
    'time',
    null,
    ensurePing(time, mutation),
    (0, _preactCycle.h)(
      'info',
      null,
      (0, _preactCycle.h)(
        'name',
        { className: { 'show-log': time.showLog }, onClick: mutation(TOGGLE_LATENCY_LOG, time) },
        (0, _preactCycle.h)(
          'toggle',
          null,
          'v'
        ),
        'Latency'
      ),
      (0, _preactCycle.h)(BinnedSeries, { bins: 5, max: time.maxLatency, valueSelector: function valueSelector(_ref4) {
          var data = _ref4.data;
          return data.latency;
        }, data: time.messages.slice(0, 10).reverse() }),
      (0, _preactCycle.h)(
        'latency',
        null,
        (0, _preactCycle.h)(
          'max-latency',
          null,
          time.maxLatency.toFixed(1),
          'ms max'
        ),
        (0, _preactCycle.h)(
          'value',
          null,
          time.latency.toFixed(1),
          'ms'
        )
      )
    ),
    time.showLog ? (0, _preactCycle.h)(Messages, { messages: time.messages, start: time.start }) : undefined
  );
};
// jshint ignore: end

// jshint ignore:start
var BinnedSeries = function BinnedSeries(_ref5) {
  var bins = _ref5.bins,
      data = _ref5.data,
      max = _ref5.max,
      valueSelector = _ref5.valueSelector;
  return (0, _preactCycle.h)(
    'binned-series',
    null,
    data.map(function (item) {
      return (0, _preactCycle.h)('point', { style: { 'top': 100 * (1 - 1 / bins - 1 / bins * Math.floor(valueSelector(item) / (max / bins))) + '%' } });
    })
  );
};
// jshint ignore: end

// jshint ignore:start
var Messages = function Messages(_ref6) {
  var messages = _ref6.messages,
      start = _ref6.start;
  return (0, _preactCycle.h)(
    'messages',
    null,
    messages.slice(0, 2).map(function (_ref7) {
      var type = _ref7.type,
          data = _ref7.data,
          time = _ref7.time;
      return (0, _preactCycle.h)(
        'message',
        { className: type },
        (0, _preactCycle.h)(
          'container',
          { className: 'message-time-' + 5 * Math.round(100 * (time - start) / (new Date().getTime() - start) / 5) },
          (0, _preactCycle.h)(
            'data',
            null,
            JSON.stringify(data)
          )
        )
      );
    })
  );
};
// jshint ignore:end


exports.Time = Time;
exports.TIME_CHANNEL = TIME_CHANNEL;
exports.TIME_CHANNEL_NAME = TIME_CHANNEL_NAME;

},{"./createChannelHandler":6,"preact-cycle":"preact-cycle"}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJlYWN0L2Rpc3QvcHJlYWN0LmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGF0LmpzIiwic3JjL2NvbnNvbGUuanMiLCJzcmMvY29udmVyc2F0aW9uLmpzIiwic3JjL2NyZWF0ZUNoYW5uZWxIYW5kbGVyLmpzIiwic3JjL2dhbWUuanMiLCJzcmMvaXNzdWVzLmpzIiwic3JjL2xvY2F0aW9uLmpzIiwic3JjL3NlcnZlci5qcyIsInNyYy90aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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SSxJQUFMLEdBQWEsS0FBSyxLQUFMLENBQVcsY0FBYyxJQUFkLEtBQXVCLE1BQU0sSUFBN0IsQ0FBWCxDQUFyQyxJQUF1RixHQUEvRixFQUFkLEdBQVI7QUFBQSxLQUFUO0FBREgsR0FEbUI7QUFBQSxDQUFyQjtBQUtBOztBQUVBO0FBQ0EsSUFBTSxXQUFXLFNBQVgsUUFBVztBQUFBLE1BQUUsUUFBRixTQUFFLFFBQUY7QUFBQSxNQUFZLEtBQVosU0FBWSxLQUFaO0FBQUEsU0FDZjtBQUFBO0FBQUE7QUFDRyxhQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCLEdBQXJCLENBQXlCO0FBQUEsVUFBRSxJQUFGLFNBQUUsSUFBRjtBQUFBLFVBQVEsSUFBUixTQUFRLElBQVI7QUFBQSxVQUFjLElBQWQsU0FBYyxJQUFkO0FBQUEsYUFDeEI7QUFBQTtBQUFBLFVBQVMsV0FBVyxJQUFwQjtBQUNFO0FBQUE7QUFBQSxZQUFXLDZCQUEyQixJQUFJLEtBQUssS0FBTCxDQUFXLE9BQU8sT0FBTyxLQUFkLEtBQXdCLElBQUksSUFBSixHQUFXLE9BQVgsS0FBdUIsS0FBL0MsSUFBd0QsQ0FBbkUsQ0FBMUM7QUFDRTtBQUFBO0FBQUE7QUFBTyxpQkFBSyxTQUFMLENBQWUsSUFBZjtBQUFQO0FBREY7QUFERixPQUR3QjtBQUFBLEtBQXpCO0FBREgsR0FEZTtBQUFBLENBQWpCO0FBV0E7OztRQUdRLEksR0FBQSxJO1FBQU0sWSxHQUFBLFk7UUFBYyxpQixHQUFBLGlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiFmdW5jdGlvbihnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICAnb2JqZWN0JyA9PSB0eXBlb2YgZXhwb3J0cyAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlID8gZmFjdG9yeShleHBvcnRzKSA6ICdmdW5jdGlvbicgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsgJ2V4cG9ydHMnIF0sIGZhY3RvcnkpIDogZmFjdG9yeShnbG9iYWwucHJlYWN0ID0gZ2xvYmFsLnByZWFjdCB8fCB7fSk7XG59KHRoaXMsIGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICBmdW5jdGlvbiBWTm9kZShub2RlTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHRoaXMua2V5ID0gYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmtleTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaChub2RlTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgY2hpbGRyZW4sIGxhc3RTaW1wbGUsIGNoaWxkLCBzaW1wbGUsIGk7XG4gICAgICAgIGZvciAoaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkgc3RhY2sucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgaW5zdGFuY2VvZiBBcnJheSkgZm9yIChpID0gY2hpbGQubGVuZ3RoOyBpLS07ICkgc3RhY2sucHVzaChjaGlsZFtpXSk7IGVsc2UgaWYgKG51bGwgIT0gY2hpbGQgJiYgY2hpbGQgIT09ICEwICYmIGNoaWxkICE9PSAhMSkge1xuICAgICAgICAgICAgaWYgKCdudW1iZXInID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBTdHJpbmcoY2hpbGQpO1xuICAgICAgICAgICAgc2ltcGxlID0gJ3N0cmluZycgPT0gdHlwZW9mIGNoaWxkO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSAmJiBsYXN0U2ltcGxlKSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSArPSBjaGlsZDsgZWxzZSB7XG4gICAgICAgICAgICAgICAgKGNoaWxkcmVuIHx8IChjaGlsZHJlbiA9IFtdKSkucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgbGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgcCA9IG5ldyBWTm9kZShub2RlTmFtZSwgYXR0cmlidXRlcyB8fCB2b2lkIDAsIGNoaWxkcmVuIHx8IEVNUFRZX0NISUxEUkVOKTtcbiAgICAgICAgaWYgKG9wdGlvbnMudm5vZGUpIG9wdGlvbnMudm5vZGUocCk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleHRlbmQob2JqLCBwcm9wcykge1xuICAgICAgICBpZiAocHJvcHMpIGZvciAodmFyIGkgaW4gcHJvcHMpIG9ialtpXSA9IHByb3BzW2ldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgb2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVsdmUob2JqLCBrZXkpIHtcbiAgICAgICAgZm9yICh2YXIgcCA9IGtleS5zcGxpdCgnLicpLCBpID0gMDsgaSA8IHAubGVuZ3RoICYmIG9iajsgaSsrKSBvYmogPSBvYmpbcFtpXV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiAnZnVuY3Rpb24nID09IHR5cGVvZiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xuICAgICAgICByZXR1cm4gJ3N0cmluZycgPT0gdHlwZW9mIG9iajtcbiAgICB9XG4gICAgZnVuY3Rpb24gaGFzaFRvQ2xhc3NOYW1lKGMpIHtcbiAgICAgICAgdmFyIHN0ciA9ICcnO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIGMpIGlmIChjW3Byb3BdKSB7XG4gICAgICAgICAgICBpZiAoc3RyKSBzdHIgKz0gJyAnO1xuICAgICAgICAgICAgc3RyICs9IHByb3A7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVFbGVtZW50KHZub2RlLCBwcm9wcykge1xuICAgICAgICByZXR1cm4gaCh2bm9kZS5ub2RlTmFtZSwgZXh0ZW5kKGNsb25lKHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVMaW5rZWRTdGF0ZShjb21wb25lbnQsIGtleSwgZXZlbnRQYXRoKSB7XG4gICAgICAgIHZhciBwYXRoID0ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdCA9IGUgJiYgZS50YXJnZXQgfHwgdGhpcywgc3RhdGUgPSB7fSwgb2JqID0gc3RhdGUsIHYgPSBpc1N0cmluZyhldmVudFBhdGgpID8gZGVsdmUoZSwgZXZlbnRQYXRoKSA6IHQubm9kZU5hbWUgPyB0LnR5cGUubWF0Y2goL15jaGV8cmFkLykgPyB0LmNoZWNrZWQgOiB0LnZhbHVlIDogZSwgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKDtpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIG9iaiA9IG9ialtwYXRoW2ldXSB8fCAob2JqW3BhdGhbaV1dID0gIWkgJiYgY29tcG9uZW50LnN0YXRlW3BhdGhbaV1dIHx8IHt9KTtcbiAgICAgICAgICAgIG9ialtwYXRoW2ldXSA9IHY7XG4gICAgICAgICAgICBjb21wb25lbnQuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fZGlydHkgJiYgKGNvbXBvbmVudC5fZGlydHkgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IGRlZmVyKShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9kaXJ0eSkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uYWxDb21wb25lbnQodm5vZGUpIHtcbiAgICAgICAgdmFyIG5vZGVOYW1lID0gdm5vZGUgJiYgdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlTmFtZSAmJiBpc0Z1bmN0aW9uKG5vZGVOYW1lKSAmJiAhKG5vZGVOYW1lLnByb3RvdHlwZSAmJiBub2RlTmFtZS5wcm90b3R5cGUucmVuZGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYnVpbGRGdW5jdGlvbmFsQ29tcG9uZW50KHZub2RlLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB2bm9kZS5ub2RlTmFtZShnZXROb2RlUHJvcHModm5vZGUpLCBjb250ZXh0IHx8IEVNUFRZKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUobm9kZSwgdm5vZGUpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nKHZub2RlKSkgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBUZXh0O1xuICAgICAgICBpZiAoaXNTdHJpbmcodm5vZGUubm9kZU5hbWUpKSByZXR1cm4gIW5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yICYmIGlzTmFtZWROb2RlKG5vZGUsIHZub2RlLm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odm5vZGUubm9kZU5hbWUpKSByZXR1cm4gKG5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yID8gbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lIDogITApIHx8IGlzRnVuY3Rpb25hbENvbXBvbmVudCh2bm9kZSk7IGVsc2UgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc05hbWVkTm9kZShub2RlLCBub2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5ub3JtYWxpemVkTm9kZU5hbWUgPT09IG5vZGVOYW1lIHx8IHRvTG93ZXJDYXNlKG5vZGUubm9kZU5hbWUpID09PSB0b0xvd2VyQ2FzZShub2RlTmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE5vZGVQcm9wcyh2bm9kZSkge1xuICAgICAgICB2YXIgcHJvcHMgPSBjbG9uZSh2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKGRlZmF1bHRQcm9wcykgZm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIGlmICh2b2lkIDAgPT09IHByb3BzW2ldKSBwcm9wc1tpXSA9IGRlZmF1bHRQcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHAgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwKSBwLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiB2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHZhbHVlID0gaGFzaFRvQ2xhc3NOYW1lKHZhbHVlKTtcbiAgICAgICAgaWYgKCdrZXknID09PSBuYW1lKSA7IGVsc2UgaWYgKCdjbGFzcycgPT09IG5hbWUgJiYgIWlzU3ZnKSBub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnOyBlbHNlIGlmICgnc3R5bGUnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8IGlzU3RyaW5nKHZhbHVlKSB8fCBpc1N0cmluZyhvbGQpKSBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzU3RyaW5nKG9sZCkpIGZvciAodmFyIGkgaW4gb2xkKSBpZiAoIShpIGluIHZhbHVlKSkgbm9kZS5zdHlsZVtpXSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIG5vZGUuc3R5bGVbaV0gPSAnbnVtYmVyJyA9PSB0eXBlb2YgdmFsdWVbaV0gJiYgIU5PTl9ESU1FTlNJT05fUFJPUFNbaV0gPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIG5vZGUuaW5uZXJIVE1MID0gdmFsdWUuX19odG1sIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKCdvJyA9PSBuYW1lWzBdICYmICduJyA9PSBuYW1lWzFdKSB7XG4gICAgICAgICAgICB2YXIgbCA9IG5vZGUuX2xpc3RlbmVycyB8fCAobm9kZS5fbGlzdGVuZXJzID0ge30pO1xuICAgICAgICAgICAgbmFtZSA9IHRvTG93ZXJDYXNlKG5hbWUuc3Vic3RyaW5nKDIpKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghbFtuYW1lXSkgbm9kZS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksICEhTk9OX0JVQkJMSU5HX0VWRU5UU1tuYW1lXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxbbmFtZV0pIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCAhIU5PTl9CVUJCTElOR19FVkVOVFNbbmFtZV0pO1xuICAgICAgICAgICAgbFtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgdmFsdWUgPT09ICExKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUubWF0Y2goL154bGlua1xcOj8oLispLyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gITEpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIHRvTG93ZXJDYXNlKG5zWzFdKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdvYmplY3QnICE9IHR5cGVvZiB2YWx1ZSAmJiAhaXNGdW5jdGlvbih2YWx1ZSkpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIHRvTG93ZXJDYXNlKG5zWzFdKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpc3RlbmVyc1tlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdE5vZGUobm9kZSkge1xuICAgICAgICByZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgIG5vZGUuX2NvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBfbmFtZSA9IG5vZGUubm9ybWFsaXplZE5vZGVOYW1lIHx8IHRvTG93ZXJDYXNlKG5vZGUubm9kZU5hbWUpO1xuICAgICAgICAgICAgKG5vZGVzW19uYW1lXSB8fCAobm9kZXNbX25hbWVdID0gW10pKS5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBuYW1lID0gdG9Mb3dlckNhc2Uobm9kZU5hbWUpLCBub2RlID0gbm9kZXNbbmFtZV0gJiYgbm9kZXNbbmFtZV0ucG9wKCkgfHwgKGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpKTtcbiAgICAgICAgbm9kZS5ub3JtYWxpemVkTm9kZU5hbWUgPSBuYW1lO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJNb3VudCkgb3B0aW9ucy5hZnRlck1vdW50KGMpO1xuICAgICAgICAgICAgaWYgKGMuY29tcG9uZW50RGlkTW91bnQpIGMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBwYXJlbnQsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgaWYgKCFkaWZmTGV2ZWwrKykge1xuICAgICAgICAgICAgaXNTdmdNb2RlID0gcGFyZW50ICYmIHZvaWQgMCAhPT0gcGFyZW50Lm93bmVyU1ZHRWxlbWVudDtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9IGRvbSAmJiAhKEFUVFJfS0VZIGluIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldCA9IGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgaWYgKHBhcmVudCAmJiByZXQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQocmV0KTtcbiAgICAgICAgaWYgKCEtLWRpZmZMZXZlbCkge1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gITE7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudFJvb3QpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgdmFyIHJlZiA9IHZub2RlICYmIHZub2RlLmF0dHJpYnV0ZXMgJiYgdm5vZGUuYXR0cmlidXRlcy5yZWY7XG4gICAgICAgIHdoaWxlIChpc0Z1bmN0aW9uYWxDb21wb25lbnQodm5vZGUpKSB2bm9kZSA9IGJ1aWxkRnVuY3Rpb25hbENvbXBvbmVudCh2bm9kZSwgY29udGV4dCk7XG4gICAgICAgIGlmIChudWxsID09IHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoaXNTdHJpbmcodm5vZGUpKSB7XG4gICAgICAgICAgICBpZiAoZG9tICYmIGRvbSBpbnN0YW5jZW9mIFRleHQgJiYgZG9tLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkgZG9tLm5vZGVWYWx1ZSA9IHZub2RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSByZWNvbGxlY3ROb2RlVHJlZShkb20pO1xuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkb207XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odm5vZGUubm9kZU5hbWUpKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICB2YXIgb3V0ID0gZG9tLCBub2RlTmFtZSA9IFN0cmluZyh2bm9kZS5ub2RlTmFtZSksIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlLCB2Y2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaXNTdmdNb2RlID0gJ3N2ZycgPT09IG5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IG5vZGVOYW1lID8gITEgOiBpc1N2Z01vZGU7XG4gICAgICAgIGlmICghZG9tKSBvdXQgPSBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Z01vZGUpOyBlbHNlIGlmICghaXNOYW1lZE5vZGUoZG9tLCBub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIG91dCA9IGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIG91dC5hcHBlbmRDaGlsZChkb20uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmYyA9IG91dC5maXJzdENoaWxkLCBwcm9wcyA9IG91dFtBVFRSX0tFWV07XG4gICAgICAgIGlmICghcHJvcHMpIHtcbiAgICAgICAgICAgIG91dFtBVFRSX0tFWV0gPSBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IG91dC5hdHRyaWJ1dGVzLCBpID0gYS5sZW5ndGg7IGktLTsgKSBwcm9wc1thW2ldLm5hbWVdID0gYVtpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWh5ZHJhdGluZyAmJiB2Y2hpbGRyZW4gJiYgMSA9PT0gdmNoaWxkcmVuLmxlbmd0aCAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmNoaWxkcmVuWzBdICYmIGZjICYmIGZjIGluc3RhbmNlb2YgVGV4dCAmJiAhZmMubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChmYy5ub2RlVmFsdWUgIT0gdmNoaWxkcmVuWzBdKSBmYy5ub2RlVmFsdWUgPSB2Y2hpbGRyZW5bMF07XG4gICAgICAgIH0gZWxzZSBpZiAodmNoaWxkcmVuICYmIHZjaGlsZHJlbi5sZW5ndGggfHwgZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCAhIXByb3BzLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MKTtcbiAgICAgICAgZGlmZkF0dHJpYnV0ZXMob3V0LCB2bm9kZS5hdHRyaWJ1dGVzLCBwcm9wcyk7XG4gICAgICAgIGlmIChyZWYpIChwcm9wcy5yZWYgPSByZWYpKG91dCk7XG4gICAgICAgIGlzU3ZnTW9kZSA9IHByZXZTdmdNb2RlO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbm5lckRpZmZOb2RlKGRvbSwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgYWJzb3JiKSB7XG4gICAgICAgIHZhciBqLCBjLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICBpZiAobGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGRbQVRUUl9LRVldLCBrZXkgPSB2bGVuID8gKGMgPSBfY2hpbGQuX2NvbXBvbmVudCkgPyBjLl9fa2V5IDogcHJvcHMgPyBwcm9wcy5rZXkgOiBudWxsIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaHlkcmF0aW5nIHx8IGFic29yYiB8fCBwcm9wcyB8fCBfY2hpbGQgaW5zdGFuY2VvZiBUZXh0KSBjaGlsZHJlbltjaGlsZHJlbkxlbisrXSA9IF9jaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCB2bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZjaGlsZCA9IHZjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBrZXkgPSB2Y2hpbGQua2V5O1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleWVkTGVuICYmIGtleSBpbiBrZXllZCkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IGtleWVkW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIGtleWVkTGVuLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hpbGQgJiYgbWluIDwgY2hpbGRyZW5MZW4pIGZvciAoaiA9IG1pbjsgaiA8IGNoaWxkcmVuTGVuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjID0gY2hpbGRyZW5bal07XG4gICAgICAgICAgICAgICAgaWYgKGMgJiYgaXNTYW1lTm9kZVR5cGUoYywgdmNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IGM7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuW2pdID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gbWluKSBtaW4rKztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQgIT09IGRvbSkgaWYgKGkgPj0gbGVuKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCAhPT0gb3JpZ2luYWxDaGlsZHJlbltpXSkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gb3JpZ2luYWxDaGlsZHJlbltpICsgMV0pIHJlbW92ZU5vZGUob3JpZ2luYWxDaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbltpXSB8fCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmIChrZXllZFtpXSkgcmVjb2xsZWN0Tm9kZVRyZWUoa2V5ZWRbaV0pO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSB7XG4gICAgICAgICAgICBjaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuTGVuLS1dO1xuICAgICAgICAgICAgaWYgKGNoaWxkKSByZWNvbGxlY3ROb2RlVHJlZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgdW5tb3VudE9ubHkpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkgdW5tb3VudENvbXBvbmVudChjb21wb25lbnQsICF1bm1vdW50T25seSk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG5vZGVbQVRUUl9LRVldICYmIG5vZGVbQVRUUl9LRVldLnJlZikgbm9kZVtBVFRSX0tFWV0ucmVmKG51bGwpO1xuICAgICAgICAgICAgaWYgKCF1bm1vdW50T25seSkgY29sbGVjdE5vZGUobm9kZSk7XG4gICAgICAgICAgICB2YXIgYztcbiAgICAgICAgICAgIHdoaWxlIChjID0gbm9kZS5sYXN0Q2hpbGQpIHJlY29sbGVjdE5vZGVUcmVlKGMsIHVubW91bnRPbmx5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICghKGF0dHJzICYmIG5hbWUgaW4gYXR0cnMpICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBpZiAoYXR0cnMpIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZSwgbGlzdCA9IGNvbXBvbmVudHNbbmFtZV07XG4gICAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goY29tcG9uZW50KTsgZWxzZSBjb21wb25lbnRzW25hbWVdID0gWyBjb21wb25lbnQgXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpLCBsaXN0ID0gY29tcG9uZW50c1tDdG9yLm5hbWVdO1xuICAgICAgICBDb21wb25lbnQuY2FsbChpbnN0LCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIGlmIChsaXN0KSBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSBpZiAobGlzdFtpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5uZXh0QmFzZSA9IGxpc3RbaV0ubmV4dEJhc2U7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCBvcHRzLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fZGlzYWJsZSkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlID0gITA7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcmVmID0gcHJvcHMucmVmKSBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX2tleSA9IHByb3BzLmtleSkgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5wcmV2Q29udGV4dCkgY29tcG9uZW50LnByZXZDb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQucHJldlByb3BzKSBjb21wb25lbnQucHJldlByb3BzID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX2Rpc2FibGUgPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSBvcHRzKSBpZiAoMSA9PT0gb3B0cyB8fCBvcHRpb25zLnN5bmNDb21wb25lbnRVcGRhdGVzICE9PSAhMSB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcmVmKSBjb21wb25lbnQuX19yZWYoY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBvcHRzLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fZGlzYWJsZSkge1xuICAgICAgICAgICAgdmFyIHNraXAsIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQucHJldlByb3BzIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50LnByZXZTdGF0ZSB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50LnByZXZDb250ZXh0IHx8IGNvbnRleHQsIGlzVXBkYXRlID0gY29tcG9uZW50LmJhc2UsIG5leHRCYXNlID0gY29tcG9uZW50Lm5leHRCYXNlLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgICAgIGlmIChpc1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByZXZpb3VzUHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gcHJldmlvdXNTdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IHByZXZpb3VzQ29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAoMiAhPT0gb3B0cyAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KSA9PT0gITEpIHNraXAgPSAhMDsgZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50LnByZXZQcm9wcyA9IGNvbXBvbmVudC5wcmV2U3RhdGUgPSBjb21wb25lbnQucHJldkNvbnRleHQgPSBjb21wb25lbnQubmV4dEJhc2UgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXJ0eSA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5yZW5kZXIpIHJlbmRlcmVkID0gY29tcG9uZW50LnJlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSBjb250ZXh0ID0gZXh0ZW5kKGNsb25lKGNvbnRleHQpLCBjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KCkpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChpc0Z1bmN0aW9uYWxDb21wb25lbnQocmVuZGVyZWQpKSByZW5kZXJlZCA9IGJ1aWxkRnVuY3Rpb25hbENvbXBvbmVudChyZW5kZXJlZCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVW5tb3VudCwgYmFzZSwgY2hpbGRDb21wb25lbnQgPSByZW5kZXJlZCAmJiByZW5kZXJlZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihjaGlsZENvbXBvbmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdCAmJiBpbnN0LmNvbnN0cnVjdG9yID09PSBjaGlsZENvbXBvbmVudCAmJiBjaGlsZFByb3BzLmtleSA9PSBpbnN0Ll9fa2V5KSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0KTsgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbnN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Lm5leHRCYXNlID0gaW5zdC5uZXh0QmFzZSB8fCBuZXh0QmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX3BhcmVudENvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDAsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGluc3QuYmFzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYmFzZSA9IGluaXRpYWxCYXNlO1xuICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIGNiYXNlID0gY29tcG9uZW50Ll9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgfHwgMSA9PT0gb3B0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBkaWZmKGNiYXNlLCByZW5kZXJlZCwgY29udGV4dCwgbW91bnRBbGwgfHwgIWlzVXBkYXRlLCBpbml0aWFsQmFzZSAmJiBpbml0aWFsQmFzZS5wYXJlbnROb2RlLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlICYmIGJhc2UgIT09IGluaXRpYWxCYXNlICYmIGluc3QgIT09IGluaXRpYWxDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVBhcmVudCA9IGluaXRpYWxCYXNlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXJlbnQucmVwbGFjZUNoaWxkKGJhc2UsIGluaXRpYWxCYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9Vbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50LCBiYXNlICE9PSBpbml0aWFsQmFzZSk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlICYmICFpc0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsIHQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0ID0gdC5fcGFyZW50Q29tcG9uZW50KSAoY29tcG9uZW50UmVmID0gdCkuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudCA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPSBjb21wb25lbnRSZWYuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1VwZGF0ZSB8fCBtb3VudEFsbCkgbW91bnRzLnVuc2hpZnQoY29tcG9uZW50KTsgZWxzZSBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBwcmV2aW91c0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyVXBkYXRlKSBvcHRpb25zLmFmdGVyVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZm4sIGNiID0gY29tcG9uZW50Ll9yZW5kZXJDYWxsYmFja3M7XG4gICAgICAgICAgICBpZiAoY2IpIHdoaWxlIChmbiA9IGNiLnBvcCgpKSBmbi5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX3BhcmVudENvbXBvbmVudCkpIGlzT3duZXIgPSBjLmNvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKGMgJiYgaXNPd25lciAmJiAoIW1vdW50QWxsIHx8IGMuX2NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAzLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxDb21wb25lbnQgJiYgIWlzRGlyZWN0T3duZXIpIHtcbiAgICAgICAgICAgICAgICB1bm1vdW50Q29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50LCAhMCk7XG4gICAgICAgICAgICAgICAgZG9tID0gb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgIWMubmV4dEJhc2UpIHtcbiAgICAgICAgICAgICAgICBjLm5leHRCYXNlID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb207XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50LCByZW1vdmUpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuYmVmb3JlVW5tb3VudCkgb3B0aW9ucy5iZWZvcmVVbm1vdW50KGNvbXBvbmVudCk7XG4gICAgICAgIHZhciBiYXNlID0gY29tcG9uZW50LmJhc2U7XG4gICAgICAgIGNvbXBvbmVudC5fZGlzYWJsZSA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyLCByZW1vdmUpOyBlbHNlIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZVtBVFRSX0tFWV0gJiYgYmFzZVtBVFRSX0tFWV0ucmVmKSBiYXNlW0FUVFJfS0VZXS5yZWYobnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQubmV4dEJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgaWYgKHJlbW92ZSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICAgICAgY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGM7XG4gICAgICAgICAgICB3aGlsZSAoYyA9IGJhc2UubGFzdENoaWxkKSByZWNvbGxlY3ROb2RlVHJlZShjLCAhcmVtb3ZlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9uZW50Ll9fcmVmKSBjb21wb25lbnQuX19yZWYobnVsbCk7XG4gICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkVW5tb3VudCkgY29tcG9uZW50LmNvbXBvbmVudERpZFVubW91bnQoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlKSB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50KTtcbiAgICB9XG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICB2YXIgRU1QVFlfQ0hJTERSRU4gPSBbXTtcbiAgICB2YXIgbGNDYWNoZSA9IHt9O1xuICAgIHZhciB0b0xvd2VyQ2FzZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIGxjQ2FjaGVbc10gfHwgKGxjQ2FjaGVbc10gPSBzLnRvTG93ZXJDYXNlKCkpO1xuICAgIH07XG4gICAgdmFyIHJlc29sdmVkID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFByb21pc2UgJiYgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgdmFyIGRlZmVyID0gcmVzb2x2ZWQgPyBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJlc29sdmVkLnRoZW4oZik7XG4gICAgfSA6IHNldFRpbWVvdXQ7XG4gICAgdmFyIEVNUFRZID0ge307XG4gICAgdmFyIEFUVFJfS0VZID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFN5bWJvbCA/IFN5bWJvbC5mb3IoJ3ByZWFjdGF0dHInKSA6ICdfX3ByZWFjdGF0dHJfJztcbiAgICB2YXIgTk9OX0RJTUVOU0lPTl9QUk9QUyA9IHtcbiAgICAgICAgYm94RmxleDogMSxcbiAgICAgICAgYm94RmxleEdyb3VwOiAxLFxuICAgICAgICBjb2x1bW5Db3VudDogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDEsXG4gICAgICAgIGZsZXg6IDEsXG4gICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICBmbGV4UG9zaXRpdmU6IDEsXG4gICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgIGZsZXhOZWdhdGl2ZTogMSxcbiAgICAgICAgZm9udFdlaWdodDogMSxcbiAgICAgICAgbGluZUNsYW1wOiAxLFxuICAgICAgICBsaW5lSGVpZ2h0OiAxLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBvcmRlcjogMSxcbiAgICAgICAgb3JwaGFuczogMSxcbiAgICAgICAgc3Ryb2tlT3BhY2l0eTogMSxcbiAgICAgICAgd2lkb3dzOiAxLFxuICAgICAgICB6SW5kZXg6IDEsXG4gICAgICAgIHpvb206IDFcbiAgICB9O1xuICAgIHZhciBOT05fQlVCQkxJTkdfRVZFTlRTID0ge1xuICAgICAgICBibHVyOiAxLFxuICAgICAgICBlcnJvcjogMSxcbiAgICAgICAgZm9jdXM6IDEsXG4gICAgICAgIGxvYWQ6IDEsXG4gICAgICAgIHJlc2l6ZTogMSxcbiAgICAgICAgc2Nyb2xsOiAxXG4gICAgfTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbm9kZXMgPSB7fTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIGxpbmtTdGF0ZTogZnVuY3Rpb24oa2V5LCBldmVudFBhdGgpIHtcbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5fbGlua2VkU3RhdGVzIHx8ICh0aGlzLl9saW5rZWRTdGF0ZXMgPSB7fSk7XG4gICAgICAgICAgICByZXR1cm4gY1trZXkgKyBldmVudFBhdGhdIHx8IChjW2tleSArIGV2ZW50UGF0aF0gPSBjcmVhdGVMaW5rZWRTdGF0ZSh0aGlzLCBrZXksIGV2ZW50UGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJldlN0YXRlKSB0aGlzLnByZXZTdGF0ZSA9IGNsb25lKHMpO1xuICAgICAgICAgICAgZXh0ZW5kKHMsIGlzRnVuY3Rpb24oc3RhdGUpID8gc3RhdGUocywgdGhpcy5wcm9wcykgOiBzdGF0ZSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9yZW5kZXJDYWxsYmFja3MgPSB0aGlzLl9yZW5kZXJDYWxsYmFja3MgfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgZW5xdWV1ZVJlbmRlcih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge31cbiAgICB9KTtcbiAgICBleHBvcnRzLmggPSBoO1xuICAgIGV4cG9ydHMuY2xvbmVFbGVtZW50ID0gY2xvbmVFbGVtZW50O1xuICAgIGV4cG9ydHMuQ29tcG9uZW50ID0gQ29tcG9uZW50O1xuICAgIGV4cG9ydHMucmVuZGVyID0gcmVuZGVyO1xuICAgIGV4cG9ydHMucmVyZW5kZXIgPSByZXJlbmRlcjtcbiAgICBleHBvcnRzLm9wdGlvbnMgPSBvcHRpb25zO1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwIiwiaW1wb3J0IHsgaCwgcmVuZGVyIH0gZnJvbSAncHJlYWN0LWN5Y2xlJztcblxuaW1wb3J0IHNlcnZlciBmcm9tICcuL3NlcnZlcic7XG5cbmltcG9ydCB7XG4gIENvbnZlcnNhdGlvbixcbiAgQ0hBVF9DSEFOTkVMLCBDSEFUX0NIQU5ORUxfTkFNRSxcbiAgSVNTVUVTX0NIQU5ORUwsIElTU1VFU19DSEFOTkVMX05BTUUsXG4gIEdBTUVfQ0hBTk5FTCwgR0FNRV9DSEFOTkVMX05BTUUsXG4gIFRJTUVfQ0hBTk5FTCwgVElNRV9DSEFOTkVMX05BTUVcbn0gZnJvbSAnLi9jb252ZXJzYXRpb24nO1xuXG5pbXBvcnQge0NvbnNvbGUsIEFERF9MT0dfTUVTU0FHRX0gZnJvbSAnLi9jb25zb2xlJztcblxuY29uc3Qgc3RhdGUgPSBnZXRTdGF0ZSgpO1xuXG5mdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgbGV0IHNhdmVkU3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2F2ZWRTdGF0ZScpO1xuXG4gIGlmICghc2F2ZWRTdGF0ZSkge1xuICAgIHNhdmVkU3RhdGUgPSB7Y3VycmVudElkOiBuZXcgVWludDhBcnJheSg2NCksIHBhcnRuZXJzOiB7fX07XG4gICAgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoc2F2ZWRTdGF0ZS5jdXJyZW50SWQpO1xuICAgIHNhdmVTdGF0ZShzYXZlZFN0YXRlKTtcbiAgfVxuICBlbHNlIHtcbiAgICBzYXZlZFN0YXRlID0gSlNPTi5wYXJzZShzYXZlZFN0YXRlLCAoaywgdikgPT4ge1xuICAgICAgaWYgKGsgPT09ICdjdXJyZW50SWQnKSByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodik7XG4gICAgICByZXR1cm4gdjtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHN0YXRlID0ge1xuICAgIHN0YXR1czoge1xuICAgICAgc3RhcnRlZDogZmFsc2VcbiAgICB9LFxuICAgIHNpZ25hbGVyOiB7XG4gICAgICBjdXJyZW50SWQ6IHNhdmVkU3RhdGUuY3VycmVudElkLFxuICAgICAgc3RhdHVzOiAnTm90IENvbm5lY3RlZCdcbiAgICB9LFxuICAgIHBhcnRuZXJzOiBzYXZlZFN0YXRlLnBhcnRuZXJzLFxuICAgIGlucHV0OiB7XG4gICAgICBjb25uZWN0VG86IHVuZGVmaW5lZCxcbiAgICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgY29udmVyc2F0aW9uczoge30sXG4gICAgbG9nOiBbXVxuICB9O1xuXG4gIHJldHVybiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gc2F2ZVN0YXRlKHN0YXRlKSB7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYXZlZFN0YXRlJywgc3RyaW5naWZ5U3RhdGUoc3RhdGUpKTtcbn1cblxuXG5sZXQgY29ubmVjdFRvO1xuY29uc3QgU1RBUlQgPSAoXywgbXV0YXRpb24pID0+IHtcbiAgbXV0YXRpb24oU1RBUlRFRCkoKTtcblxuICBjb25uZWN0VG8gPSBzZXJ2ZXIoXy5zaWduYWxlci5jdXJyZW50SWQsIGNyZWF0ZUFjdGlvbnMobXV0YXRpb24pKTtcbn07XG5cblxuZnVuY3Rpb24gY3JlYXRlQWN0aW9ucyhtdXRhdGlvbikge1xuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGNvbnN0IHtcbiAgICBTSUdOQUxfQ09OTkVDVElPTl9TVEFURV9DSEFOR0UsXG4gICAgUEFSVE5FUl9NRVNTQUdFLFxuXG4gICAgSUNFX0NPTk5FQ1RJT05fU1RBVEVfQ0hBTkdFLFxuICAgIElDRV9HQVRIRVJJTkdfU1RBVEVfQ0hBTkdFXG4gIH0gPSB7XG4gICAgU0lHTkFMX0NPTk5FQ1RJT05fU1RBVEVfQ0hBTkdFOiAoXywgc3RhdGUpID0+IHtcbiAgICAgIF8uc2lnbmFsZXIuY29ubmVjdGlvblN0YXRlID0gc3RhdGU7XG4gICAgfSxcblxuICAgIFBBUlRORVJfTUVTU0FHRTogKF8sIFtwYXJ0bmVySWQsIG1lc3NhZ2VdKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHBhcnRuZXJJZC50b1N0cmluZygpO1xuXG4gICAgICBsZXQgY29udGV4dCA9IF8ucGFydG5lcnNbaWRdO1xuXG4gICAgICBjb25zb2xlLmxvZygnY29udGV4dCcsIGNvbnRleHQpO1xuXG4gICAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRleHQgPSBfLnBhcnRuZXJzW2lkXSA9IHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBkaXNjb3ZlcmVkQXQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgc2F2ZVN0YXRlKHtjdXJyZW50SWQ6IF8uc2lnbmFsZXIuY3VycmVudElkLCBwYXJ0bmVyczogXy5wYXJ0bmVyc30pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIV8uY29udmVyc2F0aW9uc1tpZF0pIHtcbiAgICAgICAgXy5jb252ZXJzYXRpb25zW2lkXSA9IChfLmNvbnZlcnNhdGlvbnNbaWRdIHx8IHtwYXJ0bmVyOiBwYXJ0bmVySWQsIGNvbnRleHQsIGNoYW5uZWxzOiB7fX0pO1xuICAgICAgfVxuXG4gICAgICBBRERfTE9HX01FU1NBR0UoXywgYCR7cmVuZGVyU2hvcnRJRChwYXJ0bmVySWQpfTogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gKTtcbiAgICB9LFxuXG4gICAgSUNFX0NPTk5FQ1RJT05fU1RBVEVfQ0hBTkdFOiAoXywgcGFydG5lciwgaWNlQ29ubmVjdGlvblN0YXRlKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHBhcnRuZXIudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGNvbnRleHQgPSBfLnBhcnRuZXJzW2lkXTtcblxuICAgICAgaWYgKGljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgKGNvbnRleHQuY29ubmVjdGVkQXQgPSBjb250ZXh0LmNvbm5lY3RlZEF0IHx8IFtdKS51bnNoaWZ0KG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgY29udGV4dC5jbG9zZWRBdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZGlzY29ubmVjdGVkJykge1xuICAgICAgICAoY29udGV4dC5kaXNjb25uZWN0ZWRBdCA9IGNvbnRleHQuZGlzY29ubmVjdGVkQXQgfHwgW10pLnVuc2hpZnQobmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhjb250ZXh0KTtcblxuICAgICAgY29udGV4dC5pY2VDb25uZWN0aW9uU3RhdGUgPSBpY2VDb25uZWN0aW9uU3RhdGU7XG4gICAgfSxcblxuICAgIElDRV9HQVRIRVJJTkdfU1RBVEVfQ0hBTkdFOiAoXywgcGFydG5lciwgaWNlR2F0aGVyaW5nU3RhdGUpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gcGFydG5lci50b1N0cmluZygpLFxuICAgICAgICAgICAgY29udGV4dCA9IF8ucGFydG5lcnNbaWRdO1xuXG4gICAgICBjb250ZXh0LmljZUdhdGhlcmluZ1N0YXRlID0gaWNlR2F0aGVyaW5nU3RhdGU7XG4gICAgfVxuICB9O1xuICAvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4gIHJldHVybiBhY3Rpb25pemUoe1xuICAgICdzaWduYWwnOiB7XG4gICAgICAnY29ubmVjdGlvbi1zdGF0ZSc6IFtTSUdOQUxfQ09OTkVDVElPTl9TVEFURV9DSEFOR0VdLFxuICAgICAgJ3BhcnRuZXItbWVzc2FnZSc6IFtQQVJUTkVSX01FU1NBR0VdXG4gICAgfSxcbiAgICAncGVlcic6IHtcbiAgICAgICdjb25uZWN0aW9uLXN0YXRlJzogWyhfLCBjb25uZWN0aW9uU3RhdGUpID0+IHtjb25zb2xlLmxvZygnKioqJywgY29ubmVjdGlvblN0YXRlKTt9XSxcbiAgICAgICdpY2UtY29ubmVjdGlvbi1zdGF0ZSc6IFtJQ0VfQ09OTkVDVElPTl9TVEFURV9DSEFOR0VdLFxuICAgICAgJ2ljZS1nYXRoZXJpbmctc3RhdGUnOiBbSUNFX0dBVEhFUklOR19TVEFURV9DSEFOR0VdLFxuICAgICAgJ2NoYXQtY2hhbm5lbC1vcGVuJzogW0NIQVRfQ0hBTk5FTCwgbXV0YXRpb25dLFxuICAgICAgJ2lzc3Vlcy1jaGFubmVsLW9wZW4nOiBbSVNTVUVTX0NIQU5ORUwsIG11dGF0aW9uXSxcbiAgICAgICd0aW1lLWNoYW5uZWwtb3Blbic6IFtUSU1FX0NIQU5ORUwsIG11dGF0aW9uXSxcbiAgICAgICdnYW1lLWNoYW5uZWwtb3Blbic6IFtHQU1FX0NIQU5ORUwsIG11dGF0aW9uXVxuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gYWN0aW9uaXplKGNvbmZpZykge1xuICAgIHJldHVybiB0cmFuc2Zvcm0oY29uZmlnLCB2YWx1ZSA9PiB0cmFuc2Zvcm0odmFsdWUsIChbLi4uYXJnc10pID0+IG11dGF0aW9uKC4uLmFyZ3MpKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtKG9iaiwgZm4pIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikucmVkdWNlKChhZ2csIGtleSkgPT4ge1xuICAgIGFnZ1trZXldID0gZm4ob2JqW2tleV0sIGtleSk7XG4gICAgcmV0dXJuIGFnZztcbiAgfSwge30pO1xufVxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCB7XG4gIFNUQVJURUQsXG4gIFNFVF9TSUdOQUxFUl9TVEFUVVMsXG4gIENPTk5FQ1RfVE8sXG4gIENPTk5FQ1RfVE9fUEFSVE5FUixcbiAgQ09OTkVDVF9UT19JTlBVVCxcbiAgQ0xFQVJfUEFSVE5FUlNcbn0gPSB7XG4gIFNUQVJURUQ6IF8gPT4ge1xuICAgIF8uc3RhdHVzLnN0YXJ0ZWQgPSB0cnVlO1xuICB9LFxuXG4gIFNFVF9TSUdOQUxFUl9TVEFUVVM6IChfLCBzdGF0dXMpID0+IHtcbiAgICBfLnNpZ25hbGVyLnN0YXR1cyA9IHN0YXR1cztcbiAgfSxcblxuICBDT05ORUNUX1RPOlxuICAgIChfLCBtdXRhdGlvbikgPT5cbiAgICAgIENPTk5FQ1RfVE9fUEFSVE5FUihfLCBfLmlucHV0LmNvbm5lY3RUbywgbXV0YXRpb24pLFxuXG4gIENPTk5FQ1RfVE9fUEFSVE5FUjpcbiAgICAoXywgbmFtZSwgbXV0YXRpb24pID0+XG4gICAgICBjb25uZWN0VG8obmV3IFVpbnQ4QXJyYXkobmFtZS5zcGxpdCgnLCcpLm1hcChuID0+IHBhcnNlSW50KG4sIDEwKSkpLCBbQ0hBVF9DSEFOTkVMX05BTUUsIElTU1VFU19DSEFOTkVMX05BTUUsIFRJTUVfQ0hBTk5FTF9OQU1FLCBHQU1FX0NIQU5ORUxfTkFNRV0sIGNyZWF0ZUFjdGlvbnMobXV0YXRpb24pLCB1bmRlZmluZWQpLFxuXG4gIENPTk5FQ1RfVE9fSU5QVVQ6IChfLCB7dGFyZ2V0OiB7dmFsdWV9fSkgPT4ge1xuICAgIF8uaW5wdXQuY29ubmVjdFRvID0gdmFsdWU7XG4gIH0sXG5cbiAgQ0xFQVJfUEFSVE5FUlM6IChfKSA9PiB7XG4gICAgXy5wYXJ0bmVycyA9IHt9O1xuICAgIHNhdmVTdGF0ZSh7Y3VycmVudElkOiBfLnNpZ25hbGVyLmN1cnJlbnRJZCwgcGFydG5lcnM6IF8ucGFydG5lcnN9KTtcbiAgfVxufTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgQXBwID0gKHtzdGF0dXM6IHtzdGFydGVkfSwgc2lnbmFsZXIsIGNvbnZlcnNhdGlvbnMsIGlzc3Vlc30sIHttdXRhdGlvbn0pID0+IChcbiAgPGFwcD5cbiAgICB7IXN0YXJ0ZWQgPyBtdXRhdGlvbihTVEFSVCkobXV0YXRpb24pIDogdW5kZWZpbmVkfVxuXG4gICAgPGNvbnZlcnNhdGlvbnM+XG4gICAgICB7T2JqZWN0LnZhbHVlcyhjb252ZXJzYXRpb25zKS5tYXAoYyA9PiA8Q29udmVyc2F0aW9uIGNvbnZlcnNhdGlvbj17Y30gLz4pfVxuICAgIDwvY29udmVyc2F0aW9ucz5cblxuICAgIDxkaXY+XG4gICAgICA8Zm9ybSBvblN1Ym1pdD17bXV0YXRpb24oQ09OTkVDVF9UTywgbXV0YXRpb24pfSBhY3Rpb249XCJqYXZhc2NyaXB0OlwiIGF1dG9Gb2N1cz5cbiAgICAgICAgQ29ubmVjdCBUbzogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgb25JbnB1dD17bXV0YXRpb24oQ09OTkVDVF9UT19JTlBVVCl9IC8+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9kaXY+XG5cbiAgICA8UGFydG5lcnMgLz5cblxuICAgIDxkaXY+XG4gICAgICBZb3VyIElEOiA8aWQ+e3NpZ25hbGVyLmN1cnJlbnRJZC50b1N0cmluZygpfTwvaWQ+XG4gICAgPC9kaXY+XG5cbiAgICA8Q29uc29sZSAvPlxuICA8L2FwcD5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cblxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBQYXJ0bmVycyA9IChfLCB7cGFydG5lcnMsIG11dGF0aW9ufSkgPT4gKFxuICA8cGFydG5lcnM+XG4gICAgPGRpdj5QYXN0IFBhcnRuZXJzIDxidXR0b24gb25DbGljaz17bXV0YXRpb24oQ0xFQVJfUEFSVE5FUlMpfT5jbGVhcjwvYnV0dG9uPjwvZGl2PlxuICAgIDxvbD5cbiAgICAgIHtPYmplY3Qua2V5cyhwYXJ0bmVycykubWFwKG5hbWUgPT4gPGxpIG9uQ2xpY2s9e211dGF0aW9uKENPTk5FQ1RfVE9fUEFSVE5FUiwgbmFtZSwgbXV0YXRpb24pfT48UGFydG5lciBuYW1lPXtuYW1lfSBkYXRhPXtwYXJ0bmVyc1tuYW1lXX0gLz48L2xpPil9XG4gICAgPC9vbD5cbiAgPC9wYXJ0bmVycz5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBQYXJ0bmVyID0gKHtuYW1lLCBkYXRhfSwge211dGF0aW9ufSkgPT4gKFxuICA8cGFydG5lcj5cbiAgICB7bmFtZX1cbiAgPC9wYXJ0bmVyPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbnJlbmRlcihBcHAsIHN0YXRlLCBkb2N1bWVudC5ib2R5KTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5U3RhdGUoc3RhdGUpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN0YXRlLCAoaywgdikgPT4ge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odik7XG4gICAgfVxuICAgIHJldHVybiB2O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU2hvcnRJRChpZCkge1xuICByZXR1cm4gYCR7aWQuc2xpY2UoMCwgMykudG9TdHJpbmcoKX0uLiR7aWQuc2xpY2UoaWQubGVuZ3RoIC0gNCwgaWQubGVuZ3RoIC0gMSkudG9TdHJpbmcoKX1gO1xufSIsImltcG9ydCB7IGgsIHJlbmRlciB9IGZyb20gJ3ByZWFjdC1jeWNsZSc7XG5cbmltcG9ydCBjcmVhdGVDaGFubmVsSGFuZGxlciBmcm9tICcuL2NyZWF0ZUNoYW5uZWxIYW5kbGVyJztcblxuY29uc3QgQ0hBVF9DSEFOTkVMX05BTUUgPSAnY2hhdCc7XG5cbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg3OTE1Mi9ob3ctZG8taS1tYWtlLWphdmFzY3JpcHQtYmVlcFxuY29uc3Qgbm90aWZpY2F0aW9uU291bmQgPSAgbmV3IEF1ZGlvKFwiZGF0YTphdWRpby93YXY7YmFzZTY0LC8vdVFSQUFBQVdNU0x3VUlZQUFzWWtYZ29Rd0FFYVlMV2ZrV2dBSTB3V3MvSXRBQUFHRGdZdEFnQXlOK1FXYUFBaWh3TVdtNEc4UVFSRGlNY0NCY0gzQ2MrQ0R2Lzd4QTRUdmg5UnoveThRQURCd01XZ1FBWkcvSUxOQUFSUTRHTFRjRGVJSUloeEdPQkF1RDdoT2ZCQjMvOTRnY0ozdytvNS81ZUlBSUFBQVZ3V2dRQVZRMk9SYUlRd0VNQUppRGc5NUc0blFMN21RVldJNkd3UmNmc1pBY3NLa0p2eGd4RWp6RlVnZkhvU1E5UXE3S053cUh3dUIxM01BNGExcS9EbUJySGdQY21qaUdvaC8vRXdDNW5HUEVtUzRSY2ZrVktPaEpmK1dPZ294SmNsRnoza2duLy9kQkEreWExR2h1ck5uOHpiLy85Tk51dE51aHozMWYvLy8vOXZ0Ly8veitJZEFFQUFBSzRMUUlBS29iSEl0RUlZQ0dBRXhCd2U4amNUb0Y5eklLckVkRFlJdVAyTWdPV0ZTRTM0d1lpUjVpcVFQajBKSWVvVmRsRzRWRDRYQTY3bUFjTmExZmh6QTFqd0h1VFJ4RFVRLy9pWUJjempIaVRKY0l1UHlLbEhRa3YvTEhRVVlrdVNpNTd5UVQvL3VnZ2ZaTmFqUTNWbXorWnQvLyttbTNXbTNRNTc2di8vLy8rMzIvLy81L0VPZ0FBQURWZ2hRQUFBQUEvL3VRWkFVQUIxV0kwUFp1Z0FBQUFBb1F3QUFBRWszblJkMnFBQUFBQUNpRGdBQUFBQUFBQkNxRUVRUkxDZ3dwQkdNbEprSXo4aktoR3ZqNGs2anpSbnFhc05LSWVvaDVnSTdCSmFDMUExQW9OQmpKZ2J5QXBWUzRJRGxaZ0RVNVdVQXhFS0RObW1BTEh6WnAwRmt6MUZNVG1HRmwxRk1FeW9kSWF2Y0NBVUhEV3JLQUlBNGFhMm9DZ0lMRUJ1cFpnSHZBaEVCY1o2am9RQnhTNzZBZ2NjckZsY3pCdktMQzBRSTJjQm9DRnZmVERBbzdlb09RSW5xRFBCdHZyREVaQk5ZTjV4d053eFFSZnc4WlE1d1FWTHZPOE9ZVSttSHZGTGxEaDA1TWRnN0JUNllyUlBwQ0J6bk1CMnIvL3hLSmp5eU9oK2NJbXIyLzRkb3Njd0Q2bmVaanVaUjRBZ0FBQllBQUFBQnkxeGNkUXR4WUJZWVpkaWZrVURnenpYYVhuOThaMG9pOUlMVTVtQmpGQU5tUndsVkozLzZqWURBbXhhaURHMy82eGpRUUNDS2tSYi82a2cvd1cra1NKNS8vckxvYmtMU2lLbXFQLzBpa0p1RGFTYVNmLzZKaUxZTEVZblcvK2tYZzFXUlZKTC85RW1RMVlaSXN2LzZRend5NXFrNy8rdEVVMG5rbHMzL3pJVU1QS05YLzZ5WkxmK2tGZ0FmZ0d5TEZBVXdZLy91UVpBVUFCY2Q1VWlOUFZYQUFBQXBBQUFBQUUwVlpRS3c5SVNBQUFDZ0FBQUFBVlFJeWdJRWxWckZrQlMrSmhpK0VBdXUrbEtBa1lVRUlzbUVBRW9NZURtQ0VUTXZmU0hUR2tGNVJXSDdrei9FU0hXUEFxL2tjQ1JocUJ0TWRva1BkTTd2aWw3Ukc5OEEyc2M3ek82WnZUZE03cG1PVUFaVG5KVytOWHhxbWQ0MWRxSjZtTFRYeHJQcG5WOGF2YUlmNVN2TDdwbmRQdlBwbmRKUjlLdXU4ZmVQdnVpdWhvcmdXanA3TWYvUFJqeGNGQ1BEa1czMXNyaW9DRXhpdnY5bGN3S0VhSHNmLzdvdzJGbDFULzlSa1hnRWhZRWxBb0NMRnRNQXJ4d2l2REpKK2JSMUhUS0pkbEVvVEVMQ0lxZ0V3VkdTUStoSW0wTmJLOFdYY1RFSTBVUG9hMk5iRzR5MkswMEpFV2JaYXZKWGtZYXFvOUNSSFM1NUZjWlRqS0VrM05Lb0NZVW5TUTByV3hyWmJGS2JLSWhPS1BaZTFjSkt6WlNhUXJJeVVMSERabVY1SzR4eVNzRFJLV09ydWFuR3RqTEpYRkVtd2FJYkRMWDBoSVBCVVFQVkZWa1FrRG9VTmZTb0RnUUdLUGVrb3hlR3pBNERVdm5uNGJ4emNacnRKeWlwS2ZQTnk1dys5bG5Yd2dxc2l5SE5lU1ZwZW13NGJXYjlwc1llcS8vdVFaQm9BQlF0NHlNVnhZQUlBQUFrUW9BQUFIdllwTDVtNkFBZ0FBQ1hEQUFBQUQ1OWpibFRpclFlOXVwRnNtWmJwTXVkeTdMejFYMURZc3hPT1NXcGZQcU5YMldxa3RLMERNdnVHd2xiTmo0NFRsZUxQUStHc2ZiK0dPV09LSm9JcldiM2NJTWVlT042bHoydW1UcU1YVjhNajMweVdQcGpvU2E5dWpLOFN5ZUpQNXk1bU9XMUQ2aHZMZXBldmVFQUVEbzBtZ0NSQ2xPRWdBTnYzQjlhNmZpa2dVU3UvRG1BTUFUckd4N25uZzVwNWlpbVBOWnNmUUxZQjJzRExJa3pSS1pPSEdBYVV5RGNwRkJTTEc5TUNRQUxnQUlnUXMyWXVuT3N6TFNBeVFZUFZDMllkR0dlSEQyZFRkSmsxcEFIR0FXRGpua2NMS0Z5bVMzUlFaVEluenlTb0J3TUcwUXVlQzNnTXNDRVl4VXFscmN4SzZrMUxRUWNzbXlZZVFQZEMyWWZ1R1BBU0NCa2NWTVFRcXBWSnNodWkxdGtYUUpRVjBPWEdBWk1YU09FRUJSaXJYYlZSUVc3dWdxN0lNN3JQV1NaeURsTTNJdU5Fa3h6Q09KMG55MlRoTmt5UmFpMWI2ZXYvLzNkek5Hek5iLy80dUF2SFQ1c1VSY1pDRmN1S0xoT0ZzOG1MQUFFQXQ0VVdBQUlBQkFBQUFBQjRxYkhvMHRJalZrVVUvL3VRWkF3QUJmU0Z6M1pxUUFBQUFBbmd3QUFBRTFIak1wMnFBQUFBQUNaRGdBQUFENVVrVEUxVWdaRVVFeHFZeW5OMXFadnFJT1JFRUZtQmNKUWt3ZHhpRnR3MHFFT2tHWWZSRGlmQnVpOU1RZzRRQUhBcVd0QVdIb0N4dTFZZjRWZldMUElNMm1IREZzYlFFVkd3eXFRb1Fjd25mSGVJa050OVlua2lhUzFvaXp5Y3FKcng0S09RamFoWnhXYmNaZ3p0ajJjNDluS21rSWQ0NFM3MWowYzhlVjl5REs2dVBSeng1WDE4ZUR2anZRNnlLbzlaU1M2bC8vOGVsZVBLL0xmLy9JSW5yT0YvRnZEb0FEWUFHQk1HYjdGdEVybTVNWE1sbVBBSlFWZ1d0YTdaeDJnbys4eEowVWlDYjhMSEhkZnRXeUxKRTBRSUFJc0krVWJYdTY3ZFpNam1nREdDR2wxSCt2cEY0TlNEY2tTSWtrN1ZkK3N4RWhCUU1SVThqLzEyVUlSaHpTYVVkUStyUVU1a0dlRnhtK2hiMW9oNnBXV212M3V2bVJlRGwwVW52dGFwVmFJem8xalpiZi9wRDZFbExxU1grclVtT1FOcEpGYS9yK3NhNGUvcEJsQUFCb0FBQUFBM0NVZ1NoTGRHSXhzWTdBVUFCUFJyZ0NBQmREdVE1R0M3RHFQUUNnYmJKVUFvUlNVaitOSUVpZzBZZnlXVWhvMVZCQkJBLy91UVpCNEFCWng1emZNYWtlQUFBQW13QUFBQUY1RjNQMHc5R3RBQUFDZkFBQUFBd0xoTURtQVlXTWdWRUcxVTBGSUdDQmdYQlhBdGZNSDEwMDAwRUVFRUVFQ1VCWWxuMDNUVFRkTkJEWm9wb3BZdnJUVGROYTMyNW1JbU5nM1RUUFY5cTNwbVkweG9PNmJ2M3IwMHkrSURHaWQvOWFhYVpUR011ajltcHU5TXBpbzFkWHJyNUhFUlRaU21xVTM2QTNDdW16Ti85Um9idi9YeDR2OWlqa1NSU05MUWhBV3VtYXA4MldSU0JVcVhTdFYvWWNTK1hWTG5TUytXTERyb3FBckZrTUVzQVMrZVdtclV6ck8wb0VtRTQwUmxNWjUrT0RJa0F5S0FHVXdaM21WS21jYW1jSm5NVzI2TVJQZ1V3NmorTGtoeUhHVkdZalNVVUtOcHVKVVFvT0lBeUR2RXlHOFM1eWZLNmRoWmMwVHgxS0kvZ3ZpS0w2cXZ2RnMxK2JXdGF6NTh1VU5ucnlxNmt0NVJ6T0NrUFdsVnFWWDJhL0VFQlVkVTFLclhMZjQwR29paUZYSy8vL3Fwb2lEWHJPZ3FEUjM4SkIwYnc3U29MK1pCOW8xUkNrUWpRMkNCWVpLZC8rVkp4WlJSWmxxU2tLaXdzMFdGeFV5Q3dzS2lNeTdoVVZGaElhQ3JOUXNLa1RJc0xpdndLS2lnc2o4WFlsd3QvV0tpMk40ZC8vdVFSQ1NBQWpVUk5JSHBNWkJHWWlhUVBTWXlBQUFCTEFBQUFBQUFBQ1dBQUFBQXBVRi9NZyswYW9oU0lSb2JCQXNNbE8vL0trNHNvb3N5MUpTRlJZV2FMQzRxWkJZV0ZSR1pkd3FLaXdrTkJWbW9XRlNKa1dGeFg0RkZSUVdSK0xzUzRXL3JGUmIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9WRUZIQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVUyOTFibVJpYjNrdVpHVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTWpBd05HaDBkSEE2THk5M2QzY3VjMjkxYm1SaWIza3VaR1VBQUFBQUFBQUFBQ1U9XCIpO1xuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCB7XG4gIEFERF9DSEFUX01FU1NBR0UsXG4gIFNFTkRfQ0hBVF9NRVNTQUdFLFxuICBDSEFUX01FU1NBR0VfSU5QVVRcbn0gPSB7XG4gIEFERF9DSEFUX01FU1NBR0U6IChfLCBjaGF0LCB0eXBlLCB7ZGF0YX0pID0+IHtcbiAgICBjb25zb2xlLmxvZygnXycsIF8pO1xuICAgIGNoYXQubWVzc2FnZXMudW5zaGlmdCh7dHlwZSwgZGF0YSwgdGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCl9KTtcbiAgICBub3RpZmljYXRpb25Tb3VuZC5wbGF5KCk7XG4gIH0sXG5cbiAgU0VORF9DSEFUX01FU1NBR0U6IChfLCBjaGF0KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3NlbmQnKTtcbiAgICBjb25zdCB7bWVzc2FnZX0gPSBjaGF0LmlucHV0O1xuXG4gICAgQUREX0NIQVRfTUVTU0FHRShfLCBjaGF0LCAnc2VsZicsIHtkYXRhOiBtZXNzYWdlfSk7XG5cbiAgICBjaGF0LmNoYW5uZWwuc2VuZChtZXNzYWdlKTtcbiAgICBjaGF0LmlucHV0Lm1lc3NhZ2UgPSAnJztcbiAgfSxcblxuICBDSEFUX01FU1NBR0VfSU5QVVQ6IChfLCBjaGF0LCB7dGFyZ2V0Ont2YWx1ZX19KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2lucHV0JywgXyk7XG4gICAgY2hhdC5pbnB1dC5tZXNzYWdlID0gdmFsdWU7XG4gIH1cbn07XG4vLyBqc2hpbnQgaWdub3JlOiBlbmRcblxuY29uc3QgQ0hBVF9DSEFOTkVMID1cbiAgY3JlYXRlQ2hhbm5lbEhhbmRsZXIoXG4gICAgQ0hBVF9DSEFOTkVMX05BTUUsXG4gICAgQUREX0NIQVRfTUVTU0FHRSxcbiAgICAocGFydG5lciwgY2hhbm5lbCkgPT5cbiAgICAgICh7XG4gICAgICAgIHBhcnRuZXIsXG4gICAgICAgIGNoYW5uZWwsXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgbWVzc2FnZXM6IFtdLFxuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICB9KSk7XG5cbi8vIGpzaGludCBpZ25vcmU6c3RhcnRcbmNvbnN0IENoYXQgPSAoe2NoYXR9LCB7bXV0YXRpb259KSA9PiAoXG4gIDxjaGF0PlxuICAgIDxmb3JtIG9uU3VibWl0PXttdXRhdGlvbihTRU5EX0NIQVRfTUVTU0FHRSwgY2hhdCl9IGFjdGlvbj1cImphdmFzY3JpcHQ6XCIgYXV0b0ZvY3VzPlxuICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e2NoYXQuaW5wdXQubWVzc2FnZX0gb25JbnB1dD17bXV0YXRpb24oQ0hBVF9NRVNTQUdFX0lOUFVULCBjaGF0KX0gcGxhY2Vob2xkZXI9XCJUeXBlIHlvdXIgY2hhdCBtZXNzYWdlIGhlcmUuLi5cIiAvPlxuICAgIDwvZm9ybT5cbiAgICA8TWVzc2FnZXMgbWVzc2FnZXM9e2NoYXQubWVzc2FnZXN9IHN0YXJ0PXtjaGF0LnN0YXJ0fSAvPlxuICA8L2NoYXQ+XG4pO1xuLy8ganNoaW50IGlnbm9yZTogZW5kXG5cbi8vIGpzaGludCBpZ25vcmU6c3RhcnRcbmNvbnN0IE1lc3NhZ2VzID0gKHttZXNzYWdlcywgc3RhcnR9KSA9PiAoXG4gIDxtZXNzYWdlcz5cbiAgICB7bWVzc2FnZXMubWFwKCh7dHlwZSwgZGF0YSwgdGltZX0pID0+IChcbiAgICAgIDxtZXNzYWdlIGNsYXNzTmFtZT17dHlwZX0+XG4gICAgICAgIDxjb250YWluZXIgY2xhc3NOYW1lPXtgbWVzc2FnZS10aW1lLSR7NSAqIE1hdGgucm91bmQoMTAwICogKHRpbWUgLSBzdGFydCkgLyAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCkgLyA1KX1gfT5cbiAgICAgICAgICA8ZGF0YT57ZGF0YX08L2RhdGE+XG4gICAgICAgICAgPHRpbWU+e25ldyBEYXRlKHRpbWUpLnRvSVNPU3RyaW5nKCl9PC90aW1lPlxuICAgICAgICA8L2NvbnRhaW5lcj5cbiAgICAgIDwvbWVzc2FnZT5cbiAgICApKX1cbiAgPC9tZXNzYWdlcz5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cbmV4cG9ydCB7Q2hhdCwgQ0hBVF9DSEFOTkVMLCBDSEFUX0NIQU5ORUxfTkFNRX07IiwiaW1wb3J0IHsgaCB9IGZyb20gJ3ByZWFjdC1jeWNsZSc7XG5cbmNvbnN0IHtcbiAgQUREX0xPR19NRVNTQUdFXG59ID0ge1xuICBBRERfTE9HX01FU1NBR0U6ICh7bG9nfSwgbWVzc2FnZSkgPT4ge1xuICAgIGxvZy51bnNoaWZ0KG1lc3NhZ2UpO1xuICB9XG59O1xuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBDb25zb2xlID0gKF8sIHtsb2cgPSBbXX0pID0+IChcbiAgPGNvbnNvbGU+XG4gICAgPGRpdj5Mb2c8L2Rpdj5cbiAgICA8bG9nPlxuICAgICAge2xvZy5tYXAobWVzc2FnZSA9PiA8ZGl2PnttZXNzYWdlfTwvZGl2Pil9XG4gICAgPC9sb2c+XG4gIDwvY29uc29sZT5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5leHBvcnQge0NvbnNvbGUsIEFERF9MT0dfTUVTU0FHRX07IiwiaW1wb3J0IHsgaCB9IGZyb20gJ3ByZWFjdC1jeWNsZSc7XG5cbmltcG9ydCB7Q2hhdCwgQ0hBVF9DSEFOTkVMLCBDSEFUX0NIQU5ORUxfTkFNRX0gZnJvbSAnLi9jaGF0JztcbmltcG9ydCB7SXNzdWVzLCBJU1NVRVNfQ0hBTk5FTCwgSVNTVUVTX0NIQU5ORUxfTkFNRX0gZnJvbSAnLi9pc3N1ZXMnO1xuaW1wb3J0IHtUaW1lLCBUSU1FX0NIQU5ORUwsIFRJTUVfQ0hBTk5FTF9OQU1FfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHtHYW1lLCBHQU1FX0NIQU5ORUwsIEdBTUVfQ0hBTk5FTF9OQU1FfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHtMb2NhdGlvbiwgTE9DQVRJT05fQ0hBTk5FTCwgTE9DQVRJT05fQ0hBTk5FTF9OQU1FfSBmcm9tICcuL2xvY2F0aW9uJztcblxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBDb252ZXJzYXRpb24gPSAoe2NvbnZlcnNhdGlvbjoge3BhcnRuZXIsIGNvbnRleHQsIGNoYW5uZWxzOiB7Y2hhdCwgaXNzdWVzLCB0aW1lLCBnYW1lfX19LCB7cGFydG5lcnMsIG11dGF0aW9ufSkgPT4gKFxuICA8Y29udmVyc2F0aW9uIGNsYXNzTmFtZT17Y29udGV4dC5pY2VDb25uZWN0aW9uU3RhdGV9PlxuICAgIDxwYXJ0bmVyLWluZm8+XG4gICAgICA8aWQ+e3JlbmRlclNob3J0SUQocGFydG5lcil9PC9pZD5cbiAgICAgIHtjb250ZXh0LmRpc2NvdmVyZWRBdCA/IDxkaXNjb3ZlcmVkLWF0PkRpc2NvdmVyZWQgQXQ6IHtuZXcgRGF0ZShjb250ZXh0LmRpc2NvdmVyZWRBdCkudG9TdHJpbmcoKX08L2Rpc2NvdmVyZWQtYXQ+IDogdW5kZWZpbmVkfVxuICAgICAge2NvbnRleHQuY29ubmVjdGVkQXQgPyA8Y29ubmVjdGVkLWF0PkNvbm5lY3RlZCBBdDoge25ldyBEYXRlKGNvbnRleHQuY29ubmVjdGVkQXRbMF0pLnRvU3RyaW5nKCl9PC9jb25uZWN0ZWQtYXQ+IDogdW5kZWZpbmVkfVxuICAgICAge2NvbnRleHQuZGlzY29ubmVjdGVkQXQgPyA8ZGlzY29ubmVjdGVkLWF0PkRpc2Nvbm5lY3RlZCBBdDoge25ldyBEYXRlKGNvbnRleHQuZGlzY29ubmVjdGVkQXRbMF0pLnRvU3RyaW5nKCl9PC9kaXNjb25uZWN0ZWQtYXQ+IDogdW5kZWZpbmVkfVxuICAgIDwvcGFydG5lci1pbmZvPlxuICAgIDxjaGFubmVscz5cbiAgICAgIHt0aW1lID8gPFRpbWUgdGltZT17dGltZX0gLz4gOiB1bmRlZmluZWR9XG4gICAgICB7Y2hhdCA/IDxDaGF0IGNoYXQ9e2NoYXR9IC8+IDogdW5kZWZpbmVkfVxuICAgICAge2lzc3VlcyA/IDxJc3N1ZXMgaXNzdWVzPXtpc3N1ZXN9IC8+IDogdW5kZWZpbmVkfVxuICAgICAge2dhbWUgPyA8R2FtZSBnYW1lPXtnYW1lfSAvPiA6IHVuZGVmaW5lZH1cbiAgICAgIHtsb2NhdGlvbiA/IDxMb2NhdGlvbiBsb2NhdGlvbj17bG9jYXRpb259IC8+IDogdW5kZWZpbmVkfVxuICAgIDwvY2hhbm5lbHM+XG4gIDwvY29udmVyc2F0aW9uPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbmV4cG9ydCB7Q29udmVyc2F0aW9uLCBDSEFUX0NIQU5ORUwsIENIQVRfQ0hBTk5FTF9OQU1FLCBJU1NVRVNfQ0hBTk5FTCwgSVNTVUVTX0NIQU5ORUxfTkFNRSwgR0FNRV9DSEFOTkVMLCBHQU1FX0NIQU5ORUxfTkFNRSwgVElNRV9DSEFOTkVMLCBUSU1FX0NIQU5ORUxfTkFNRSwgTE9DQVRJT05fQ0hBTk5FTCwgTE9DQVRJT05fQ0hBTk5FTF9OQU1FfTtcblxuZnVuY3Rpb24gcmVuZGVyU2hvcnRJRChpZCkge1xuICByZXR1cm4gYCR7aWQuc2xpY2UoMCwgMykudG9TdHJpbmcoKX0uLiR7aWQuc2xpY2UoaWQubGVuZ3RoIC0gNCwgaWQubGVuZ3RoIC0gMSkudG9TdHJpbmcoKX1gO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUNoYW5uZWxIYW5kbGVyKG5hbWUsIGhhbmRsZXIsIGNvbnRleHRDcmVhdG9yKSB7XG4gIHJldHVybiAoXywgbXV0YXRpb24sIHBhcnRuZXIsIGNoYW5uZWwpID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gY29udGV4dENyZWF0b3IocGFydG5lciwgY2hhbm5lbCk7XG5cbiAgICBfLmNvbnZlcnNhdGlvbnNbcGFydG5lci50b1N0cmluZygpXS5jaGFubmVsc1tuYW1lXSA9IGNvbnRleHQ7XG5cbiAgICBjaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtdXRhdGlvbihoYW5kbGVyLCBjb250ZXh0LCAncGFydG5lcicpKTtcbiAgfTtcbn0iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdwcmVhY3QnO1xuaW1wb3J0IHsgaCB9IGZyb20gJ3ByZWFjdC1jeWNsZSc7XG5cbmltcG9ydCBjcmVhdGVDaGFubmVsSGFuZGxlciBmcm9tICcuL2NyZWF0ZUNoYW5uZWxIYW5kbGVyJztcblxuY29uc3QgR0FNRV9DSEFOTkVMX05BTUUgPSAnZ2FtZSc7XG5cbmNvbnN0IFBsYXllciA9IChjb2xvcikgPT4gKHtcbiAgY29tbWFuZHM6IFtdLFxuICBjb2xvcixcbiAgcmVzb3VyY2VzOiB7XG4gICAgcjoge3ZhbHVlOiAxMCwgbWF4OiAxMDB9LFxuICAgIGc6IHt2YWx1ZTogNSwgbWF4OiAxMDB9LFxuICAgIGI6IHt2YWx1ZTogMCwgbWF4OiAxMDB9XG4gIH1cbn0pO1xuXG5jbGFzcyBFbnRpdHkge1xuICBjb25zdHJ1Y3Rvcih7eCwgeSwgdngsIHZ5LCBjb2xvciwgZ2FtZVN0YXRlfSkge1xuICAgIHRoaXMuaW5pdCh4LCB5LCB2eCwgdnksIGNvbG9yLCBnYW1lU3RhdGUpO1xuICB9XG5cbiAgaW5pdCh4LCB5LCB2eCwgdnksIGNvbG9yLCBnYW1lU3RhdGUpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy52eCA9IHZ4O1xuICAgIHRoaXMudnkgPSB2eTtcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5nYW1lU3RhdGUgPSBnYW1lU3RhdGU7XG5cbiAgICB0aGlzLnZ4cCA9IHZ4IC8gZ2FtZVN0YXRlLnRpY2tzUGVyU2Vjb25kO1xuICAgIHRoaXMudnlwID0gdnkgLyBnYW1lU3RhdGUudGlja3NQZXJTZWNvbmQ7XG5cbiAgICBkZWxldGUgdGhpcy5kb250RHJhdztcbiAgICBkZWxldGUgdGhpcy5yZXR1cm47XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy54ICs9IHRoaXMudnhwO1xuICAgIHRoaXMueSArPSB0aGlzLnZ5cDtcblxuICAgIC8vIHRoaXMueCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMueCwgMCksIHRoaXMuZ2FtZVN0YXRlLndvcmxkU2l6ZS54IC0gMSk7XG4gICAgLy8gdGhpcy55ID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy55LCAwKSwgdGhpcy5nYW1lU3RhdGUud29ybGRTaXplLnkgLSAxKTtcblxuICAgIGlmICh0aGlzLnggPj0gdGhpcy5nYW1lU3RhdGUud29ybGRTaXplLnggfHxcbiAgICAgICAgdGhpcy55ID49IHRoaXMuZ2FtZVN0YXRlLndvcmxkU2l6ZS55KSB7XG4gICAgICB0aGlzLnJldHVybiA9IHRydWU7XG4gICAgICB0aGlzLmRvbnREcmF3ID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRW50aXR5KGdhbWVTdGF0ZSwgeCwgeSwgdngsIHZ5LCBjb2xvcikge1xuICBjb25zdCBlbnRpdHkgPSBnYW1lU3RhdGUuZW50aXR5UG9vbC5wb3AoKTtcblxuICBpZiAoZW50aXR5KSB7XG4gICAgY29uc29sZS5sb2coJ3VzaW5nIHBvb2wgZW50aXR5Jyk7XG4gICAgZW50aXR5LmluaXQoeCwgeSwgdngsIHZ5LCBjb2xvciwgZ2FtZVN0YXRlKTtcbiAgICBnYW1lU3RhdGUuZW50aXRpZXMucHVzaChlbnRpdHkpO1xuICAgIHJldHVybiBlbnRpdHk7XG4gIH1cbiAgZWxzZSByZXR1cm4gZ2FtZVN0YXRlLmVudGl0aWVzLnB1c2gobmV3IEVudGl0eSh7eCwgeSwgdngsIHZ5LCBjb2xvciwgZ2FtZVN0YXRlfSkpO1xufVxuXG5jb25zdCB7XG4gIEFERF9HQU1FX01FU1NBR0UsXG4gIENPTU1BTkQsXG4gIFBST0NFU1NfQ09NTUFORCxcblxuICBORVdfRlJBTUUsXG5cbiAgQ0FOVkFTX0NMSUNLXG59ID0ge1xuICBBRERfR0FNRV9NRVNTQUdFOiAoXywgZ2FtZSwgd2hvLCB7ZGF0YX0pID0+IHtcbiAgICBjb25zb2xlLmxvZyh3aG8sIGRhdGEpO1xuXG4gICAgUFJPQ0VTU19DT01NQU5EKF8sIGdhbWUsIHdobywgSlNPTi5wYXJzZShkYXRhKSk7XG4gIH0sXG5cbiAgQ09NTUFORDogKF8sIGdhbWUsIG11dGF0aW9uKSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IHt0eXBlOiAnc3RhcnQnfTtcblxuICAgIGdhbWUuY2hhbm5lbC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcblxuICAgIFBST0NFU1NfQ09NTUFORChfLCBnYW1lLCAnc2VsZicsIG1lc3NhZ2UsIG11dGF0aW9uKTtcbiAgICBjb25zb2xlLmxvZygnc2VudCBjb21tYW5kJyk7XG4gIH0sXG5cbiAgUFJPQ0VTU19DT01NQU5EOiAoXywge21lc3NhZ2VzLCBnYW1lU3RhdGUsIE5FV19GUkFNRX0sIHdobywgbWVzc2FnZSwgbXV0YXRpb24pID0+IHtcbiAgICBjb25zdCB7dHlwZSwgZGF0YX0gPSBtZXNzYWdlO1xuXG4gICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgIGlmICghZ2FtZVN0YXRlLnN0YXJ0ZWQpIHtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgZ2FtZVN0YXRlLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgIGdhbWVTdGF0ZS50aWNrID0gMDtcbiAgICAgICAgICBnYW1lU3RhdGUubG9jYWxTdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgIGdhbWVTdGF0ZS53b3JsZFNpemUgPSB7eDogMTAwLCB5OiA1MH07XG4gICAgICAgICAgZ2FtZVN0YXRlLnBsYXllcnMgPSBbXG4gICAgICAgICAgICBQbGF5ZXIoJ3JnYigyNTUsIDI1NSwgMjU1KScpLFxuICAgICAgICAgICAgUGxheWVyKCdyZ2IoMjU1LCA2NCwgNjQnKVxuICAgICAgICAgIF07XG4gICAgICAgICAgZ2FtZVN0YXRlLmxvY2FsUGxheWVyID0gd2hvID09PSAnc2VsZicgPyAwIDogMTtcbiAgICAgICAgICBnYW1lU3RhdGUucmVtb3RlUGxheWVyID0gd2hvID09PSAnc2VsZicgPyAxIDogMDtcblxuICAgICAgICAgIHJ1bkdhbWUoZ2FtZVN0YXRlLCBORVdfRlJBTUUpOyAvLyBzaG91bGQgcGFzcyBtdXRhdGlvbj9cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3Bhd24nOlxuICAgICAgICAgIGNvbnN0IHBsYXllckluZGV4ID0gd2hvID09PSAnc2VsZicgPyBnYW1lU3RhdGUubG9jYWxQbGF5ZXIgOiBnYW1lU3RhdGUucmVtb3RlUGxheWVyO1xuXG4gICAgICAgICAgaWYgKGdhbWVTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XS5yZXNvdXJjZXMuci52YWx1ZSA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHt4LCB5fSA9IGRhdGE7XG5cbiAgICAgICAgICAgIGNyZWF0ZUVudGl0eShnYW1lU3RhdGUsXG4gICAgICAgICAgICAgIHgsXG4gICAgICAgICAgICAgIHksXG4gICAgICAgICAgICAgIHBsYXllckluZGV4ID09PSAwID8gMyA6IC0zLFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICBnYW1lU3RhdGUucGxheWVyc1twbGF5ZXJJbmRleF0uY29sb3JcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGdhbWVTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XS5jb21tYW5kcy5wdXNoKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBnYW1lU3RhdGUucGxheWVyc1twbGF5ZXJJbmRleF0ucmVzb3VyY2VzLnIudmFsdWUtLTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIE5FV19GUkFNRTogKF8sIGdhbWUpID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZygnbmV3IGZyYW1lJyk7XG4gIH0sXG5cbiAgQ0FOVkFTX0NMSUNLOiAoXywgZ2FtZSwgZXZlbnQpID0+IHtcbiAgICBjb25zdCB7eCwgeX0gPSBldmVudCxcbiAgICAgICAgICB7Y2xpZW50V2lkdGgsIHdpZHRoLCBjbGllbnRIZWlnaHQsIGhlaWdodCwgb2Zmc2V0VG9wLCBvZmZzZXRMZWZ0fSA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICBtZXNzYWdlID0ge3R5cGU6ICdzcGF3bicsIGRhdGE6IHt4OiBNYXRoLmZsb29yKCh4IC0gb2Zmc2V0TGVmdCkgLyBjbGllbnRXaWR0aCAqIHdpZHRoKSAsIHk6IE1hdGguZmxvb3IoKHkgLSBvZmZzZXRUb3ApIC8gKGNsaWVudEhlaWdodCkgKiBoZWlnaHQpfX07XG5cbiAgICBnYW1lLmNoYW5uZWwuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG5cbiAgICBQUk9DRVNTX0NPTU1BTkQoXywgZ2FtZSwgJ3NlbGYnLCBtZXNzYWdlKTtcblxuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcnVuR2FtZShnYW1lU3RhdGUsIHVwZGF0ZVVJKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lVGljayk7XG5cbiAgZnVuY3Rpb24gZ2FtZVRpY2soKSB7XG4gICAgZ2FtZVN0YXRlLnRpY2srKztcblxuICAgIGdhbWVTdGF0ZS5lbnRpdGllcy5mb3JFYWNoKGVudGl0eSA9PiBlbnRpdHkudXBkYXRlKCkpO1xuXG4gICAgZm9yIChsZXQgaSA9IGdhbWVTdGF0ZS5lbnRpdGllcy5sZW5ndGggLSAxOyBpID49IDA7ICBpLS0pIHtcbiAgICAgIGNvbnN0IGVudGl0eSA9IGdhbWVTdGF0ZS5lbnRpdGllc1tpXTtcblxuICAgICAgaWYgKGVudGl0eS5yZXR1cm4pIHtcbiAgICAgICAgZ2FtZVN0YXRlLmVudGl0aWVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgZ2FtZVN0YXRlLmVudGl0eVBvb2wucHVzaChlbnRpdHkpO1xuICAgICAgfVxuICAgICAgZWxzZSBlbnRpdHkudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgLy8gZ2FtZVN0YXRlLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAvLyAgIGVudGl0eS54ICs9IGVudGl0eS52eHA7XG4gICAgLy8gICBlbnRpdHkueSArPSBlbnRpdHkudnlwO1xuXG4gICAgLy8gICBlbnRpdHkueCA9IE1hdGgubWluKE1hdGgubWF4KGVudGl0eS54LCAwKSwgZ2FtZVN0YXRlLndvcmxkU2l6ZS54IC0gMSk7XG4gICAgLy8gICBlbnRpdHkueSA9IE1hdGgubWluKE1hdGgubWF4KGVudGl0eS55LCAwKSwgZ2FtZVN0YXRlLndvcmxkU2l6ZS55IC0gMSk7XG4gICAgLy8gfSk7XG5cbiAgICBpZiAoZ2FtZVN0YXRlLnRpY2sgJSBnYW1lU3RhdGUudGlja3NQZXJTZWNvbmQgPT09IDApIHtcbiAgICAgIGdhbWVTdGF0ZS5wbGF5ZXJzLmZvckVhY2goKHtyZXNvdXJjZXN9KSA9PiB7XG4gICAgICAgIHJlc291cmNlcy5yLnZhbHVlKys7XG4gICAgICAgIHJlc291cmNlcy5nLnZhbHVlICs9IDAuNTtcbiAgICAgICAgcmVzb3VyY2VzLmIudmFsdWUgKz0gMC4wNTtcblxuICAgICAgICByZXNvdXJjZXMuci5tYXggPSBNYXRoLm1heChyZXNvdXJjZXMuci5tYXgsIHJlc291cmNlcy5yLnZhbHVlKTtcbiAgICAgICAgcmVzb3VyY2VzLmcubWF4ID0gTWF0aC5tYXgocmVzb3VyY2VzLmcubWF4LCByZXNvdXJjZXMuZy52YWx1ZSk7XG4gICAgICAgIHJlc291cmNlcy5iLm1heCA9IE1hdGgubWF4KHJlc291cmNlcy5iLm1heCwgcmVzb3VyY2VzLmIudmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVUaWNrKTtcblxuICAgIHVwZGF0ZVVJKCk7XG4gIH1cbn1cblxuY29uc3QgR0FNRV9DSEFOTkVMID1cbiAgY3JlYXRlQ2hhbm5lbEhhbmRsZXIoXG4gICAgR0FNRV9DSEFOTkVMX05BTUUsXG4gICAgQUREX0dBTUVfTUVTU0FHRSxcbiAgICAocGFydG5lciwgY2hhbm5lbCkgPT5cbiAgICAgICh7XG4gICAgICAgIHBhcnRuZXIsXG4gICAgICAgIGNoYW5uZWwsXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgbWVzc2FnZXM6IFtdLFxuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxuICAgICAgICB9LFxuICAgICAgICBnYW1lU3RhdGU6IHtcbiAgICAgICAgICB0aWNrOiAwLFxuICAgICAgICAgIGVudGl0aWVzOiBbXSxcbiAgICAgICAgICBlbnRpdHlQb29sOiBbXSxcbiAgICAgICAgICBwbGF5ZXJzOiBbXSxcbiAgICAgICAgICB0aWNrc1BlclNlY29uZDogNjBcbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG5cbmZ1bmN0aW9uIHNldEdhbWVNdXRhdGlvbihnYW1lLCBtdXRhdGlvbikge1xuICBnYW1lLm11dGF0aW9uID0gbXV0YXRpb247XG4gIGdhbWUuTkVXX0ZSQU1FID0gbXV0YXRpb24oTkVXX0ZSQU1FKTtcbn1cblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgR2FtZSA9ICh7Z2FtZX0sIHttdXRhdGlvbn0pID0+IChcbiAgPGdhbWU+XG4gICAge3NldEdhbWVNdXRhdGlvbihnYW1lLCBtdXRhdGlvbil9XG4gICAgPHNwYW4+R2FtZTwvc3Bhbj5cbiAgICB7Z2FtZS5nYW1lU3RhdGUuc3RhcnRlZCA/IDxHYW1lQXJlYSBnYW1lPXtnYW1lfSAvPiA6IDxTdGFydEdhbWUgZ2FtZT17Z2FtZX0gLz59XG4gIDwvZ2FtZT5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBTdGFydEdhbWUgPSAoe2dhbWV9LCB7bXV0YXRpb259KSA9PiAoXG4gIDxzdGFydC1nYW1lPlxuICAgIDxidXR0b24gb25DbGljaz17bXV0YXRpb24oQ09NTUFORCwgZ2FtZSwgbXV0YXRpb24pfT5TdGFydCBHYW1lPC9idXR0b24+XG4gIDwvc3RhcnQtZ2FtZT5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBHYW1lQXJlYSA9ICh7Z2FtZX0sIHttdXRhdGlvbn0pID0+IChcbiAgPGdhbWUtYXJlYT5cbiAgICA8c3RhdHM+XG4gICAgICB7Z2FtZS5nYW1lU3RhdGUucGxheWVycy5tYXAocGxheWVyID0+IDxQbGF5ZXJTdGF0cyBwbGF5ZXI9e3BsYXllcn0gLz4pfVxuICAgIDwvc3RhdHM+XG4gICAgPENhbnZhcyBnYW1lPXtnYW1lfSBvbkNsaWNrPXttdXRhdGlvbihDQU5WQVNfQ0xJQ0ssIGdhbWUpfSAvPlxuICAgIDxtZXNzYWdlLWFyZWE+XG4gICAgICA8TWVzc2FnZXMgbWVzc2FnZXM9e2dhbWUubWVzc2FnZXN9IC8+XG4gICAgICB7Z2FtZS5nYW1lU3RhdGUucGxheWVycy5tYXAocGxheWVyID0+IDxNZXNzYWdlcyBtZXNzYWdlcz17cGxheWVyLmNvbW1hbmRzfSAvPil9XG4gICAgPC9tZXNzYWdlLWFyZWE+XG4gIDwvZ2FtZS1hcmVhPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbi8vIGpzaGludCBpZ25vcmU6c3RhcnRcbmNvbnN0IFBsYXllclN0YXRzID0gKHtwbGF5ZXI6IHtyZXNvdXJjZXN9fSkgPT4gKFxuICA8cGxheWVyLXN0YXRzPlxuICAgIHtPYmplY3Qua2V5cyhyZXNvdXJjZXMpLm1hcChuYW1lID0+IChcbiAgICAgIDxyZXNvdXJjZS1jb250YWluZXIgY2xhc3NOYW1lPXtuYW1lfT5cbiAgICAgICAgPHJlc291cmNlLXZhbHVlPntyZXNvdXJjZXNbbmFtZV0udmFsdWUudG9GaXhlZCgxKX08L3Jlc291cmNlLXZhbHVlPlxuICAgICAgICA8cmVzb3VyY2UtYmFyIHN0eWxlPXt7J3dpZHRoJzogYCR7cmVzb3VyY2VzW25hbWVdLnZhbHVlIC8gcmVzb3VyY2VzW25hbWVdLm1heCAqIDEwMH0lYH19PjwvcmVzb3VyY2UtYmFyPlxuICAgICAgPC9yZXNvdXJjZS1jb250YWluZXI+XG4gICAgKSl9XG4gIDwvcGxheWVyLXN0YXRzPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbi8vIGpzaGludCBpZ25vcmU6c3RhcnRcbmNvbnN0IE1lc3NhZ2VzID0gKHttZXNzYWdlc30pID0+IChcbiAgPG1lc3NhZ2VzPlxuICAgIHttZXNzYWdlcy5tYXAoKHtkYXRhLCB0eXBlfSkgPT4gPGRpdj57dHlwZX08L2Rpdj4pfVxuICA8L21lc3NhZ2VzPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbi8vIGpzaGludCBpZ25vcmU6c3RhcnRcbmNsYXNzIENhbnZhcyBleHRlbmRzIENvbXBvbmVudCB7XG4gIHNldENhbnZhcyhjYW52YXMpIHtcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICB0aGlzLmNhbnZhc0NvbnRleHQgPSB0aGlzLmNhbnZhc0NvbnRleHQgfHwgY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5jYW52YXNDb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2FudmFzQ29udGV4dC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNhbnZhc0NvbnRleHQubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAvLyBjb25zb2xlLmxvZygnY2FudmFzJywgY2FudmFzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuZ2FtZSA9IHRoaXMucHJvcHMuZ2FtZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGFuaW1hdGUoKSB7XG4gICAgdGhpcy5jYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2IoMCwgMCwgMCknO1xuICAgIHRoaXMuY2FudmFzQ29udGV4dC5maWxsUmVjdCgwLCAwLCA1MDAsIDI1MCk7XG5cbiAgICB0aGlzLmdhbWUuZ2FtZVN0YXRlLmVudGl0aWVzLmZvckVhY2goKHt4LCB5LCBjb2xvciwgZG9udERyYXd9KSA9PiB7XG4gICAgICBpZiAoIWRvbnREcmF3KSB7XG4gICAgICAgIHRoaXMuY2FudmFzQ29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0LmZpbGxSZWN0KHgsIHksIDEsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcih7Z2FtZSwgb25DbGlja30pIHtcbiAgICByZXR1cm4gPGNhbnZhcyB3aWR0aD1cIjEwMFwiIGhlaWdodD1cIjUwXCIgcmVmPXt0aGlzLnNldENhbnZhcy5iaW5kKHRoaXMpfSBvbkNsaWNrPXtvbkNsaWNrfSAvPjtcbiAgfVxufVxuLy8ganNoaW50IGlnbm9yZTplbmRcblxuZXhwb3J0IHtHYW1lLCBHQU1FX0NIQU5ORUwsIEdBTUVfQ0hBTk5FTF9OQU1FfTsiLCJpbXBvcnQgeyBoLCByZW5kZXIgfSBmcm9tICdwcmVhY3QtY3ljbGUnO1xuXG5pbXBvcnQgY3JlYXRlQ2hhbm5lbEhhbmRsZXIgZnJvbSAnLi9jcmVhdGVDaGFubmVsSGFuZGxlcic7XG5cbmNvbnN0IElTU1VFU19DSEFOTkVMX05BTUUgPSAnaXNzdWVzJztcblxuY29uc3Qge1xuICBQUk9DRVNTX0lTU1VFX01FU1NBR0UsXG4gIE5FV19JU1NVRSxcbiAgQUREX0lTU1VFLFxuICBJU1NVRVNfTUVTU0FHRV9JTlBVVCxcbiAgU0hPV19JU1NVRVxufSA9IHtcbiAgUFJPQ0VTU19JU1NVRV9NRVNTQUdFOiAoXywgaXNzdWUsIHR5cGUsIHtkYXRhfSkgPT4ge1xuICAgIEFERF9JU1NVRShfLCBpc3N1ZSwgJ3BhcnRuZXInLCBKU09OLnBhcnNlKGRhdGEpKTtcbiAgfSxcblxuICBORVdfSVNTVUU6IChfLCBpc3N1ZXMpID0+IHtcbiAgICBjb25zdCB7bWVzc2FnZX0gPSBpc3N1ZXMuaW5wdXQsXG4gICAgICAgICAgZGF0YSA9IHt0aW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSwgbWVzc2FnZSwgY3JlYXRvcjogXy5zaWduYWxlci5jdXJyZW50SWQudG9TdHJpbmcoKX07XG5cbiAgICBBRERfSVNTVUUoXywgaXNzdWVzLCAnc2VsZicsIGRhdGEpO1xuXG4gICAgaXNzdWVzLmNoYW5uZWwuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgaXNzdWVzLmlucHV0Lm1lc3NhZ2UgPSAnJztcbiAgfSxcblxuICBBRERfSVNTVUU6IChfLCBpc3N1ZXMsIHR5cGUsIGRhdGEpID0+IHtcbiAgICBjb25zdCBpc3N1ZSA9IHtpZDogaXNzdWVzLmlzc3Vlcy5sZW5ndGggKyAxLCBtZXNzYWdlczogW2RhdGFdfTtcblxuICAgIGlzc3Vlcy5tZXNzYWdlcy5wdXNoKGlzc3VlKTtcbiAgICBpc3N1ZXMuaXNzdWVzLnB1c2goaXNzdWUpO1xuXG4gICAgU0hPV19JU1NVRShfLCBpc3N1ZXMsIGlzc3VlKTtcbiAgfSxcblxuICBJU1NVRVNfTUVTU0FHRV9JTlBVVDogKF8sIGlzc3Vlcywge3RhcmdldDoge3ZhbHVlfX0pID0+IHtcbiAgICBpc3N1ZXMuaW5wdXQubWVzc2FnZSA9IHZhbHVlO1xuICB9LFxuXG4gIFNIT1dfSVNTVUU6IChfLCBpc3N1ZXMsIGlzc3VlKSA9PiB7XG4gICAgaXNzdWVzLmlzc3VlRGV0YWlsID0gaXNzdWU7XG4gIH1cbn07XG5cbmNvbnN0IElTU1VFU19DSEFOTkVMID1cbiAgY3JlYXRlQ2hhbm5lbEhhbmRsZXIoXG4gICAgSVNTVUVTX0NIQU5ORUxfTkFNRSxcbiAgICBQUk9DRVNTX0lTU1VFX01FU1NBR0UsXG4gICAgKHBhcnRuZXIsIGNoYW5uZWwpID0+XG4gICAgICAoe1xuICAgICAgICBwYXJ0bmVyLFxuICAgICAgICBjaGFubmVsLFxuICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICBtZXNzYWdlczogW10sXG4gICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgbWVzc2FnZTogdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIH0pKTtcblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgSXNzdWVzID0gKHtpc3N1ZXN9LCB7bXV0YXRpb259KSA9PiAoXG4gIDxpc3N1ZXM+XG4gICAgPGRpdj5Jc3N1ZXM8L2Rpdj5cbiAgICA8aXNzdWUtbGlzdD5cbiAgICAgIHtpc3N1ZXMuaXNzdWVzLm1hcChpc3N1ZSA9PiA8aXNzdWUtaWQgb25DbGljaz17bXV0YXRpb24oU0hPV19JU1NVRSwgaXNzdWVzLCBpc3N1ZSl9IGNsYXNzTmFtZT17eydzaG93bic6IGlzc3VlID09PSBpc3N1ZXMuaXNzdWVEZXRhaWx9fT57aXNzdWUuaWR9PC9pc3N1ZS1pZD4pfVxuICAgIDwvaXNzdWUtbGlzdD5cbiAgICA8aXNzdWUtZGV0YWlsPlxuICAgICAge2lzc3Vlcy5pc3N1ZURldGFpbCA/IDxJc3N1ZSBpc3N1ZT17aXNzdWVzLmlzc3VlRGV0YWlsfSAvPiA6IHVuZGVmaW5lZH1cbiAgICA8L2lzc3VlLWRldGFpbD5cbiAgICA8aXNzdWUtaW5wdXQ+XG4gICAgICA8Zm9ybSBvblN1Ym1pdD17bXV0YXRpb24oTkVXX0lTU1VFLCBpc3N1ZXMpfSBhY3Rpb249XCJqYXZhc2NyaXB0OlwiIGF1dG9Gb2N1cz5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e2lzc3Vlcy5pbnB1dC5tZXNzYWdlfSBvbklucHV0PXttdXRhdGlvbihJU1NVRVNfTUVTU0FHRV9JTlBVVCwgaXNzdWVzKX0gcGxhY2Vob2xkZXI9XCJUeXBlIHlvdXIgaXNzdWUgaGVyZS4uLlwiIC8+XG4gICAgICAgIDxidXR0b24+TmV3IElzc3VlPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9pc3N1ZS1pbnB1dD5cbiAgPC9pc3N1ZXM+XG4pO1xuLy8ganNoaW50IGlnbm9yZTplbmRcblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgSXNzdWUgPSAoe2lzc3VlOiB7aWQsIG1lc3NhZ2VzfX0pID0+IChcbiAgPGlzc3VlPlxuICAgIDxtZXNzYWdlcz5cbiAgICAgIHttZXNzYWdlcy5tYXAoKHttZXNzYWdlfSkgPT4gKFxuICAgICAgICA8bWVzc2FnZT5cbiAgICAgICAgICB7bWVzc2FnZX1cbiAgICAgICAgPC9tZXNzYWdlPlxuICAgICAgKSl9XG4gICAgPC9tZXNzYWdlcz5cbiAgPC9pc3N1ZT5cbik7XG4vLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cbmV4cG9ydCB7SXNzdWVzLCBJU1NVRVNfQ0hBTk5FTCwgSVNTVUVTX0NIQU5ORUxfTkFNRX07IiwiaW1wb3J0IHsgaCB9IGZyb20gJ3ByZWFjdC1jeWNsZSc7XG5cbmltcG9ydCBjcmVhdGVDaGFubmVsSGFuZGxlciBmcm9tICcuL2NyZWF0ZUNoYW5uZWxIYW5kbGVyJztcblxuY29uc3QgTE9DQVRJT05fQ0hBTk5FTF9OQU1FID0gJ3RpbWUnO1xuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCB7XG4gIEFERF9MT0NBVElPTl9NRVNTQUdFLFxuICBTRU5EX0xPQ0FUSU9OX01FU1NBR0UsXG5cbiAgVE9HR0xFX0xBVEVOQ1lfTE9HXG59ID0ge1xuICBBRERfTE9DQVRJT05fTUVTU0FHRTogKF8sIHRpbWUsIHR5cGUsIHtkYXRhfSkgPT4ge1xuICAgIGlmICh0eXBlID09PSAncGFydG5lcicpIHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSk7XG5cbiAgICAgIGlmIChwYXJzZWQudHlwZSA9PT0gJ3BpbmcnKSB7XG4gICAgICAgIHRpbWUuY2hhbm5lbC5zZW5kKEpTT04uc3RyaW5naWZ5KHt0eXBlOiAncG9uZycsIHRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCB5b3VyczogcGFyc2VkLnRpbWV9KSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChwYXJzZWQudHlwZSA9PT0gJ3BvbmcnKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICBydHQgPSBub3cgLSBwYXJzZWQueW91cnMsXG4gICAgICAgICAgICAgIG9mZnNldCA9IG5vdyAtIHBhcnNlZC50aW1lLFxuICAgICAgICAgICAgICBsYXRlbmN5ID0gKG5vdyAtIHBhcnNlZC55b3VycykgLyAyO1xuXG4gICAgICAgIHRpbWUucGFydG5lckNsb2NrID0gcGFyc2VkLnRpbWUgKyBsYXRlbmN5O1xuXG4gICAgICAgIHRpbWUucnR0ID0gcnR0O1xuICAgICAgICB0aW1lLmxhdGVuY3kgPSBsYXRlbmN5O1xuICAgICAgICB0aW1lLm9mZnNldCA9IG9mZnNldDtcblxuICAgICAgICB0aW1lLm1heExhdGVuY3kgPSBNYXRoLm1heCh0aW1lLm1heExhdGVuY3kgfHwgMCwgdGltZS5sYXRlbmN5KTtcbiAgICAgICAgdGltZS5tYXhPZmZzZXQgPSBNYXRoLm1heCh0aW1lLm1heE9mZnNldCB8fCAwLCB0aW1lLm9mZnNldCk7XG5cbiAgICAgICAgdGltZS5tZXNzYWdlcy51bnNoaWZ0KHt0eXBlOiAncGluZ3BvbmcnLCB0aW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSwgZGF0YToge3J0dCwgb2Zmc2V0LCBsYXRlbmN5LCBhZGp1c3RlZFBhcnRuZXJDbG9jazogdGltZS5wYXJ0bmVyQ2xvY2ssIGxvY2FsQ2xvY2s6IG5vdywgZGlmZjogbm93IC0gdGltZS5wYXJ0bmVyQ2xvY2t9fSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIFNFTkRfTE9DQVRJT05fTUVTU0FHRTogKF8sIHRpbWUpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0ge3R5cGU6ICdwaW5nJywgdGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCl9O1xuXG4gICAgQUREX0xPQ0FUSU9OX01FU1NBR0UoXywgdGltZSwgJ3NlbGYnLCB7ZGF0YTogbWVzc2FnZX0pO1xuXG4gICAgdGltZS5jaGFubmVsLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICB9XG59O1xuLy8ganNoaW50IGlnbm9yZTogZW5kXG5cbmNvbnN0IExPQ0FUSU9OX0NIQU5ORUwgPVxuICBjcmVhdGVDaGFubmVsSGFuZGxlcihcbiAgICBMT0NBVElPTl9DSEFOTkVMX05BTUUsXG4gICAgQUREX0xPQ0FUSU9OX01FU1NBR0UsXG4gICAgKHBhcnRuZXIsIGNoYW5uZWwpID0+XG4gICAgICAoe1xuICAgICAgICBwYXJ0bmVyLFxuICAgICAgICBjaGFubmVsLFxuICAgICAgICBzdGFydDogbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgIG1lc3NhZ2VzOiBbXSxcbiAgICAgICAgcGFydG5lckxvY2F0aW9uOiBbXSxcbiAgICAgICAgeW91ckxvY2F0aW9uOiBbXSxcbiAgICAgICAgZGlzdGFuY2U6IDBcbiAgICAgIH0pKTtcblxubGV0IGludGVydmFsO1xuZnVuY3Rpb24gZW5zdXJlUGluZyh0aW1lLCBtdXRhdGlvbikge1xuICBpZiAoIWludGVydmFsKSB7XG4gICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChtdXRhdGlvbihTRU5EX0xPQ0FUSU9OX01FU1NBR0UsIHRpbWUpLCAxMDAwKTtcbiAgfVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlbW90aW9uJywgZXZlbnQgPT4gY29uc29sZS5sb2coJ2RldmljZW1vdGlvbicsIGV2ZW50KSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlb3JpZW50YXRpb24nLCBldmVudCA9PiBjb25zb2xlLmxvZygnZGV2aWNlb3JpZW50YXRpb24nLCBldmVudCkpO1xuXG5pZiAod2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICB3aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLndhdGNoUG9zaXRpb24oXG4gICAgcG9zaXRpb24gPT4gY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgcG9zaXRpb24pLFxuICAgIGVycm9yID0+IGNvbnNvbGUubG9nKCdwb3NpdGlvbiBlcnJvciEnLCBlcnJvcikpO1xufVxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBMb2NhdGlvbiA9ICh7bG9jYXRpb259LCB7bXV0YXRpb259KSA9PiAoXG4gIDxsb2NhdGlvbj5cbiAgICBQYXJ0bmVyIExvY2F0aW9uOlxuICAgIFlvdXIgTG9jYXRpb246XG4gICAgU3VyZmFjZSBEaXN0YW5jZTpcbiAgPC9sb2NhdGlvbj5cbik7XG4vLyBqc2hpbnQgaWdub3JlOiBlbmRcblxuXG5leHBvcnQge0xvY2F0aW9uLCBMT0NBVElPTl9DSEFOTkVMLCBMT0NBVElPTl9DSEFOTkVMX05BTUV9OyIsIi8vIGZ1bmN0aW9uIHVwZGF0ZVN0YXRlKHN0YXRlKSB7XG4vLyAgIGZvciAobGV0IHBhcnRuZXIgaW4gcGVlckNvbm5lY3Rpb25zKSBzZW5kU3RhdGUocGFydG5lciwgc3RhdGUpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBzZW5kU3RhdGUocGFydG5lciwgc3RhdGUpIHtcbi8vICAgY29uc3Qge2RhdGFDaGFubmVsfSA9IHBlZXJDb25uZWN0aW9uc1twYXJ0bmVyXTtcbi8vICAgdHJ5IHtcbi8vICAgICBkYXRhQ2hhbm5lbC5zZW5kKHN0cmluZ2lmeVN0YXRlKHN0YXRlKSk7XG4vLyAgIH1cbi8vICAgY2F0Y2ggKGUpIHtcbi8vICAgICBjb25zb2xlLmxvZyhgRXJyb3Igc2VuZGluZyB0byAke3BhcnRuZXJ9YCwgZSk7XG4vLyAgIH1cbi8vIH1cblxuY29uc3QgU0lHTkFMRVJfSVAgPSAnbG9jYWxob3N0JywgLy8nMTkyLjE2OC4wLjEwNScsXG4gICAgICBTSUdOQUxFUl9QT1JUID0gNDQzLFxuICAgICAgSE9TVCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0OyAvL2Ake1NJR05BTEVSX0lQfToke1NJR05BTEVSX1BPUlR9YDsgLy84MDgwO1xuXG4vKlxuYWN0aW9uczpcbiAgc2V0LXNpZ25hbGVyLXN0YXR1cyxcbiAgY2hhdC1jaGFubmVsLFxuICBwYXJ0bmVyLW1lc3NhZ2VcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25uZWN0KGlkLCBhY3Rpb25zKSB7XG4gIGlmIChXZWJTb2NrZXQgJiYgd2luZG93LmNyeXB0bykge1xuXG4gICAgLy8gY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke1NJR05BTEVSX0lQfToke1NJR05BTEVSX1BPUlR9YCk7XG4gICAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3NzOi8vJHtIT1NUfS9zaWduYWxlcmApO1xuXG4gICAgaGFuZGxlKHNvY2tldCwgaWQsIGFjdGlvbnMpO1xuXG4gICAgcmV0dXJuIChwYXJ0bmVyLCBwcm9ncmFtcywgYWN0aW9ucykgPT4ge1xuICAgICAgc29ja2V0LnNlbmQocGFydG5lcik7XG5cbiAgICAgIGxldCBwZWVyQ29ubmVjdGlvbiA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7XG4gICAgICAgIGljZVNlcnZlcnM6IFtcbiAgICAgICAgICB7dXJsczogJ3N0dW46c3R1bi5zdHVucHJvdG9jb2wub3JnJ31cbiAgICAgICAgXSxcbiAgICAgICAgaWNlVHJhbnNwb3J0czogJ2FsbCdcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0ge2Nvbm5lY3Rpb246IHBlZXJDb25uZWN0aW9ufTtcbiAgICAgIHBlZXJDb25uZWN0aW9uc1twYXJ0bmVyLmpvaW4oJywnKV0gPSBkYXRhO1xuXG4gICAgICBwcm9ncmFtcy5mb3JFYWNoKHByb2dyYW0gPT4ge1xuICAgICAgICBjb25zdCBkYXRhQ2hhbm5lbCA9IGNyZWF0ZURhdGFDaGFubmVsKHByb2dyYW0sIHBlZXJDb25uZWN0aW9uLCBhY3Rpb25zKTtcbiAgICAgICAgZGF0YVtgJHtwcm9ncmFtfURhdGFDaGFubmVsYF0gPSBkYXRhQ2hhbm5lbDtcbiAgICAgIH0pO1xuXG4gICAgICBwZWVyQ29ubmVjdGlvblxuICAgICAgICAuY3JlYXRlT2ZmZXIoXG4gICAgICAgICAgb2ZmZXIgPT4gcGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihvZmZlcikudGhlbigoKSA9PiBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShvZmZlcikpKSxcbiAgICAgICAgICBlcnJvciA9PiBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcikpO1xuXG5cblxuXG5cbiAgICAgIHBlZXJDb25uZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2ljZWNhbmRpZGF0ZScsICh7Y2FuZGlkYXRlfSkgPT4ge1xuICAgICAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoY2FuZGlkYXRlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwZWVyQ29ubmVjdGlvbi5hZGRFdmVudExpc3RlbmVyKCdpY2VnYXRoZXJpbmdzdGF0ZWNoYW5nZScsIGV2ZW50ID0+IHtcbiAgICAgICAgLy8gYWN0aW9uc1snc2V0LXN0YXR1cyddKGV2ZW50LnRhcmdldC5pY2VHYXRoZXJpbmdTdGF0ZSk7XG4gICAgICB9KTtcblxuICAgICAgcGVlckNvbm5lY3Rpb24uYWRkRXZlbnRMaXN0ZW5lcignaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJywgZXZlbnQgPT4ge1xuICAgICAgICBhY3Rpb25zWydwZWVyJ11bJ2ljZS1jb25uZWN0aW9uLXN0YXRlJ10ocGFydG5lciwgZXZlbnQudGFyZ2V0LmljZUNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgICB9KTtcblxuICAgICAgcGVlckNvbm5lY3Rpb24uYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGV2ZW50ID0+IHtcbiAgICAgICAgYWN0aW9uc1sncGVlciddWydjb25uZWN0aW9uLXN0YXRlJ10ocGFydG5lciwgJ2Nvbm5lY3RlZCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXJDb25uZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZXZlbnQgPT4ge1xuICAgICAgICBhY3Rpb25zWydwZWVyJ11bJ2Nvbm5lY3Rpb24tc3RhdGUnXShwYXJ0bmVyLCAnY2xvc2VkJyk7XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gY3JlYXRlRGF0YUNoYW5uZWwobmFtZSwgcGVlckNvbm5lY3Rpb24sIGFjdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZGF0YUNoYW5uZWwgPSBwZWVyQ29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbChuYW1lKTtcblxuICAgICAgICBkYXRhQ2hhbm5lbC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgKCkgPT4gYWN0aW9uc1sncGVlciddW2Ake25hbWV9LWNoYW5uZWwtb3BlbmBdKHBhcnRuZXIsIGRhdGFDaGFubmVsKSk7XG4gICAgICAgIC8vIGRhdGFDaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gYWN0aW9uc1tgJHtuYW1lfS1jaGFubmVsLWNsb3NlYF0ocGFydG5lciwgZGF0YUNoYW5uZWwpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmNvbnN0IHBlZXJDb25uZWN0aW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBoYW5kbGUoc29ja2V0LCBpZCwgYWN0aW9ucykge1xuICBjb25zdCBxdWV1ZSA9IFtdO1xuXG4gIGxldCBwYXJ0bmVyLCByZWFkaW5nUGFydG5lciA9IGZhbHNlO1xuXG4gIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZXZlbnQgPT4ge1xuICAgIGFjdGlvbnNbJ3NpZ25hbCddWydjb25uZWN0aW9uLXN0YXRlJ10oJ2Nvbm5lY3RlZCcpO1xuXG4gICAgc29ja2V0LnNlbmQoaWQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBwcm9jZXNzUXVldWUoKSB7XG4gICAgcXVldWUuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIHByb2Nlc3NQYXJ0bmVyTWVzc2FnZShwYXJ0bmVyLCBtZXNzYWdlKTtcbiAgICB9KTtcblxuICAgIHF1ZXVlLnNwbGljZSgwKTtcbiAgfVxuXG4gIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZlbnQgPT4ge1xuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICBjb25zdCB7ZGF0YX0gPSBldmVudDtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgIHJlYWRpbmdQYXJ0bmVyID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtwYXJ0bmVyID0gbmV3IFVpbnQ4QXJyYXkocmVhZGVyLnJlc3VsdCk7cmVhZGluZ1BhcnRuZXIgPSBmYWxzZTsgcHJvY2Vzc1F1ZXVlKCk7fSk7XG4gICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGRhdGEgIT09ICcnKSB7XG4gICAgICBxdWV1ZS5wdXNoKGRhdGEpO1xuXG4gICAgICBpZiAoIXJlYWRpbmdQYXJ0bmVyKSBwcm9jZXNzUXVldWUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICBhY3Rpb25zWydzaWduYWwnXVsnY29ubmVjdGlvbi1zdGF0ZSddKCdOb3QgQ29ubmVjdGVkJyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IGNvbm5lY3QoYWN0aW9ucyksIDUwMDApO1xuICB9KTtcblxuICBmdW5jdGlvbiBwcm9jZXNzUGFydG5lck1lc3NhZ2UocGFydG5lciwgZGF0YSkge1xuICAgIGlmICghcGFydG5lcikgdGhyb3cgbmV3IEVycm9yKCdQcm90b2NvbCBlcnJvciEgTm8gUGFydG5lciEnLCBwYXJ0bmVyLCBkYXRhKTtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuXG4gICAgYWN0aW9uc1snc2lnbmFsJ11bJ3BhcnRuZXItbWVzc2FnZSddKFtwYXJ0bmVyLCBtZXNzYWdlXSk7XG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnb2ZmZXInOiByZWNlaXZlT2ZmZXIocGFydG5lciwgbWVzc2FnZSk7IGJyZWFrO1xuICAgICAgY2FzZSAnYW5zd2VyJzogcmVjZWl2ZUFuc3dlcihwYXJ0bmVyLCBtZXNzYWdlKTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZWNlaXZlQ2FuZGlkYXRlKHBhcnRuZXIsIG1lc3NhZ2UpOyBicmVhaztcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgTWVzc2FnZSBmcm9tICR7cGFydG5lci5qb2luKCcsJyl9OiAke2RhdGF9YCk7XG4gIH1cblxuICBjb25zdCBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uO1xuXG4gIGZ1bmN0aW9uIHJlY2VpdmVPZmZlcihwYXJ0bmVyLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgcGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oe1xuICAgICAgaWNlU2VydmVyczogW1xuICAgICAgICB7dXJsczogJ3N0dW46c3R1bi5zdHVucHJvdG9jb2wub3JnJ31cbiAgICAgIF0sXG4gICAgICBpY2VUcmFuc3BvcnRzOiAnYWxsJ1xuICAgIH0pO1xuXG4gICAgcGVlckNvbm5lY3Rpb25zW3BhcnRuZXJdID0ge2Nvbm5lY3Rpb246IHBlZXJDb25uZWN0aW9uLCBwYXJ0bmVyfTtcblxuICAgIHBlZXJDb25uZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2RhdGFjaGFubmVsJywgZXZlbnQgPT4ge1xuICAgICAgY29uc3Qge2NoYW5uZWx9ID0gZXZlbnQ7XG5cbiAgICAgIGNvbnNvbGUuZGlyKGNoYW5uZWwpO1xuXG4gICAgICBwZWVyQ29ubmVjdGlvbnNbcGFydG5lcl0uZGF0YUNoYW5uZWwgPSBjaGFubmVsO1xuXG4gICAgICBhY3Rpb25zWydwZWVyJ11bYCR7Y2hhbm5lbC5sYWJlbH0tY2hhbm5lbC1vcGVuYF0ocGFydG5lciwgY2hhbm5lbCk7XG4gICAgfSk7XG5cbiAgICBwZWVyQ29ubmVjdGlvblxuICAgICAgLnNldFJlbW90ZURlc2NyaXB0aW9uKG1lc3NhZ2UpXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICAgICAgcGVlckNvbm5lY3Rpb25cbiAgICAgICAgICAgIC5jcmVhdGVBbnN3ZXIoKVxuICAgICAgICAgICAgLnRoZW4oYW5zd2VyID0+IHtcbiAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIpO1xuICAgICAgICAgICAgICBzb2NrZXQuc2VuZChwYXJ0bmVyKTtcbiAgICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoYW5zd2VyKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICApXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcblxuICAgIHBlZXJDb25uZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2ljZWNhbmRpZGF0ZScsICh7Y2FuZGlkYXRlfSkgPT4ge1xuICAgICAgaWYgKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAoIXJlYWRpbmdQYXJ0bmVyKSBzb2NrZXQuc2VuZChwYXJ0bmVyKTtcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoY2FuZGlkYXRlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwZWVyQ29ubmVjdGlvbi5hZGRFdmVudExpc3RlbmVyKCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnLCBldmVudCA9PiB7XG4gICAgICBhY3Rpb25zWydwZWVyJ11bJ2ljZS1jb25uZWN0aW9uLXN0YXRlJ10ocGFydG5lciwgZXZlbnQudGFyZ2V0LmljZUNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNlaXZlQW5zd2VyKHBhcnRuZXIsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCB7Y29ubmVjdGlvbn0gPSBwZWVyQ29ubmVjdGlvbnNbcGFydG5lcl07XG4gICAgY29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihtZXNzYWdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2VpdmVDYW5kaWRhdGUocGFydG5lciwgY2FuZGlkYXRlKSB7XG4gICAgY29uc3Qge2Nvbm5lY3Rpb259ID0gcGVlckNvbm5lY3Rpb25zW3BhcnRuZXJdO1xuICAgIGNvbm5lY3Rpb24uYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U3RhdGUoc3RhdGUpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN0YXRlLCAoaywgdikgPT4ge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odik7XG4gICAgfVxuICAgIHJldHVybiB2O1xuICB9KTtcbn0iLCJpbXBvcnQgeyBoIH0gZnJvbSAncHJlYWN0LWN5Y2xlJztcblxuaW1wb3J0IGNyZWF0ZUNoYW5uZWxIYW5kbGVyIGZyb20gJy4vY3JlYXRlQ2hhbm5lbEhhbmRsZXInO1xuXG5jb25zdCBUSU1FX0NIQU5ORUxfTkFNRSA9ICd0aW1lJztcblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3Qge1xuICBBRERfVElNRV9NRVNTQUdFLFxuICBTRU5EX1RJTUVfTUVTU0FHRSxcblxuICBUT0dHTEVfTEFURU5DWV9MT0dcbn0gPSB7XG4gIEFERF9USU1FX01FU1NBR0U6IChfLCB0aW1lLCB0eXBlLCB7ZGF0YX0pID0+IHtcbiAgICBpZiAodHlwZSA9PT0gJ3BhcnRuZXInKSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGRhdGEpO1xuXG4gICAgICBpZiAocGFyc2VkLnR5cGUgPT09ICdwaW5nJykge1xuICAgICAgICB0aW1lLmNoYW5uZWwuc2VuZChKU09OLnN0cmluZ2lmeSh7dHlwZTogJ3BvbmcnLCB0aW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSwgeW91cnM6IHBhcnNlZC50aW1lfSkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAocGFyc2VkLnR5cGUgPT09ICdwb25nJykge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgcnR0ID0gbm93IC0gcGFyc2VkLnlvdXJzLFxuICAgICAgICAgICAgICBvZmZzZXQgPSBub3cgLSBwYXJzZWQudGltZSxcbiAgICAgICAgICAgICAgbGF0ZW5jeSA9IChub3cgLSBwYXJzZWQueW91cnMpIC8gMjtcblxuICAgICAgICB0aW1lLnBhcnRuZXJDbG9jayA9IHBhcnNlZC50aW1lICsgbGF0ZW5jeTtcblxuICAgICAgICB0aW1lLnJ0dCA9IHJ0dDtcbiAgICAgICAgdGltZS5sYXRlbmN5ID0gbGF0ZW5jeTtcbiAgICAgICAgdGltZS5vZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICAgICAgdGltZS5tYXhMYXRlbmN5ID0gTWF0aC5tYXgodGltZS5tYXhMYXRlbmN5IHx8IDAsIHRpbWUubGF0ZW5jeSk7XG4gICAgICAgIHRpbWUubWF4T2Zmc2V0ID0gTWF0aC5tYXgodGltZS5tYXhPZmZzZXQgfHwgMCwgdGltZS5vZmZzZXQpO1xuXG4gICAgICAgIHRpbWUubWVzc2FnZXMudW5zaGlmdCh7dHlwZTogJ3Bpbmdwb25nJywgdGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksIGRhdGE6IHtydHQsIG9mZnNldCwgbGF0ZW5jeSwgYWRqdXN0ZWRQYXJ0bmVyQ2xvY2s6IHRpbWUucGFydG5lckNsb2NrLCBsb2NhbENsb2NrOiBub3csIGRpZmY6IG5vdyAtIHRpbWUucGFydG5lckNsb2NrfX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBTRU5EX1RJTUVfTUVTU0FHRTogKF8sIHRpbWUpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0ge3R5cGU6ICdwaW5nJywgdGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCl9O1xuXG4gICAgQUREX1RJTUVfTUVTU0FHRShfLCB0aW1lLCAnc2VsZicsIHtkYXRhOiBtZXNzYWdlfSk7XG5cbiAgICB0aW1lLmNoYW5uZWwuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gIH0sXG5cbiAgVE9HR0xFX0xBVEVOQ1lfTE9HOiAoXywgdGltZSkgPT4ge1xuICAgIHRpbWUuc2hvd0xvZyA9ICF0aW1lLnNob3dMb2c7XG4gIH1cbn07XG4vLyBqc2hpbnQgaWdub3JlOiBlbmRcblxuY29uc3QgVElNRV9DSEFOTkVMID1cbiAgY3JlYXRlQ2hhbm5lbEhhbmRsZXIoXG4gICAgVElNRV9DSEFOTkVMX05BTUUsXG4gICAgQUREX1RJTUVfTUVTU0FHRSxcbiAgICAocGFydG5lciwgY2hhbm5lbCkgPT5cbiAgICAgICh7XG4gICAgICAgIHBhcnRuZXIsXG4gICAgICAgIGNoYW5uZWwsXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgbWVzc2FnZXM6IFtdLFxuICAgICAgICBsYXRlbmN5OiAwLFxuICAgICAgICBtYXhMYXRlbmN5OiAwXG4gICAgICB9KSk7XG5cbmxldCBpbnRlcnZhbDtcbmZ1bmN0aW9uIGVuc3VyZVBpbmcodGltZSwgbXV0YXRpb24pIHtcbiAgaWYgKCFpbnRlcnZhbCkge1xuICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwobXV0YXRpb24oU0VORF9USU1FX01FU1NBR0UsIHRpbWUpLCAxMDAwKTtcbiAgfVxufVxuXG4vLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5jb25zdCBUaW1lID0gKHt0aW1lfSwge211dGF0aW9ufSkgPT4gKFxuICA8dGltZT5cbiAgICB7ZW5zdXJlUGluZyh0aW1lLCBtdXRhdGlvbil9XG4gICAgPGluZm8+XG4gICAgPG5hbWUgY2xhc3NOYW1lPXt7J3Nob3ctbG9nJzogdGltZS5zaG93TG9nfX0gb25DbGljaz17bXV0YXRpb24oVE9HR0xFX0xBVEVOQ1lfTE9HLCB0aW1lKX0+PHRvZ2dsZT57J3YnfTwvdG9nZ2xlPkxhdGVuY3k8L25hbWU+XG4gICAgICA8QmlubmVkU2VyaWVzIGJpbnM9ezV9IG1heD17dGltZS5tYXhMYXRlbmN5fSB2YWx1ZVNlbGVjdG9yPXsoe2RhdGF9KSA9PiBkYXRhLmxhdGVuY3l9IGRhdGE9e3RpbWUubWVzc2FnZXMuc2xpY2UoMCwgMTApLnJldmVyc2UoKX0gLz5cbiAgICAgIDxsYXRlbmN5PlxuICAgICAgICA8bWF4LWxhdGVuY3k+e3RpbWUubWF4TGF0ZW5jeS50b0ZpeGVkKDEpfW1zIG1heDwvbWF4LWxhdGVuY3k+XG4gICAgICAgIDx2YWx1ZT57dGltZS5sYXRlbmN5LnRvRml4ZWQoMSl9bXM8L3ZhbHVlPlxuICAgICAgPC9sYXRlbmN5PlxuICAgIDwvaW5mbz5cbiAgICB7dGltZS5zaG93TG9nID8gPE1lc3NhZ2VzIG1lc3NhZ2VzPXt0aW1lLm1lc3NhZ2VzfSBzdGFydD17dGltZS5zdGFydH0gLz4gOiB1bmRlZmluZWR9XG4gIDwvdGltZT5cbik7XG4vLyBqc2hpbnQgaWdub3JlOiBlbmRcblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgQmlubmVkU2VyaWVzID0gKHtiaW5zLCBkYXRhLCBtYXgsIHZhbHVlU2VsZWN0b3J9KSA9PiAoXG4gIDxiaW5uZWQtc2VyaWVzPlxuICAgIHtkYXRhLm1hcChpdGVtID0+IDxwb2ludCBzdHlsZT17eyd0b3AnOiAxMDAgKiAoMSAtICgxIC8gYmlucykgLSAoMSAvIGJpbnMpICogTWF0aC5mbG9vcih2YWx1ZVNlbGVjdG9yKGl0ZW0pIC8gKG1heCAvIGJpbnMpKSkgKyAnJSd9fT48L3BvaW50Pil9XG4gIDwvYmlubmVkLXNlcmllcz5cbik7XG4vLyBqc2hpbnQgaWdub3JlOiBlbmRcblxuLy8ganNoaW50IGlnbm9yZTpzdGFydFxuY29uc3QgTWVzc2FnZXMgPSAoe21lc3NhZ2VzLCBzdGFydH0pID0+IChcbiAgPG1lc3NhZ2VzPlxuICAgIHttZXNzYWdlcy5zbGljZSgwLCAyKS5tYXAoKHt0eXBlLCBkYXRhLCB0aW1lfSkgPT4gKFxuICAgICAgPG1lc3NhZ2UgY2xhc3NOYW1lPXt0eXBlfT5cbiAgICAgICAgPGNvbnRhaW5lciBjbGFzc05hbWU9e2BtZXNzYWdlLXRpbWUtJHs1ICogTWF0aC5yb3VuZCgxMDAgKiAodGltZSAtIHN0YXJ0KSAvIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0KSAvIDUpfWB9PlxuICAgICAgICAgIDxkYXRhPntKU09OLnN0cmluZ2lmeShkYXRhKX08L2RhdGE+XG4gICAgICAgIDwvY29udGFpbmVyPlxuICAgICAgPC9tZXNzYWdlPlxuICAgICkpfVxuICA8L21lc3NhZ2VzPlxuKTtcbi8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblxuZXhwb3J0IHtUaW1lLCBUSU1FX0NIQU5ORUwsIFRJTUVfQ0hBTk5FTF9OQU1FfTsiXX0=
