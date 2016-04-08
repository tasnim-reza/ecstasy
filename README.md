# ecstasy
Ecstasy is a client side application framework. What if we have only single event listener, single state and single DOM manipulation place ? lets see :) 
creating new framework is always fun !

## Dom Manipulation

I think each frontend developer manipulate DOM of their daily life. It is not that hard as it is in the jQuery age.
Now most of the browsers are smart and doing great, they support most of the methods. But you have to remember it is not free, dom manipulation is not free. 
Dom manipulation is really slow. Walking dom is slow, we can't run in super sonic speed through DOM. 
Then what can we do ? we need to manipulate it, we need to walk.

AngularJS, ReactJS they are doing great job. There are lot of libraries out there. What we have to do, sometimes
we need to learn new syntax, the following items are awesome :)
 1. https://github.com/patrick-steele-idem/morphdom
 2. https://github.com/AmpersandJS/ampersand-dom
 3. https://github.com/Matt-Esch/virtual-dom
 4. http://lhorie.github.io/mithril/installation.html
 5. https://github.com/lhorie/mithril.js
 6. https://github.com/Bobris/Bobril
 7. https://github.com/joelrich/citojs
 8. https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/How_to_create_a_DOM_tree
 9. https://developer.mozilla.org/en-US/docs/Archive/JXON (out dated)

### Can we do something in minimal syntactic sugar ?
 Still I'm not sure, it is in POC mode. last couple of month i'm trying to do something in pure javascript, html and css. My target is
 
  1. Minimal size
  2. Minimal syntactic sugar !
  3. Take the benefit that others already have.
  4. and do we have to loose anything to achieve those goals.
   
## Single Event listener

OH NOO !! single event listener !! that is horrible, that is a MESS
Lets break some rule, We have only one event listener
        
    
    browserEvents = {
         'onclick': 'click',
         'onmousedown': 'mousedown',
         'onkeyup': 'keyup',
         'onblur': 'blur'
         //....
    };
    for (var key in browserEvents) {
        physicalDom.body.addEventListener(browserEvents[key], eventHandler, true)
    }        
    
then how we can dispatch those events ?

    <div id="todo">
        <input id="todo:addTodo" type="button" value="Add Todo"/>
        ....
    </div>
    
We need a place where we can map the html element to eventHandler. We maintain a single event storage where all the eventHandlers can be subscribed.
If event.target.id is exist in the dictionary then call the eventHandler.

    events['todo:addTodo'] = function(event){
        console.log('add todo clicked !!')
    }

## Dom manipulation
This is the tricky and tough job. Lets create two type dom representation
1. Create a DOM referenced dictionary.
2. Create a string version of DOM dictionary.

Lets see how it could be

    domElements['todo:title'] = h1 document element.
    domElements['todo:todoModel'] = input type text document element.

And

    domAsString['todo'] = "<h 1 id='todo:title'>Todo list</h1><input....."

Here `todo` is component and `todo:title` in individual element

Then how the execution will be ?
lets say `todo:todoModel` has changed for `onblur` event and this model is bound with some label. Now we need to
update that value into your js model and render back to view. Search the `domAsString` by its `id` and check the actually
changed or not. If actually changed then create new `domAsString` with new value and find that element from registered
`domElement`. Now you can simply update that particular node only ! What we gain here ? we skip actual search and value comparison
 is much more simple. Probably this is the most simple example.

Consider a complex scenario, put a search button on top of `todoModel`. If the first 3 key matched with any todo
item text then show them off as list item. Find the visible and non visible node id form `domAsString`. Remove the non-visible
node from `domElements` and keep them into different list say `removedDomElement`. Now do back and forth form `domElement` to
`removedDomNodes`. And i know this also a simple example. Lets put sort order on searched dom node.

Find the sorted node ids form `domAsString`. picked the nodes from `domElement` and finally append to the root.

## Design pattern


## Typical system has couple of problems like

1. addEventListener/removeEventListener - Solution could be
    Single event listener
2. arbitrary javascript object change - Can be managed by
    Single state container
3. inefficiently dom manipulation -
    Request us to manipulate your dom, don't need to touch yourself.
4. 
    


## Structure

![bubble flow structure](https://github.com/tasnim-reza/ecstasy/raw/master/site/img/bubble-flow1.png "bubble flow structure")

 onclick event -> single event listener -> single state -> action handler/state mutator/view updater

## Demo
<iframe src="http://embed.plnkr.co/ExSLIWfDivMp2NgUkm6j/" width="100%" height="500px"></iframe>

## Contributor
Not ready for pull request :(



