//mediator
function mediator() {
    var participants = {};
    var state = {};

    this.register = function (participant) {
        participants[participant.name] = participant;
        participant.mediator = this;
        participant.state = state;
    }

    this.dispatch = function (message, from, to) {
        if (to)
            to.receive(message, from);
        else
            for (var key in participants) {
                if (participants[key] !== from) {
                    participants[key].receive(message, from);
                }
            }
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

        //call the updaters
        for (var t = 0; t < (participant.targets && participant.targets.length); t++) {
            var target = participant.targets[t];
            var targetParticipant = participants[target];
            targetParticipant.update();
        }
    }
}

//producer
function producer(med, participant) {
    med.register(participant);
}

function consumer(med, participant) {
    med.dispatch("Hello World", participant);
}

var participant = function (name) {
    this.name = name;
    this.mediator = null;

    this.dispatch = function (message, to) {
        this.mediator.dispatch(message, this, to);
    };

    this.receive = function (message, from) {
        console.log(from.name + " to " + this.name + ": " + message);
    }
};

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
        update: function () {
            document.getElementById('buttonIncrement').style = 'background-color: ' + this.state.color;
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
        update: function () {
            document.getElementById('buttonIncrement').style = 'background-color: ' + this.state.color;
        }
    };
    med.register(incrementOnMouseDownAction);

    var incrementView = {
        name: 'result',
        update: function () {
            document.getElementById(this.name).innerText = this.state.count;
        }
    }
    med.register(incrementView);

    var countResultView = {
        name: 'countResult:keyup',
        execute: function (value) {
            if (!this.state.count) this.state.count = 0;
            this.state.count = value;
        },
        update: function () {
            document.getElementById('countResult').value = this.state.count;
        },
        targets: ['result']
    }
    med.register(countResultView);
}
main();

function eventHandler(event, element) {
    var actionName = event.target.id + ':' + event.type;
    med.run(actionName, event, element);
}