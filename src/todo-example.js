(function main() {

    var tpl = null;
    var todoListComponent = {
        name: 'todolist',
        createState: function () {
            this.state.todoList = [
                {id: 0, value: 'call home'},
                {id: 1, value: 'shopping'},
                {id: 2, value: 'talk to house owner'}];
            this.state.todoModel = 'first value';
        },
        ['updateState:todoModel:blur']: function (data) {
            this.state.todoModel = data.todoModel;
        },
        ['updateState:addTodo:click']: function () {
            var item = {
                id: this.state.todoList.length.toString(),
                value: this.state.todoModel
            };
            this.state.todoList.push(item);
            this.elementState.reset('todolist:todoModel', '');

            if (!tpl) tpl = this.elementState.getInnerHtml('todolist:tpl');
            var replacedByData = tpl.replace('{item}', item.value);
            var replacedByEventId = replacedByData.replace(/{id}/g, item.id);

            this.elementState.append('todolist:tpl', replacedByEventId);
        },
        ['updateState:done:click']: function (data) {
            this.state.todoList = this.state.todoList.filter(function (item) {
                return data.id != item.id;
            });

            this.elementState.removeChild()
        },
        updateView: function () {
            if (!tpl) tpl = this.elementState.getInnerHtml('todolist:tpl');

            var tplList = [];
            if (tpl.search('{item}') > 0) {
                this.state.todoList.forEach(function (item, id) {
                    var replacedByData = tpl.replace('{item}', item.value);
                    var replacedByEventId = replacedByData.replace(/{id}/g, item.id);

                    tplList.push(replacedByEventId);

                })
                //dom.todoList.add('item', item);

                this.elementState.setInnerHtml('todolist:tpl', tplList.join(''));
            }
        },
        targets: []
    };
    ecstasy.register(todoListComponent);
})();

(function bubbleFlow(){

    var bubbleFlow =["viewActions", "modelStateUpdaters", "elementStateUpdaters", "viewUpdaters"];

    var events = {};
    var state = {
        event:{
            publish: function(eventName){
                events[eventName]();
            }
        }
    }
    var elementState = {};

    this.bubbleFlow={
        createModelStateUpdater: function(modelUpdater){
            var updater = Object.create(modelUpdater.prototype),
                key = '';
            updater.registerFor = function(elementId){
                this.on = function(eventName, callback){
                    key = elementId + ':' + eventName;
                    events[key] = callback;
                }
                return this;
            };

            updater.state = state;
            modelUpdater.apply(updater,[]);
            var foo = events[key];
            foo.bind(updater);

            setTimeout(function(){
                events['addTodo:click']({});
            })
        },
        createElementStateStateUpdater: function(elementUpdater){
            var updater = Object.create(elementUpdater.prototype);
            updater.registerFor = function(elementId){
                this.on = function(eventName, callback){
                    events[[elementId,eventName]] = callback;
                }
                return this;
            };

            updater.elementState = elementState;
            elementUpdater.apply(updater,[]);
        },
        createViewUpdater: function(viewUpdater){
            var updater = Object.create(viewUpdater.prototype);
            viewUpdater.apply(updater,[]);
            for(var key in updater){
                events[key] = updater[key];
            }
            updater.state = state;
            updater.elementState = elementState;
        }
    }
    return this;
})();

bubbleFlow.createModelStateUpdater(function(){
    this.initModelState= function(){
        this.state.todModel = '';
        this.state.todoList = [{id:0, value: 'dhaka'}, {id:0, value: 'rajshahi'}];
    };

    this.registerFor("addTodo").on("click", function(event){
        var listItem = {id: this.state.todoList.length+1, value: this.state.todoModel};
        this.state.todoList.push(listItem);
        this.state.event.publish('onItemAdded');
    });

    this.registerFor("todoModel").on("blur", function(){
        this.state.todoModel = event.target.value;
        this.state.event.publish('onTodoModelChange');
    });

    this.registerFor("done").on('click', function(event){
        this.state.todoList = this.state.todoList.filter(function(listItem){
            listItem.id !== event.target.id;
        })
        this.state.event.publish('onTodoComplete');
    });
});

bubbleFlow.createElementStateStateUpdater(function(){
    this.initElementState = function(){
        this.elementState.listItemTpl = document.getElementById('todoListTpl').innerHTML;
    };

    this.registerFor('todoListTpl').on('onItemAdded', function (){
        var li = document.createElement('li');
        li.innerHTML = bubble.parse(this.elementState.listItemTpl, this.state.todoModel);
        this.elementState.listItemElement = li;
    })
});

bubbleFlow.createViewUpdater(function(){
    this.onTodoComplete =function(){
        document.getElementById("todoListContainer").appendChild(this.elementState.listItemElement);
    };

    this.onTodoModelChange = function(){
        document.getElementById("lblTodoModel").textContent = this.state.todoModel;
    };

    this.onItemAdded = function(){
        document.getElementById("todoListContainer").appendChild(this.elementState.listItemElement);
    };
});