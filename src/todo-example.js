//mediator
(function mediator() {
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
        'onkeyup': 'keyup'
    };

    var ecstasy = {
        register: function (participant) {
            participants[participant.name] = participant;

            participant.id = participant.name.split(':')[0];
            participant.mediator = this;
            participant.state = state;
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
            participant.updateView();

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


        var data = event.target.dataset;

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
            physicalDom.body.addEventListener(events[key], eventHandler)
        }
    }

    initMediator()

    function eventHandler(event, element) {
        var actionName = event.target.id + ':' + event.type;
        ecstasy.run(actionName, event, element);
    }

    window.ecstasy = ecstasy;
})();

function main() {

    var tpl = null;
    var todoListComponent = {
        name: 'todolist',
        createState: function () {
            this.state.todoList = [
                {id: 0, value: 'call home'},
                {id: 1, value: 'shopping'},
                {id: 2, value: 'talk to house owner'}];
        },
        ['updateState:addTodo:click']: function () {
            this.state.todoList.push({
                id: this.state.todoList.length.toString(),
                value: document.getElementById('todo').value
            })
            document.getElementById('todo').value = '';
        },
        ['updateState:done:click']: function (data) {
            this.state.todoList = this.state.todoList.filter(function (item) {
                return data.id != item.id;
            });
        },
        updateView: function () {
            if (!tpl) tpl = document.getElementById('todolist:tpl').innerHTML;

            var tplList = [];
            if (tpl.search('{item}') > 0) {
                this.state.todoList.forEach(function (item, id) {
                    var replacedByData = tpl.replace('{item}', item.value);
                    var replacedByEventId = replacedByData.replace(/{id}/g, item.id);

                    tplList.push(replacedByEventId);

                })
                //dom.todoList.add('item', item);

                document.getElementById('todolist:tpl').innerHTML = tplList.join('');
            }
        },
        targets: []
    };
    ecstasy.register(todoListComponent);
}
main();

