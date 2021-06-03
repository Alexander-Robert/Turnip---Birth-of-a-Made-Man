//code used from Nathan Altice's FSM github example
//https://github.com/nathanaltice/FSM/blob/master/lib/StateMachine.js
//slightly adapted from example 
//changes allow for additional arguments passing to state methods 
//and for specific info to be read into and out of the state machine
/*
- `possibleStates` is an object whose keys refer to the state name and whose values are instances of the `State` class (or subclasses). The class assigns the `stateMachine` property on each instance so they can call `this.stateMachine.transition` whenever they want to trigger a transition.
- `stateArgs` is a list of arguments passed to the `enter` and `execute` functions. This allows us to pass commonly-used values (such as a sprite object or current Phaser Scene) to the state methods.
*/
class StateMachine {
    constructor(initialState, possibleStates, stateArgs=[]) {
        this.initialState = initialState;
        this.possibleStates = possibleStates;
        this.stateArgs = stateArgs;
        this.transitioning = false;
        this.state = null;
        this.info = null;

        // state instances get access to the state machine via `this.stateMachine`
        // Note: "Object.values() returns an array of a given object's own enumerable property values" (MDN)
        for(const state of Object.values(this.possibleStates)) {
            state.stateMachine = this;
        }
    }

    step(...args) {
        // This method should be called in the Scene's update() loop
        // On the first step, the state is null and needs to be initialized
        // Note: "Spread syntax allows an iterable such as an array expression to be expanded in places where zero or more arguments or elements are expected." (MDN)
        if(this.state === null) {
            this.state = this.initialState;
            this.possibleStates[this.state].enter(...this.stateArgs, ...args);
        }

        if(!this.transitioning) {
            // run the current state's execute method
            return this.possibleStates[this.state].execute(...this.stateArgs, ...args);
        }
    }

    transition(newState, ...args) {
        this.transitioning = true;
        this.possibleStates[this.state].exit(...this.stateArgs, ...args);
        // console.log("stateArgs");
        // console.log(...this.stateArgs);
        // console.log("args");
        // console.log(...args);
        //It's important that we call the enter method before reassigning the state to newState
        //I think this ensures that the newState's execute method won't call before enter is finished
        this.possibleStates[newState].enter(...this.stateArgs, ...args);
        this.state = newState;
        this.transitioning = false;
    }

    getState() {return this.state;}
    getInfo() {return this.info;}
    setInfo(...args) {this.info = args;}
}

// parent class structure for all `State` subclasses
class State {
    enter() {

    }
    execute() {

    }
    exit() {

    }
}