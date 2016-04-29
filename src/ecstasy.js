/**
 * Created by Reza on 11-3-16.
 */

'use strict';

(function bubbleFlow(window, document) {

    var bubbleFlow = ["modelStateUpdater", "elementStateUpdater", "viewUpdater"],
        participants = {},
        components = {},
        physicalDom = {
            'document': document,
            'body': document.body
        },
        browserEvents = {
            'onclick': 'click',
            'onmousedown': 'mousedown',
            'onkeyup': 'keyup',
            'onblur': 'blur'
        };

    (function initBubbler() {
        addEventListeners();

        //lazy call
        setTimeout(function () {
            callInitMethods();
        });
    })();

    function callInitMethods() {
        Object.keys(participants).forEach(function (key) {
            var participant = participants[key];
            participant.bubbles.forEach(function (bubble) {
                if (bubble['onInit'])
                    bubble['onInit'].call(participant.state);
            });
        });
    }

    function addEventListeners() {
        for (var key in browserEvents) {
            physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
        }
    }

    function eventHandler(event) {

        if (event.type === 'keyup') {
            return handleKeyboardShortcut(event);
        }

        if (!event.target.dataset.event) {
            console.log('not found event: ', event);
            return;
        }

        var token = event.target.dataset.event.split(':'),
        //event.target.id.split(':'),
            bubbleName = token[0],
            participant = participants[bubbleName],
            eventNameToken = token[1].split('-'),
            eventName = eventNameToken[0],
            actionName = eventName + ':' + event.type;

        if (!participant) {
            console.log('not interested action: ', actionName);
            return;
        }

        dispatch(participant, actionName, event);
    }

    function handleKeyboardShortcut(event) {
        //todo: find proper participant
        var actor = participants['calculator'];

        if (!actor) return;

        Object.keys(actor).forEach(function (key) {
            var meta = actor[key].meta,
                ref = actor[key].ref;

            if (meta && meta.keycode && (parseInt(meta.keycode) === event.keyCode)) {
                event.stopPropagation();
                ref.click();

                /*var token = meta.event.split(':'),
                 //event.target.id.split(':'),
                 bubbleName = token[0],
                 participant = participants[bubbleName],
                 eventNameToken = token[1].split('-'),
                 eventName = eventNameToken[0],
                 actionName = eventName + ':' + 'click';

                 dispatch(participant, actionName, event);*/
            }
        })

        console.log('key board', participants, event.keyCode, event.code)

    }

    function dispatch(participant, actionName, event) {
        if (!participant.state.events[actionName]) {
            console.log('unregistered action: ', actionName);
            return;
        } else {
            console.log('handled action: ', actionName);
        }

        participant.state.events[actionName].call(participant.state, event);
    }

    function renderComponent(componentLite, targetSelector, isReusableComponent) {
        var options = componentLite.options;


        var dom = manipulateDom(componentLite, targetSelector, isReusableComponent);

        if (isReusableComponent) {
            physicalDom.document.getElementById(targetSelector).appendChild(dom.templateDom);
        }

        participants[targetSelector] = {
            state: state,
            bubbles: bubbleList,
            dom: dom
        };
    }

    function CreateComponent(options) {
        var componentState = new ComponentState(options);
        var componentDomLite = new ComponentDomLite(options, componentState.state);

        components[options.name] = Object.assign(componentState, componentDomLite);
        console.log('component', components[options.name]);

        function ComponentState(options) {
            var state = new State(),
                bubbleList = getRegisteredBubbles(state, options);
            return {
                state: state,
                bubbles: bubbleList
            };

            function State(selector) {
                var state = Object.create(null);

                state.selector = selector;
                state.events = {};
                state.pubSub = {
                    onEvents: {},
                    publish: function (eventName, event) {
                        if (state.pubSub.onEvents[eventName]) {
                            //ToDo: should send specific dom instead componentDomLite
                            //var dom = participants[state.selector].dom;
                            state.pubSub.onEvents[eventName].call(state, componentDomLite, event);
                        }
                    }
                };

                state.modelState = {};
                state.domState = new DomState();
                state.elementState = new ElementState();

                return state;
            }

            function DomState() {

            }

            function ElementState() {
                this.removeChild = function (elementId) {
                    var tplEl = this.getElement();
                    var elId = tplEl.id.split(':')[0] + ':' + elementId;
                    flattenDom[elId].remove()
                    delete flattenDom[elId];
                }

                this.appendChild = function (container, child, item) {
                    var containerElm = getElement(container);
                    var childElm = getElement(child);
                    appendChild(containerElm, childElm, item)
                }

                this.appendChilds = function (container, child, items) {
                    var containerElm = getElement(container);
                    var childElm = getElement(child);

                    items.forEach(function (item) {
                        appendChild(containerElm, childElm, item)
                    })
                }

                function appendChild(containerElm, childElm, item) {
                    var t = document.importNode(childElm.ref.content, true);

                    setValue(t.children[0], item);

                    containerElm.ref.appendChild(t);
                }

                function setValue(tpl, item) {
                    //applyValue(tpl, item, true);
                    for (var i = 0; i < tpl.children.length; i++) {
                        var child = tpl.children[i];
                        if (child.children.length > 0)
                            setValue(child, item);

                        applyValue(child, item)
                    }
                }

                function applyValue(child, item) {
                    Object.keys(item).forEach(function (key) {
                        var value = item[key];
                        var data = child.dataset;
                        Object.keys(data).forEach(function (key1) {
                            if (key1 === 'value' && data[key1].indexOf(key) > -1)
                                child.textContent = item[key];
                            child.dataset[key1] = child.dataset[key1].replace('${' + key + '}', item[key]);
                        })

                        componentDomLite.push({
                            meta: data,
                            ref: child
                        });
                    })
                }

                function getElement(dataElement) {
                    //dataElement || dataTemplate

                    var foundKey = Object.keys(componentDomLite).filter(function (key) {
                        var element = componentDomLite[key];
                        return (element.meta.element === dataElement) || (element.meta.template === dataElement);
                    });

                    return componentDomLite[foundKey];
                }
            }

            function getRegisteredBubbles(state, options) {
                var bubbleList = [];

                bubbleFlow.forEach(function (buble) {
                    if (!options[buble]) return;

                    var func = options[buble],
                        updater = Object.create(func.prototype);

                    updater.registerFor = function (selector) {
                        //todo: check valid selector
                        this.on = function on(eventName, callback) {
                            var key = selector + ':' + eventName;
                            state.events[key] = callback;
                        };
                        return this;
                    };

                    updater.on = function on(eventName, callback) {
                        state.pubSub.onEvents[eventName] = callback;
                    }

                    func.apply(updater, []);

                    bubbleList.push(updater);
                });

                return bubbleList;
            }
        }

        function ComponentDomLite(option, state) {
            var flattenDom = [],
                domElement = physicalDom.document.getElementById(option.selector);

            if (!domElement)
                throw "No dom element found, for component: " + option.name + " , selector: " + option.selector;

            doFlattenDom(domElement.id, domElement, flattenDom, state.domState, new DomMethod());

            return flattenDom;

            function doFlattenDom(componentId, domElement, flattenDom, domState) {
                Object.keys(domElement.children).forEach(function (key) {
                    var child = domElement.children[key];

                    if (child) {
                        if (child.children.length > 0)
                            doFlattenDom(componentId, child, flattenDom, domState);

                        var data = child.dataset;

                        //todo: don't need to create each dom method
                        domState[data.model] = new DomMethod(child);

                        //set unique id
                        //var id = componentId + ':' + (child.id | autoId);
                        //child.id = id;
                        //
                        if (data.event || data.model || data.keycode || data.element || data.template) {
                            flattenDom.push({
                                meta: data,
                                ref: child
                            });
                        }
                    }

                });
            }

            function DomMethod(element) {
                this.getElement = function () {
                    return element;
                }
            }


        }
    }

    window.bubbler = {
        createReusableComponent: function (options, selector) {
            components[options.name] = createComponentLite(options);
            if (selector)
                this.loadComponent(options.name, [selector]);
        },

        createComponent: function (options, selectors) {
            selectors.forEach(function (selector) {
                new CreateComponent(options);
                participants[selector] = components[options.name];
            });
        },

        /*
         targetSelectors: where the component will be loaded.
         */
        loadComponent: function (componentName, targetSelectors) {
            var componentLite = components[componentName],
                isReusableComponent = true;
            targetSelectors.forEach(function (targetSelector) {
                renderComponent(componentLite, targetSelector, isReusableComponent);
            })
        }
    }

    //utility methods
    bubbler.parse = function (tpl, data) {
        var replacedByData = tpl.replace('{item}', data.value);
        var replacedByEventId = replacedByData.replace(/{id}/g, data.id);

        return replacedByEventId;
    }
    bubbler.isEmptyObject = function (obj) {
        return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
    }
})(window, document);