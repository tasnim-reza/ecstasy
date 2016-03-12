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