Balrog = {
    count: 0,
}
class BaseLog {
    constructor(o) {
        this.data = o;
        this.who = "data";
    }
    Print()
    {

    }
}

class Log extends BaseLog{
    constructor(o){
        super(o)
    }
    Print()
    {
        console.log(this.data)
    }
}

class Table extends BaseLog{
    constructor(o){
        super(o)
    }
    Print()
    {
        console.table(this.data)
    }
}

function Barlog(o){
    this.who = "Group";
    this.name = o.name || `Barlog_${Balrog.count++}`;
    this.style = o.style || "color:#0FF"
    this.queue = [];
    this.interval = o.interval ?? 1000;
    if(this.interval >= 1){
        window.setInterval(this.flush.bind(this), this.interval);
    }
    this.subgroupCount = 0;
}

Barlog.prototype.group = function(name)
{
    name = name || `${this.name}_group${this.subgroupCount++}`;
    let group = new Barlog({name:name, style:this.style, interval:0});
    this.queue.push(group);
    return group;
}

Barlog.prototype.Print = function()
{
    this.flush();
}

Barlog.prototype.log = function()
{
    let len = arguments.length;
    let logMsg = '';
    if (len < 1){
        console.error("No Message Queued for Logger");
        return;
    }
    for(var i =0;i<len;i++){
        logMsg += `${arguments[i]} `;
    }

    this.queue.push(new Log(logMsg));
}

Barlog.prototype.table = function (data)
{
    this.queue.push(new Table(data));
}

Barlog.prototype.flush = function(){
    let len = this.queue.length;
    if(len <= 0){return;}
    console.groupCollapsed(`%c${this.name}`, `${this.style}`);
    let newQueue = [];
    for(var i =0;i<len;i++){
        this.queue[i].Print();
        if(this.queue[i].who === "Group"){
            newQueue.push(this.queue[i]);
        }
    }
    console.groupEnd();
    this.queue = newQueue;
}
