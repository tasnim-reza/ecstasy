/**
 * Created by tasnim.reza on 3/15/2016.
 */

bubbler.createComponent({
    name: 'counter',
    templateSelector: 'counter',
    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.counterModel = -1;
        };

        this.registerFor("increase").on("click", function () {
            this.modelState.counterModel++;
            this.pubSub.publish('onIncrease');
        });

        this.registerFor("decrease").on("click", function () {
            this.modelState.counterModel--;
            this.pubSub.publish('onDecrease');
        });
    },
    elementStateUpdater: function () {

    },
    viewUpdater: function () {
        this.onInit = function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        }

        this.on('onIncrease', function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        })

        this.on('onDecrease', function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        })
    }
});

bubbler.createReusableComponent({
    name: 'counter',
    templateSelector: 'counterTpl',
    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.counterModel = -1;
        };

        this.registerFor("increase").on("click", function () {
            this.modelState.counterModel++;
            this.pubSub.publish('onIncrease');
        });

        this.registerFor("decrease").on("click", function () {
            this.modelState.counterModel--;
            this.pubSub.publish('onDecrease');
        });
    },
    elementStateUpdater: function () {

    },
    viewUpdater: function () {
        this.onInit = function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        }

        this.on('onIncrease', function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        })

        this.on('onDecrease', function (dom) {
            dom[dom.selector + ':valueCounterModel'].innerText = this.modelState.counterModel;
        })
    }
});

/*
bubbler.renderComponent('component name', 'selectorId')
*/
bubbler.loadComponent('counter', ['counter1', 'counter2', 'counter3'])