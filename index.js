class TimersManager {
    constructor() {
        this.timers = [];
        this.timersQueue = [];
        this.timersOnPause = [];
        this._logCallbacks = [];
    }

    add(timer, ...args) {
        if (!timer.name || !timer.name.length || typeof timer.name !== "string") {
            throw new Error("Поле name содержит неверный тип, отсутствует или пустая строка")
        }

        if (!timer.delay || isNaN(timer.delay)) {
            throw new Error("Поле delay содержит неверный тип или отсутствует.")
        }

        if (timer.delay < 0 || timer.delay > 5000) {
            throw new Error("Поле delay меньше 0 или больше 5000")
        }

        if (typeof timer.interval !== "boolean") {
            throw new Error("Поле interval содержит неверный тип или отсутствует.")
        }

        if (typeof timer.job !== "function") {
            throw new Error("Поле job должно быть функцией")
        }
        timer.args = args;

        this.timers.push(timer);

        return this;
    }

    start() {
        console.log("start timers")

        this.timers.map(timer => {
            let { name, delay, interval, job, args } = timer;
            const cb = () => this._log({ name, args, out: job(...args) });

            const timerID = interval ? setInterval(cb, delay) : setTimeout(cb, delay);

            this.timersQueue.push({ name, timerID, interval, })
        })
    }

    _log({ name, args, out, }){
        this._logCallbacks.push({
            name,
            args,
            out,
            created: Date.now()
        })
    }

    print() {
        console.log(this._logCallbacks);
    }

    startSimpleTimer(timer) {
        let { name, delay, interval, job } = timer;

        const timerID = interval ? setInterval(job, delay) : setTimeout(job, delay);

        return timerID;
    }

    stop() {
        this.timersQueue.forEach(({ timerID, interval }) => {
            interval ? clearInterval(timerID) : clearTimeout(timerID);
        })

        console.log("stop timers");
    }

    remove(timerName) {
        if (!timerName) {
            throw new Error("Введите имя таймера");
        }

        const timer = this.timersQueue.find(({ name }) => name === timerName);

        if (!timer) {
            console.log(`Запрашываемый таймер - ${ timerName } не найден`);
            return;
        }

        timer.interval ? clearInterval(timer.timerID) : clearTimeout(timer.timerID);

        this.timersQueue = this.filterTimerByName(this.timersQueue, timerName);

        console.log(`remove timer ${ timerName }`)
    }

    pause(timerName) {
        this.remove(timerName);
        const timer = this.timers.find(({ name }) => name === timerName);

        if (!timer) {
            console.log(`Запрашываемый таймер - ${ timerName } не найден`);
            return;
        }

        this.timersOnPause.push(timer);
        this.timersQueue = this.filterTimerByName(this.timersQueue, timerName);

        console.log(`Таймер ${ timerName } поставлен на паузу`)
    }

    resume(timerName) {
        const timer = this.timersOnPause.find(({ name }) => name === timerName);

        if (!timer) {
            console.log(`Запрашываемый таймер - ${ timerName } не найден`);
            return;
        }

        this.timersQueue.push({
            name: timer.name,
            timerID: this.startSimpleTimer(timer),
            interval: timer.interval,
        });

        this.timersOnPause = this.filterTimerByName(this.timersOnPause, timerName);

        console.log(` Таймер - ${ timerName } снова запущен`);
        console.log(this.timersQueue)
    }

    filterTimerByName = (data, timerName) => {
        return data.filter(({ name }) => name !==  timerName)
    }
}

const manager = new TimersManager();

const t1 = {
    name: 't1',
    delay: 1000,
    interval: true,
    job: (a, b) => a + b
};

const t2 = {
    name: 't2',
    delay: 1000,
    interval: true,
    job: (a, b) => console.log("t2")
};

manager.add(t1, 1, 2);

manager.start();

setInterval(() => {
    console.log(manager.print())
}, 1000)

// setTimeout(() => {
//     manager.pause("t2");
// }, 3000);


// setTimeout(() => {
//     manager.resume("t2");
// }, 6000);