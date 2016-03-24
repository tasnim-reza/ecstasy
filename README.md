# ecstasy
Ecstasy is a client side application framework. What if we have only single event listener, single state and single DOM manipulation place ? lets see :) 
creating new framework is always fun !

## Dom Manipulation

I think each developer do dom manipulation in sometimes of their daily life. It is not that hard as it is in jQuery age.
Now most of the browsers are smart and doing great, they support most of the methods. But you have to remember it is not free, dom manipulation is not free. 
Dom manipulation is really slow. Walking dom is slow, we can't run in super sonic speed through DOM. 
Then what can we do ? we need to manipulate it, we need to walk.

AngularJS, ReactJS they are doing great job. There are lot more library out there. What we have to do, we need to learn new syntax.

### Can we do something in minimal syntactic sugar ?
 Still I'm not sure, it is in POC mode. last couple of month i'm trying to do something in pure javascript, html and css. My target is
 
  1. Minimal size
  2. Minimal syntactic sugar !
  3. Take the benefit that others already taken.
  4. and see what we have to lost to achieve those goal.
   
## Single Event listener

OH NOO !! single event listener !! that is horrible, that is a MESS
Lets break some rule, We have only one event listener
        
    
    `browserEvents = {
         'onclick': 'click',
         'onmousedown': 'mousedown',
         'onkeyup': 'keyup',
         'onblur': 'blur'
         //....
    };
    for (var key in browserEvents) {
        physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
    }`        
    
then how we can dispatch those events ?

    `<div id="todo">
        <input id="todo:addTodo" type="button" value="Add Todo"/>
        ....
    </div>
    
We need a place where we can map the html element to eventHandler. We maintain a single event storage where all the eventHandlers can be subscribed.
    `events['todo:addTodo'] = function(event){
        console.log('add todo clicked !!')
     }`



## Problems

1. addEventListener/removeEventListener
    Single event listener
2. arbitrary javascript object change
    Single state container
3. inefficiently dom manipulation
    Request us to manipulate your dom, don't need to touch yourself.
4. 
    


## Structure

![bubble flow structure](https://github.com/tasnim-reza/ecstasy/raw/master/site/img/bubble-flow1.png "bubble flow structure")

 onclick event -> single event listener -> single state -> action handler/state mutator/view updater



