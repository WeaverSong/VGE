/*

    Handles events. All methods return a boolean of whether they succeeded.

*/
class EventManager
{
    public Queue: {[name: string]: {queue: {source: Object, func: Function}[], condition: Function}};
    private tick: number | undefined;

    constructor(events: {name: string, condition?: (element: unknown, triggers: unknown) => boolean}[] = [], doTick = true)
    {
        //Prepare a blank queue.
        this.Queue = {
            preTick: {
                queue: [],
                condition: () => true
            },
            tick: {
                queue: [],
                condition: () => true
            },
            postTick: {
                queue: [],
                condition: () => true
            }
        };

        //Add an array of events
        events.forEach(i => this.addEvent(i.name, i.condition));

        //Call the tick function
        if (doTick) this.startTick();

    }

    //Fires an event with an optional trigger object.
    fire(event: string, triggers = {})
    {
        //Return false if the event doesn't exist.
        if (this.Queue[event] === undefined) return false;

        this.Queue[event].queue.forEach(ele =>
        {
            //If the event's condition function accepts the element, call its function.
            if (this.Queue[event].condition(ele, triggers))
            {
                ele.func(triggers);
            }

        });
        return true;
    };

    //Subscribes to a specified event.
    subscribe(source: Object, event: string, func: Function)
    {
        //Fail if there was something wrong with the event or inputs
        if (typeof (func) !== "function"
            || this.Queue[event] === undefined
            || this.Queue[event].queue === undefined
            || typeof (source) !== "object") return false;

        this.Queue[event].queue.push({ func: func, source: source });

        return true;
    };

    //Removes your subscriptions, or only for one event if specified
    unSubscribe(source: Object, event?: string)
    {
        //If event is undefined, we want to unsubscribe from all events
        if (event === undefined)
        {
            for (let key in this.Queue)
            {
                this.Queue[key].queue.forEach((ele, index) =>
                {
                    if (ele.source === source)
                    {
                        this.Queue[key].queue.splice(index, 1);
                    }
                });
            }
            return true;
        }
        else
        {
            //Fail if there was something wrong with the event or inputs
            if (this.Queue[event] == undefined
                || this.Queue[event].queue === undefined
                || typeof (source) !== 'object') return false;

            //Remove the subscribed function
            let Event = this.Queue[event].queue;
            let temp = Event.splice(
                Event.indexOf(
                    //TODO: Fix this instead of ignoring
                    // @ts-ignore
                    Event.find(i => i.source === source)
                ),
                1);

            //If we failed to remove it, return false;
            if (typeof (temp) !== "object") return false;

            return true;
        }
    };

    //Clears the specified event, or all events if none was specified.
    clearEvent(event?: string)
    {
        if (event === undefined)
        {
            this.Queue = {
                preTick: {
                    queue: [],
                    condition: () => true
                },
                tick: {
                    queue: [],
                    condition: () => true
                },
                postTick: {
                    queue: [],
                    condition: () => true
                }
            };
        }
        else if (
            this.Queue[event] !== undefined
            && this.Queue[event].queue !== undefined
        )
        {
            this.Queue[event].queue = [];
        } else
        {
            return false;
        }

        return true
    };

    //Adds a new event.
    addEvent(name: string, condition: Function = () => true)
    {
        this.Queue[name] = {
            queue: [],
            condition
        };
        return true;
    };

    //Removes an event
    removeEvent(name: string)
    {
        if (this.Queue[name] === undefined) return false;
        delete this.Queue[name];
        return true;
    };

    //Internal tick function.
    #tick()
    {
        try
        {
            this.fire('preTick');
            this.fire('tick');
            this.fire('postTick');
        } catch (e) {
            console.error("Tick function failed.", e);
            
        }
    };

    stopTick() {
        if (this.tick === undefined) return false;
        cancelAnimationFrame(this.tick);
        this.tick = undefined;
        return true;
    };

    startTick() {
        if (this.tick !== undefined) return false;
        this.tick = requestAnimationFrame(() => this.#tick());
        return true;
    }

};