//mediator
function mediator() {
    var participants = {};
    var state = {};
    var dom = {};
    var physicalDom = {
        'document': document,
        'body': document.body
    };
    var events={
        'onclick': 'click',
        'onmousedown': 'mousedown',
        'onkeyup': 'keyup'
    }

    this.register = function (participant) {
        participants[participant.name] = participant;
        participant.id = participant.name.split(':')[0];
        participant.mediator = this;
        participant.state = state;
    }

    this.run = function (name, event, element) {
        if (!participants[name]) {
            console.log('unhandled action: ', name);
            return;
        } else {
            console.log('handled action: ', name);
        }

        var participant = participants[name];

        var targetType = event.target.type;
        var targetValue = null;
        if (targetType === 'text') {
            targetValue = parseInt(event.target.value);
        }

        participant.execute(targetValue);

        updateDom(participant)
        //call the updaters



    }

    function updateDom(participant){
        for (var t = 0; t < (participant.targets && participant.targets.length); t++) {
            var target = participant.targets[t];
            var targetParticipant = participants[target];
            targetParticipant.update(dom);
            render(targetParticipant);
        }
    }

    function render(participant){
        if(!physicalDom[participant.id]) {
            physicalDom[participant.id] = document.getElementById(participant.id)
        }

        var attrs = dom[participant.id];

        for(var key in attrs) {
            physicalDom[participant.id][key] = attrs[key]
        }

    }

    function init(){
        for(var key in events) {
            physicalDom.body.addEventListener(events[key], eventHandler)
        }
    }
    init()

    function eventHandler(event, element) {
        var actionName = event.target.id + ':' + event.type;
        med.run(actionName, event, element);
    }
}

function main() {
    med = new mediator();

    var incrementOnClickAction = {
        name: 'buttonIncrement:click',
        execute: function () {
            if (!this.state.count) this.state.count = 0;
            this.state.count++;

            this.state.color = 'rgb(' + 10 * this.state.count + ', ' + 40 * this.state.count + ', ' + 30 * this.state.count + ');';
        },
        targets: ['result', 'buttonIncrement:click', 'countResult:keyup'],
        update: function (dom) {
            if(!dom['buttonIncrement']) dom['buttonIncrement'] = {};

            dom['buttonIncrement'].style = 'background-color: ' + this.state.color;
        }
    };
    med.register(incrementOnClickAction);

    var incrementOnMouseDownAction = {
        name: 'buttonIncrement:mousedown',
        execute: function () {
            if (!this.state.count) this.state.count = 0;
            this.state.count++;

            this.state.color = 'rgb(' + 10 * this.state.count + ', ' + 40 * this.state.count + ', ' + 30 * this.state.count + ');';
        },
        targets: ['result', 'buttonIncrement:click'],
        update: function (dom) {
            if(!dom['buttonIncrement']) dom['buttonIncrement'] = {};

            dom['buttonIncrement'].style = 'background-color: ' + this.state.color;
        }
    };
    med.register(incrementOnMouseDownAction);

    var incrementView = {
        name: 'result',
        update: function (dom) {
            if(!dom[this.name]) dom[this.name] = {};
            dom[this.name].innerText = this.state.count;
        }
    }
    med.register(incrementView);

    var countResultView = {
        name: 'countResult:keyup',
        execute: function (value) {
            if (!this.state.count) this.state.count = 0;
            this.state.count = value;
        },
        update: function (dom) {
            if(!dom['countResult']) dom['countResult'] = {};
            dom['countResult'].value = this.state.count;
        },
        targets: ['result']
    }
    med.register(countResultView);
}
main();

