/**
 * Created by tasnim.reza on 3/15/2016.
 */

bubbler.createComponent({
    selector: 'counter',
    targetSelectors: ['counter1'],
    modelStateUpdater: function () {
        this.onInit = function () {
            this.modelState.counter = 0;
        };

        this.registerFor("increase").on("click", function () {
            this.modelState.counter++;
            this.modelState.event.publish('onIncrease');
        });

        this.registerFor("decrease").on("click", function () {
            this.modelState.counter--;
            this.modelState.event.publish('onDecrease');
        });
    },
    elementStateUpdater: function () {

    },
    viewUpdater: function () {
        this.onInit = function () {
            this.element.get('counter').innerText = this.modelState.counter;
        }

        this.on('onIncrease', function () {
            this.element.get('counter').innerText = this.modelState.counter;
        })

        this.on('onDecrease', function () {
            this.element.get('counter').innerText = this.modelState.counter;
        })
    }
});