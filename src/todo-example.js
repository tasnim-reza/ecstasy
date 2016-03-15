bubbler.createModelStateUpdater(function () {
    this.initModelState = function () {
        this.state.defaultModel = {id: 0, value: 'dhaka'};
        this.state.todModel = '';
        this.state.todoList = [{id: 0, value: 'dhaka'}, {id: 0, value: 'rajshahi'}];
        this.state.event.publish('onInitModelState');
    };

    this.registerFor("addTodo").on("click", function (event) {
        var listItem = {id: this.state.todoList.length + 1, value: this.state.todoModel};
        this.state.todoList.push(listItem);
        this.state.event.publish('onItemAdded');
    });

    this.registerFor("todoModel").on("blur", function (event) {
        this.state.todoModel = event.target.value;
        this.state.event.publish('onTodoModelChange');
    });

    this.registerFor("done").on('click', function (event) {
        this.state.todoList = this.state.todoList.filter(function (listItem) {
            listItem.id !== event.target.id;
        })
        this.state.event.publish('onTodoComplete', event);
    });
});

bubbler.createElementStateStateUpdater(function () {
    this.on('onInitModelState', function (event) {
        this.elementState.listItemTpl = document.getElementById('todoListTpl').innerHTML;
        this.elementState.addedItems = [];
    });

    this.on('onItemAdded', function (event) {
        var li = document.createElement('li'),
            addedItem = {id: this.state.todoList.length + 1, value: this.state.todoModel};

        li.innerHTML = bubbler.parse(this.elementState.listItemTpl, addedItem);
        this.elementState.listItemElement = li;
        this.elementState.addedItems.push({id: addedItem.id, element: li});
    });
});

bubbler.createViewUpdater(function () {
    this.on('onInitModelState', function (event) {
        var addedItem = {id: this.state.todoList.length + 1, value: this.state.defaultModel.value};
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

    this.on('onItemAdded', function () {
        document.getElementById("todoListContainer").appendChild(this.elementState.listItemElement);
    });
});