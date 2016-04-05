bubbler.createComponent({
    name: 'myTodo',
    selector: 'todo',

    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.todModel = '';
            this.modelState.todoList = [{id: 0, value: 'Call raf'}, {id: 1, value: 'Buy some drinks'}];
            //this.pubSub.publish('onInitModelState');
        };

        this.registerFor("addTodo").on("click", function (event) {
            this.modelState.todoList.push(this.modelState.todoModel);
            this.pubSub.publish('onItemAdded');
        });

        this.registerFor("todoModel").on("blur", function (event) {
            this.modelState.todoModel = {
                id: this.modelState.todoList.length + 1,
                value: event.target.value
            };
        });

        this.registerFor("done").on('click', function (event) {
            this.modelState.todoList = this.modelState.todoList.filter(function (listItem) {
                listItem.id !== event.target.id;
            })
            this.pubSub.publish('onTodoComplete', event);
        });
    },

    elementStateUpdater: function () {
        //this.onInit = function (dom) {
        //    this.elementState.addedItems = [];
        //};
        //
        //this.on('onItemAdded', function (event) {
        //    var li = document.createElement('li'),
        //        addedItem = {id: this.modelState.todoList.length + 1, value: this.modelState.todoModel};
        //
        //    li.innerHTML = bubbler.parse(this.elementState.listItemTpl, addedItem);
        //    this.elementState.listItemElement = li;
        //    this.elementState.addedItems.push({id: addedItem.id, element: li});
        //});
    },

    viewUpdater: function () {
        this.onInit = function () {
            this.domState.todoContainer.appendChilds(this.domState.todoTpl, this.modelState.todoList);
        };

        this.on('onTodoComplete', function (event) {
            var elementId = event.target.dataset.eventParam;
            this.domState.todoContainer.removeChild(elementId);
        });

        this.on('onItemAdded', function () {
            this.domState.todoContainer.appendChild(this.domState.todoTpl, this.modelState.todoModel);
        });
    }
}, ['todo']);

