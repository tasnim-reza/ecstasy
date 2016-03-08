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

    /*utility*/
    dom.add = function(key,val){

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
        participant.update(dom);

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

    var todoListView ={
        name: 'loadDefault:click',
        execute: function(){
            if (!this.state.todoList) this.state.todoList = ['call home', 'shopping', 'talk to house owner'];
        },
        update: function(dom){
            var tpl = document.getElementById('todoList').innerHTML;
            var tplList = [];
            this.state.todoList.forEach(function (item) {

                tplList.push(tpl.replace('{item}',item));

            })
            //dom.todoList.add('item', item);

            document.getElementById('todoList').innerHTML = tplList.join('');
        }
    }
    med.register(todoListView);

    var tpl = undefined;
    var todoListView ={
        name: 'addTodo:click',
        execute: function(){
            if (!this.state.todoList) this.state.todoList = [];
            this.state.todoList.push(document.getElementById('todo').value)
        },
        update: function(dom){
            if(!tpl) tpl = document.getElementById('todoList').innerHTML;
            var tplList = [];
            if(tpl.search('{item}')>0) {
                this.state.todoList.forEach(function (item) {

                    tplList.push(tpl.replace('{item}', item));

                })
                //dom.todoList.add('item', item);

                document.getElementById('todoList').innerHTML = tplList.join('');
            }
        }
    }
    med.register(todoListView);
}
main();

