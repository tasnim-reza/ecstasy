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
        for (var key in participants) {
            var participant = participants[key];
            participant.bubbles.forEach(function (bubble) {
                if (bubble['onInit'])
                    bubble['onInit'].call(participant.state, participant.dom);
            });
        }
    }

    function addEventListeners() {
        for (var key in browserEvents) {
            physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
        }
    }

    function eventHandler(event) {

        var token = event.target.id.split(':'),
            bubbleName = token[0],
            participant = participants[bubbleName],
            eventName = token[1],
            actionName = eventName + ':' + event.type;

        if (!participant) {
            console.log('not interested action: ', actionName);
            return;
        }

        dispatch(participant, actionName, event);
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

    window.bubbler = {
        createReusableComponent: function (options, selector) {
            components[options.name] = createComponentLite(options);
            if (selector)
                this.loadComponent(options.name, [selector]);
        },

        createComponent: function (options, selectors) {
            selectors.forEach(function(selector){
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

    //utility methods
    bubbler.parse = function (tpl, data) {
        var replacedByData = tpl.replace('{item}', data.value);
        var replacedByEventId = replacedByData.replace(/{id}/g, data.id);

        return replacedByEventId;
    }
    bubbler.isEmptyObject = function(obj){
        return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
    }
    function CreateComponent(options){
        var componentState = new ComponentState(options);
        var componentDomLite = new ComponentDomLite(options);

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
                            state.pubSub.onEvents[eventName].call(state, componentDomLite);
                        }
                    }
                };

                state.modelState = {};
                state.elementState = {
                    getElement: function (s, id) {
                        var models = modelRefs[s.selector];

                        return models;
                    }
                };

                return state;
            }

            function getRegisteredBubbles(state, options) {
                var bubbleList = [];

                bubbleFlow.forEach(function (buble) {
                    if (!options[buble]) return;

                    var func = options[buble],
                        updater = Object.create(func.prototype);

                    updater.registerFor = function (elementId) {
                        this.on = function on(eventName, callback) {
                            var key = elementId + ':' + eventName;
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

        function ComponentDomLite(option) {
            var flattenDom = Object.create(null),
                domAsString = {},
                domElement = physicalDom.document.getElementById(option.selector);
            if (!domElement) throw "No dom element found, for component: " + option.name + " , selector: " + option.selector;

            doFlattenDom(domElement.id, domElement, flattenDom, domAsString);
            flattenDom.domAsString =domAsString;
            return flattenDom;

            function doFlattenDom(componentId, domElement, flattenDom, domAsString) {
                for (var key in domElement.children) {
                    if (domElement.children.hasOwnProperty(key)) {
                        var child = domElement.children[key];
                        if (child.children.length > 0) doFlattenDom(componentId, child, flattenDom, domAsString);

                        //set unique id
                        var id = componentId + ':' + child.id;
                        child.id = id;
                        flattenDom[id] = child;
                        if(!bubbler.isEmptyObject(child.dataset))
                            domAsString[id] =child.outerHTML;
                    }
                }
            }
        }
    }
})(window, document);