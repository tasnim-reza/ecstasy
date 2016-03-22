/**
 * Created by Reza on 11-3-16.
 */
(function bubbleFlow() {

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
            participant= participants[bubbleName],
            eventName= token[1],
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

    this.bubbler = {
        createReusableComponent: function (options, selector) {
            components[options.name] = createComponentLite(options);
            if(selector)
                this.loadComponent(options.name, [selector]);
        },

        createComponent: function(options){
            components[options.name] = createComponentLite(options);
            renderComponent(components[options.name], options.elementSelector);

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

    function renderComponent(componentLite, targetSelector, isReusableComponent){
        var options = componentLite.options,
            state = getState(targetSelector),
            bubbleList = getRegisteredBubbles(state, options);

        var dom = manipulateDom(componentLite, targetSelector, isReusableComponent);

        if(isReusableComponent) {
            physicalDom.document.getElementById(targetSelector).appendChild(dom.templateDom);
        }

        participants[targetSelector]={
            state: state,
            bubbles: bubbleList,
            dom: dom
        };
    }

    function getRegisteredBubbles(state, options){
        var bubbleList = [];

        bubbleFlow.forEach(function (buble) {
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

    //utility methods
    bubbler.parse = function (tpl, data) {
        var replacedByData = tpl.replace('{item}', data.value);
        var replacedByEventId = replacedByData.replace(/{id}/g, data.id);

        return replacedByEventId;
    }

    function getState(selector) {
        var state = Object.create(null);

        state.selector = selector;
        state.events={};
        state.pubSub = {
            onEvents:{},
            publish: function (eventName, event) {
                if(state.pubSub.onEvents[eventName]){
                    var dom = participants[state.selector].dom;
                    state.pubSub.onEvents[eventName].call(state, dom);
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

    function createComponentLite(options) {
        return {
            options: options,
            domAsString:{
                innerHtml: physicalDom.document.getElementById(options.templateSelector).innerHTML
            }
        };
    }

    function manipulateDom(componentLite, targetSelector, isReusableComponent){
        var options = componentLite.options,
            elementSelector = options.elementSelector,
            templateSelector = options.templateSelector;
            //componentElm = physicalDom.document.getElementById(templateSelector);

        //if(isReusableComponent) {
        //    var componentTpl = componentLite.domAsString.innerHtml,
        //        //parsed = componentTpl.replace(/counter/g, targetSelector),
        //        temp = physicalDom.document.createElement('div');
        //        temp.id = targetSelector;
        //        temp.innerHTML = componentTpl;
        //}else{
        //    temp = componentElm;
        //}

        var flattenDom = {};

        if(elementSelector){
            flattenDom.element ={}
            doFlattenAndRegister(physicalDom.document.getElementById(elementSelector), flattenDom.element);
        }

        if(templateSelector){
            flattenDom.template ={}
            doFlattenAndRegister(physicalDom.document.getElementById(templateSelector), flattenDom.template);
        }

        flattenDom.selector = targetSelector;

        return flattenDom;
    }

    function doFlattenAndRegister(domElement, flattenDom){
        if(domElement.type === "text/bubble"){
            flattenDom['scriptDom'] = domElement;
            return;
        }

        for(var key in domElement.children){
            if(domElement.children.hasOwnProperty(key)){
                var child = domElement.children[key];
                if(child.children.length>0) doFlattenAndRegister(child, flattenDom);

                //set unique id
                child.id= domElement.id + ':' + child.id;
                flattenDom[child.id] = child;
            }
        }
    }

    return this;
})();