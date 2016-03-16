/**
 * Created by Reza on 11-3-16.
 */
(function bubbleFlow() {

    var bubbleFlow = ["modelStateUpdater", "elementStateUpdater", "viewUpdater"];

    var components = {};
    var componentState = {};
    var componentsAsString = {};
    var events = {};
    var componentInit = {};
    var physicalDom = {
        'document': document,
        'body': document.body
    };
    var modelRefs = {};
    var participants = [];

    var browserEvents = {
        'onclick': 'click',
        'onmousedown': 'mousedown',
        'onkeyup': 'keyup',
        'onblur': 'blur'
    };

    (function initBubbler() {
        addEventListeners();

        //lazy call
        setTimeout(function () {
            //callInitMethods();
        });
    })();

    function addEventListeners() {
        for (var key in browserEvents) {
            physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
        }
    }

    function callInitMethods() {
        for (var key in components) {
            var component = components[key];
            component.participants.forEach(function (participant) {
                if (participant['onInit'])
                    participant['onInit'].call(component.state[key]);
            });

        }
    }

    function eventHandler(event, element) {
        var actionName = event.target.dataset.id + ':' + event.type;
        dispatch(actionName, event, element);
    }

    function dispatch(actionName, event, element) {
        if (!events[actionName]) {
            console.log('unhandled action: ', actionName);
            return;
        } else {
            console.log('handled action: ', actionName);
        }
        events[actionName].call(componentState['counter'], event, element);
    }

    this.bubbler = {
        createComponent: function (options) {
            components[options.name] = options;
        },

        loadComponent: function (componentName, selectors) {
            selectors.forEach(function (selector) {
                var options = components[componentName];

                renderComponent(options, selector, state);
            })
        }
    }

    function renderComponent(options, targetSelector, state){
        var componentElm = physicalDom.document.getElementById(options.templateSelector),
            componentTpl = componentElm.innerHTML;

        //modelRefs[selector] = componentElm.querySelectorAll('[data-model]');

        var participants = [];
        var componentState = {};

        bubbleFlow.forEach(function (buble) {
            var func = options[buble],
                updater = Object.create(func.prototype),
                key = '',
                onEvents = {};

            updater.registerFor = function (elementId) {
                this.on = function on(eventName, callback) {
                    key = elementId + ':' + eventName;
                    events[key] = callback;
                };
                return this;
            };

            updater.on = function on(eventName, callback) {
                onEvents[eventName] = callback;
            }

            func.apply(updater, []);

            updater.publish = function (eventName, event) {
                if (onEvents[eventName])
                    onEvents[eventName].call(states, event);
            }

            participants.push(updater);

        });

        physicalDom.document.getElementById(targetSelector).innerHTML = componentTpl;

        components[selector] = createComponentState(getState(targetSelector), participants)
    }

    //utility methods
    bubbler.parse = function (tpl, data) {
        var replacedByData = tpl.replace('{item}', data.value);
        var replacedByEventId = replacedByData.replace(/{id}/g, data.id);

        return replacedByEventId;
    }

    function getState(selector) {
        var state = Object.create(null);

        state.selector = selector;
        state.event = {
            publish: function (eventName, event) {
                participants.forEach(function (item) {
                    item.publish(eventName, event);
                })
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

    function createComponentState(componentState, participants) {
        return {
            state: componentState,
            participants: participants
        };
    }

    return this;
})();

/*
 screen view area. if a dom is changed in unseen area
 we actually don't need to change immediately.
 multiple view area. we can prepare multiple view area.
 but we do always only three
 current and next
 if user moved to next then we preserve the old one.
 do we actually need all the manipulated dom persist in browser ? NO

 this.element.createNode('a')
 .addAttribute('data-id',1)
 .addEventListener('onclcik','console.log('call')')
 .render();


 <a data-id="1" onclick="console.log('call') />
 */