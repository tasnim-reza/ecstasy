/**
 * Created by tasnim.reza on 28-Apr-16.
 */
(function () {

    bubbler.createComponent({

        name: 'calculator',
        selector: 'calculator',

        modelStateUpdater: function () {
            this.onInit = function () {
                this.modelState.displayDefaultValue = '0.0';
                this.modelState.display = this.modelState.displayDefaultValue;
                this.modelState.errorMessage = "Invalid"
            };

            this.registerFor('numeric').on('click', function (event) {
                clearDisplay.call(this,[]);

                this.modelState.display += event.target.value;

                this.pubSub.publish('clearError');
                this.pubSub.publish('displayUpdate');
            });

            this.registerFor('operator').on('click', function (event) {
                var operator = event.target.value;

                if (!isOperator(this.modelState.display[this.modelState.display.length - 1]) &&
                    this.modelState.displayDefaultValue !== this.modelState.display) {
                    this.modelState.display += operator;
                    this.pubSub.publish('displayUpdate');
                }
            });

            this.registerFor('point').on('click', function (event) {
                clearDisplay.call(this,[]);
                if(!(findLastOperand(this.modelState.display).indexOf('.') > -1)) {
                    this.modelState.display += '.';
                    this.pubSub.publish('clearError');
                    this.pubSub.publish('displayUpdate');
                }
            })

            this.registerFor('clear').on('click', function (event) {
                this.modelState.display = this.modelState.displayDefaultValue;
                this.pubSub.publish('clearError');
                this.pubSub.publish('displayUpdate');
            });

            this.registerFor('equal').on('click', function (event) {
                if (isOperator(this.modelState.display[this.modelState.display.length - 1]) ||
                    (this.modelState.display === this.modelState.displayDefaultValue)) {
                    this.pubSub.publish('showError');
                    return;
                }

                this.modelState.display = getResult(this.modelState.display);

                this.pubSub.publish('displayUpdate');
            });
        },

        elementStateUpdater: function () {

        },

        viewUpdater: function () {
            this.on('displayUpdate', function (elm, evt) {
                var elm = this.domState.displayModel.getElement();
                elm.value = this.modelState.display;
            })

            this.on('clearError', function () {
                var elm = this.domState.errorModel.getElement();
                elm.hidden = true;
            });

            this.on('showError', function (elm, evt) {
                var elm = this.domState.errorModel.getElement();

                elm.hidden = false;

                elm.textContent = 'invalid !';
            })
        }

    }, ['calculator']);

    function isOperator(operator) {
        return '+-*/e'.indexOf(operator) > -1;
    }


    function getResult(values) {
        var result = 0.0;
        var operand1 = '';
        var operand2 = '';
        var operator = '';


        var result = findOperand(0, values);

        operand1 = result.operand;


        for (var i = result.idx; i < values.length; i++) {
            operator = values[result.idx + 1];

            result = findOperand(result.idx + 2, values)

            operand2 = result.operand;

            switch (operator) {
                case '+':
                    operand1 = parseFloat(operand1) + parseFloat(operand2);
                    break;
                case '-':
                    operand1 = parseFloat(operand1) - parseFloat(operand2);
                    break;
                case '*':
                    operand1 = parseFloat(operand1) * parseFloat(operand2);
                    break;
                case '/':
                    operand1 = parseFloat(operand1) / parseFloat(operand2);
                    break;
                case 'e':
                    operand1 = Math.pow(operand1, operand2);
                    break;
            }

            i = result.idx;
        }

        return operand1;
    }

    function findOperand(idx, values) {
        var operand = '';

        for (var i = idx; i < values.length; i++) {
            operand += values[i];

            if (isOperator(values[i + 1])) {
                idx = i;
                break;
            }
        }

        return {
            operand: operand,
            idx: idx
        };
    }

    function findLastOperand(values) {
        var i = values.length -1,
            operand = [];
        while (values[i] && !isOperator(values[i])) {
            operand.push(values[i--]);
        }

        return operand.reverse().join('');
    }

    function clearDisplay() {
        if (this.modelState.display === this.modelState.displayDefaultValue)
            this.modelState.display = '';
    }
})()