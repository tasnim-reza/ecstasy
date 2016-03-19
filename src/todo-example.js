bubbler.createComponent({
    name: 'todo',
    templateSelector: 'todo',
    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.todModel = '';
            this.modelState.todoList = [{id: 0, value: 'Call raf'}, {id: 1, value: 'Buy cold milk'}];
            this.pubSub.publish('onInitModelState');
        };

        this.registerFor("addTodo").on("click", function (event) {
            var listItem = {id: this.modelState.todoList.length + 1, value: this.modelState.todoModel};
            this.modelState.todoList.push(listItem);
            this.pubSub.publish('onItemAdded');
        });

        this.registerFor("todoModel").on("blur", function (event) {
            this.modelState.todoModel = event.target.value;
            this.pubSub.publish('onTodoModelChange');
        });

        this.registerFor("done").on('click', function (event) {
            this.modelState.todoList = this.modelState.todoList.filter(function (listItem) {
                listItem.id !== event.target.id;
            })
            this.pubSub.publish('onTodoComplete', event);
        });
    },

    elementStateUpdater: function () {
        this.on('onInitModelState', function (event) {
            this.elementState.listItemTpl = document.getElementById('todoListTpl').innerHTML;
            this.elementState.addedItems = [];
        });

        this.on('onItemAdded', function (event) {
            var li = document.createElement('li'),
                addedItem = {id: this.modelState.todoList.length + 1, value: this.modelState.todoModel};

            li.innerHTML = bubbler.parse(this.elementState.listItemTpl, addedItem);
            this.elementState.listItemElement = li;
            this.elementState.addedItems.push({id: addedItem.id, element: li});
        });
    },

    viewUpdater: function () {
        this.on('onInitModelState', function (event) {
            var addedItem = {id: this.modelState.todoList.length + 1, value: this.modelState.defaultModel.value};
            document.getElementById("todoListTpl").innerHTML = bubbler.parse(this.elementState.listItemTpl, addedItem);
            var li = document.getElementById("todoListTpl");

            this.elementState.addedItems.push({id: addedItem.id, element: li});
        });

        this.on('onTodoComplete', function (event) {

            var child = this.elementState.addedItems.find(function (item) {
                return item.id.toString() === event.target.dataset.id;
            });

            this.elementState.addedItems = this.elementState.addedItems.filter(function (item) {
                return item.id.toString() !== event.target.dataset.id;
            });
            document.getElementById("todoListContainer").removeChild(child.element);
        });

        this.on('onTodoModelChange', function () {
            document.getElementById("lblTodoModel").textContent = this.state.todoModel;
        });

        this.on('onItemAdded', function (dom) {
            document.getElementById("todoListContainer").appendChild(this.elementState.listItemElement);
        });
    }
});

