/**
 * Created by Reza on 11-3-16.
 */
(function bubbleFlow() {

    var bubbleFlow = ["viewActions", "modelStateUpdaters", "elementStateUpdaters", "viewUpdaters"];

    var participants = [];
    var events = {};
    var state = {
        event: {
            publish: function (eventName, event) {
                participants.forEach(function (item) {
                    item.publish(eventName, event);
                })
            }
        }
    };
    var elementState = {};
    var componentInit = {};
    var states = {
        state: state,
        elementState: elementState
    };

    var physicalDom = {
        'document': document,
        'body': document.body
    };

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
            callInitMethods();
        });
    })();

    function addEventListeners() {
        for (var key in browserEvents) {
            physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
        }
    }

    function callInitMethods() {
        for (var key in componentInit) {
            componentInit[key].call(states);
        }
    }

    function eventHandler(event, element) {
        var actionName = event.target.id + ':' + event.type;
        dispatch(actionName, event, element);
    }

    function dispatch(actionName, event, element) {
        if (!events[actionName]) {
            console.log('unhandled action: ', actionName);
            return;
        } else {
            console.log('handled action: ', actionName);
        }
        events[actionName].call(states, event, element);
    }


    this.bubbler = {
        createModelStateUpdater: function (modelUpdater) {
            var updater = Object.create(modelUpdater.prototype),
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

            modelUpdater.apply(updater, []);

            if (typeof(updater.initModelState) === 'function') {
                componentInit['initModelState'] = updater.initModelState;
            }

            updater.publish = function (eventName, event) {
                if (onEvents[eventName])
                    onEvents[eventName].call(states,event);
            }

            participants.push(updater);
        },
        createElementStateStateUpdater: function (elementUpdater) {
            var updater = Object.create(elementUpdater.prototype),
                onEvents = {};
            updater.registerFor = function (elementId) {
                this.on = function (eventName, callback) {
                    events[[elementId, eventName]] = callback;
                }
                return this;
            };

            updater.on = function on(eventName, callback) {
                onEvents[eventName] = callback;
            };

            elementUpdater.apply(updater, []);

            if (typeof(updater.initElementState) === 'function') {
                componentInit['initElementState'] = updater.initElementState;
            }

            updater.publish = function (eventName, event) {
                if (onEvents[eventName])
                    onEvents[eventName].call(states, event);
            }

            participants.push(updater);
        },
        createViewUpdater: function (viewUpdater) {
            var updater = Object.create(viewUpdater.prototype),
                onEvents = {};
            updater.on = function on(eventName, callback) {
                onEvents[eventName] = callback;
            };
            viewUpdater.apply(updater, []);

            updater.publish = function (eventName, event) {
                if (onEvents[eventName])
                    onEvents[eventName].call(states, event);
            }
            participants.push(updater);
        }
    }

    //utility methods
    bubbler.parse = function (tpl, data) {
        var replacedByData = tpl.replace('{item}', data.value);
        var replacedByEventId = replacedByData.replace(/{id}/g, data.id);

        return replacedByEventId;
    }

    return this;
})();

/*(function mediator() {
 var participants = {};
 var initializedComponents = [];
 var state = {};
 var dom = {};
 var physicalDom = {
 'document': document,
 'body': document.body
 };
 var events = {
 'onclick': 'click',
 'onmousedown': 'mousedown',
 'onkeyup': 'keyup',
 'onblur': 'blur'
 };

 var ecstasy = {
 register: function (participant) {
 participants[participant.name] = participant;

 participant.id = participant.name.split(':')[0];
 participant.mediator = this;
 participant.state = state;
 participant.elementState ={
 reset: function(id, val){
 getPhysicalDom(id).value = val;
 },
 setInnerHtml: function(id, val){
 getPhysicalDom(id).innerHTML = val;
 },
 getInnerHtml: function(id){
 return getPhysicalDom(id).innerHTML;
 },
 append: function(id, val){
 var li = document.createElement('li');
 li.innerHTML = val;

 getPhysicalDom('todolist:ol').appendChild(li);
 },
 remove: function(id, val){
 var li = document.createElement('li');
 li.innerHTML = val;

 getPhysicalDom('todolist:ol').removeChild(li);
 }
 }
 },

 run: function (name, event, element) {
 var componentName = name.split(':')[0];
 var eventName = name.split(':')[1] + ':' + name.split(':')[2];
 var participant = participants[componentName];

 if (!participant || !participant['updateState:' + eventName]) {
 console.log('unhandled action: ', eventName);
 return;
 } else {
 console.log('handled action: ', eventName);
 }

 var targetType = event.target.type;
 var targetValue = null;
 if (targetType === 'text') {
 targetValue = parseInt(event.target.value);
 }

 var data = event.target.dataset;

 initComponent(participant);
 updateState(eventName, participant);
 updateView(eventName, participant);
 //participant.updateView();

 //call the updaters
 }
 }

 function initComponent(participant) {
 if (participant && !(initializedComponents.indexOf(participant.name) > -1)) {
 initializedComponents.push(participant.name);
 participant.createState()
 }
 }

 function updateState(eventName, participant) {
 eventName = 'updateState:' + eventName;



 var data = {};
 data['dataset'] = event.target.dataset;
 data[event.target.id.split(':')[1]] = event.target.value;


 participant[eventName](data);
 }

 function updateView(eventName, participant) {
 for (var t = 0; t < (participant.targets && participant.targets.length); t++) {
 var target = participant.targets[t];
 var targetParticipant = participants[target];

 targetParticipant.update(dom);
 render(targetParticipant);
 }
 }

 function render(participant) {
 if (!physicalDom[participant.id]) {
 physicalDom[participant.id] = document.getElementById(participant.id)
 }

 var attrs = dom[participant.id];

 for (var key in attrs) {
 physicalDom[participant.id][key] = attrs[key]
 }

 }

 function initMediator() {
 for (var key in events) {
 physicalDom.body.addEventListener(events[key], eventHandler,true)
 }
 }

 function getPhysicalDom(selector){
 if(!physicalDom[selector]) physicalDom[selector] = physicalDom.document.getElementById(selector);
 return physicalDom[selector];
 }
 initMediator()

 function eventHandler(event, element) {
 var actionName = event.target.id + ':' + event.type;
 ecstasy.run(actionName, event, element);
 }

 window.ecstasy = ecstasy;
 })();*/

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