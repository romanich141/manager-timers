class TimersManager {
    constructor() {
        this.timers = [];
        this.timersQueue = [];
        this.pauseTimers = [];
    }

    add(timer, ...args) {
        if (!timer.name || !timer.name.length || timer.name !== "string") {
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

        this.timers.push(timer);

        return this;
    }

    start() {
        console.log("start timers")

        this.timers.map(timer => {
            let { name, delay, interval, job } = timer;

            const timerID = interval ? setInterval(job, delay) : setTimeout(job, delay);

            this.timersQueue.push({ name, timerID, interval, })
        })
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

        this.pauseTimers.push(timer);
        this.timersQueue = this.filterTimerByName(this.timersQueue, timerName);

        console.log(`Таймер ${ timerName } поставлен на паузу`)
    }

    resume(timerName) {
        const timer = this.pauseTimers.find(({ name }) => name === timerName);

        if (!timer) {
            console.log(`Запрашываемый таймер - ${ timerName } не найден`);
            return;
        }

        this.timersQueue.push({
            name: timer.name,
            timerID: this.startSimpleTimer(timer),
            interval: timer.interval,
        });

        this.pauseTimers = this.filterTimerByName(this.pauseTimers, timerName);

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
    job: () => { console.log('t1') }
};

const t2 = {
    name: 't2',
    delay: 1000,
    interval: true,
    job: (a, b) => console.log("t2")
};

manager.add(t1).add(t2);

manager.start();


setTimeout(() => {
    manager.pause("t2");
}, 3000);


setTimeout(() => {
    manager.resume("t2");
}, 6000);