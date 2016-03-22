bubbler.createComponent({
    name: 'todo',
    elementSelector: 'todo',
    templateSelector: 'todoTpl',

    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.todModel = '';
            this.modelState.todoList = [{id: 0, value: 'Call raf'}, {id: 1, value: 'Buy some drinks'}];
            this.pubSub.publish('onInitModelState');
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
        this.on('onInitModelState', function (dom) {
            this.modelState.todoList.forEach(function (listItem) {
                var addedItem = {
                    id: listItem.id,
                    value: listItem.value
                };

                var li = document.createElement('li');
                li.innerHTML = dom.template.scriptDom.innerHTML
                li.children[0].textContent = listItem.value;

                dom.element["todo:todoContainer"].appendChild(li);

            })
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

        this.on('onItemAdded', function (dom) {
            var li = document.createElement('li');
            li.innerHTML = dom.template.scriptDom.innerHTML
            li.children[0].textContent = this.modelState.todoModel.value;

            dom.element["todo:todoContainer"].appendChild(li);
        });
    }
});

