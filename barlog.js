BALROG_COUNT = 0; // Number of current Logger Instances whose names have not been specified
BALROG_COLORS = {};
BALROG_COLORS["RED"] = "color:#F00";
BALROG_COLORS["GREEN"] = "color:#0F0";
BALROG_COLORS["BLUE"] = "color:#00F";
BALROG_COLORS["BLACK"] = "color:#000";
BALROG_COLORS["WHITE"] = "color:#FFF";
BALROG_COLORS["PINK"] = "color:#F0F";
BALROG_COLORS["PURPLE"] = "color:#90F";
BALROG_COLORS["YELLOW"] = "color:#FF0";
BALROG_COLORS["ORANGE"] = "color:#FB0";


/*******************************************************************************************
 * @purpose The following Section of code is used to replicate the standard behavior of the javascript developer console
 */
class BaseLog {
    constructor(o) {
        this.data = o;
        this.who = "data";
    }
    Print() {

    }
}

class Log extends BaseLog {
    constructor(o) {
        super(o)
    }
    Print() {
        console.log(this.data)
    }
}

class Error extends BaseLog {
    constructor(o) {
        super(o)
    }
    Print() {
        console.error(this.data)
    }
}

class Warn extends BaseLog {
    constructor(o) {
        super(o)
    }
    Print() {
        console.warn(this.data)
    }
}

class Table extends BaseLog {
    constructor(o) {
        super(o)
    }
    Print() {
        console.table(this.data)
    }
}

/*******************************************************************************************
 * @purpose The following Section of code contains some helper functions for simplifying logger creation
 */

checkBalrogColors = (string) => {
    if (!string) { return false; }
    if (BALROG_COLORS[string.toUpperCase()]) { return BALROG_COLORS[string.toUpperCase()]; }
    return false;
}

/*******************************************************************************************
 * @purpose The following Section of code is used to expand upon the default behavior of the javascript developer console
 * and allow for delayed output, as well as other features to improve readability
 */

/**
 * @purpose Basic Logging Class Prototype
 *
 * @param {*} o: object table containing settings for logger and sublogger construction
 *      Currently Supported Attributes:
 *          Name: {String} Name of the logger instance
 *          Style: {String} CSS Style for the Logger
 *          Interval: {Number} Time in milliseconds between each interval
 * @return {Barlog} Logger instance
 */
function Barlog(o) {
    o = o ?? {};
    this.who = "Group";
    this.name = o.name || `Barlog_${BALROG_COUNT++}`;
    this.style = checkBalrogColors(o.style) || o.style || "color:#0FF"
    this.queue = [];
    this.interval = o.interval ?? 0;
    if (this.interval >= 1) {
        window.setInterval(this.flush.bind(this), this.interval);
    }
    this.parent = null;
    this.shouldPrint = false;
    this.subgroupCount = 0;
}

/**
 * @purpose SubLogger construction for an existing Logger instance
 *
 * @param {*} name: {String} Name of the Sub-Logger instance, Defaults to parent's name appended with its current number of subgroups
 * @param {*} style: {String} CSS Style for the Sub-Logger Instance, Defaults to parent's styling
 * @return {SubLogger} Sub-Logger instance
 */
Barlog.prototype.group = function (name, style) {
    name = name || `${this.name}_group${this.subgroupCount++}`;
    var subStyle = style || this.style;
    let group = new Barlog({ name: name, style: style, interval: 0 });
    group.parent = this;
    this.queue.push(group);
    return group;
}

/**
 * @purpose Mark the sublogger and its parents recursively to the root as having data which needs to be output upon the next flush of data
 * in order to ensure that subgroups are not flushed out needlessly
 * @param {*} flag {Boolean} Flag indicating whether or not to flush out the sublogger instance
 */
Barlog.prototype.hasLog = function (flag) {
    this.shouldPrint = flag;
    if (this.parent) this.parent.hasLog(flag);
}

/**
 * @purpose Print all contents of the Logger instance and its Sub-Logger instances
 * More user friendly method name: print as opposed to flush
 */
Barlog.prototype.Print = function () {
    this.flush();
}

/**
 * @purpose Append a traditional console assert message to the queue of the current Logger instance
 * @param cond{ition {Boolean} Conditional value where false results in the message being output by the logger
 * @param {*} variable number of arguments passed in as input in order to operate similarly to default javascript console assert
 */
Barlog.prototype.assert = function (condition) {
    let len = arguments.length;
    if (len < 2) {
        console.error("No Message Queued for Logger");
        return;
    }
    if (condition === false) {
        var newArg = arguments.slice(1);
        this.queue.push(new Log(...newArg));
        this.hasLog(true);
    }

}

/**
 * @purpose Append a traditional console error message to the queue of the current Logger instance
 * @param {*} variable number of arguments passed in as input in order to operate similarly to default javascript console error
 */
Barlog.prototype.error = function () {
    this.queue.push(new Error(...arguments));
    this.hasLog(true);
}

/**
 * @purpose Append a traditional console warning message to the queue of the current Logger instance
 * @param {*} variable number of arguments passed in as input in order to operate similarly to default javascript console warning
 */
Barlog.prototype.warn = function () {
    this.queue.push(new Warn(...arguments));
    this.hasLog(true);
}

/**
 * @purpose Append a traditional console log message to the queue of the current Logger instance
 * @param {*} variable number of arguments passed in as input in order to operate similarly to default javascript console log
 */
Barlog.prototype.log = function () {
    let len = arguments.length;
    if (len < 1) {
        console.error("No Message Queued for Logger");
        return;
    }
    this.queue.push(new Log(...arguments));
    this.hasLog(true);
}

/**
 * @purpose Append a table style console table message to the queue of the current Logger Instance
 * @param {*} data: {Object} data argument which can be represented as a table in the default javascript console table 
 */
Barlog.prototype.table = function (data) {
    this.queue.push(new Table(data));
    this.hasLog(true);
}

/**
 * @purpose Output all contents of the current Logger Instance to the javascript developer console
 */
Barlog.prototype.flush = function () {
    let len = this.queue.length;
    if (len <= 0) { return; }
    if (this.shouldPrint === false) { return; }
    console.groupCollapsed(`%c${this.name}`, `${this.style}`);
    let newQueue = [];
    for (var i = 0; i < len; i++) {
        this.queue[i].Print();
        if (this.queue[i].who === "Group") {
            newQueue.push(this.queue[i]);
        }
        this.queue[i].shouldPrint = false;
    }
    console.groupEnd();
    this.queue = newQueue;
    this.shouldPrint = false;
}
