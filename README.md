# ecstasy
Ecstasy is a client side application framework. What if we have only single event listener, single state and single DOM manipulation place ? lets see

## Problems

1. addEventListener/removeEventListener
    Single event listener
2. arbitrary javascript object change
    Single state container
3. inefficiently dom manipulation
    Request us to manipulate your dom, don't need to touch yourself.


## Structure

![bubble flow structure](https://github.com/tasnim-reza/ecstasy/raw/master/site/img/bubble-flow.png "bubble flow structure")

 onclick event -> single event listener -> single state -> action handler/state mutator/view updater



