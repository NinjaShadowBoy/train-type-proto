export class User {
    constructor(username, password) {
        let now = (new Date()).getTime()
        this.username = username
        this.password = password
        this.perf = []
        this.challenges = []
        this.customExos = []
        this.avg_speed = 0
        this.avg_acc = 0
    }
    static newUser(obj) {
        let user = new User()
        user.username = obj.username
        user.password = obj.password
        user.perf = obj.perf ? obj.perf : []
        user.challenges = obj.challenges ? obj.challenges : []
        user.customExos = obj.customExos ? obj.customExos : []
        user.avg_speed = obj.avg_speed ? obj.avg_speed : 0
        user.avg_acc = obj.avg_acc ? obj.avg_acc : 0
        return user
    }
}

export class DefaultExo {
    constructor(exoID, text, duration, timesAttempted = 0) {
        this.exoID = exoID
        this.text = text ? text : "The quick fox jumps over the lazy dog"
        this.duration = duration
        this.timesAttempted = timesAttempted
    }
}

export class CustomExo {
    constructor(text, duration) {
        this.text = text
        this.duration = duration
    }
}

export class ExerciseDone {
    constructor(date, exoID, wpm, acc, errors, duration) {
        this.date = date;
        this.wpm = wpm;
        this.exoID = exoID;
        this.acc = acc;
        this.errors = errors;
        this.duration = duration;
    }
}

export class Challenge {
    constructor(date, exoID, opponent, opponent_awpm, own_awpm) {
        this.date = date
        this.exoID = exoID
        this.opponent = opponent
        this.opponent_awpm = opponent_awpm
        this.own_awpm = own_awpm
    }
}

export class DB {
    constructor(users, exos) {
        this.users = users ? users : {} // Dict K: username V: User
        this.exos = exos ? exos : {} // Dict K: exoID V: ExerciseDone
        this.numExos = Object.keys(this.exos).length;
        this.numUser = Object.keys(this.users).length;
    }
    getUser(username) {
        return this.users[username]
    }
    getExo(exoID) {
        return this.exos[exoID]
    }
    addUser(user) {
        if (this.users[user.username] != undefined) {
            console.log(user, ` username "${user.username}" already existing`)
            return false
        } else {
            this.users[user.username] = user
            this.numUser++
            return true
        }
    }
    addExo(text, duration = 60000) {
        this.exos[++this.numExos] = new DefaultExo(this.numExos, text, duration)
    }
    authenticateUser(username, password) {
        let user = this.users[username]
        if (user) {
            console.log(user);
            console.log("Correct", user.password);

            if (password === user.password) {
                return user
            }
        }
        console.log("Inexisting user");

        return undefined
    }

}

let me = new User("Alex", "alex")
let her = new User("Paule", "paule")
let db = new DB()

db.addUser(me)
db.addUser(her)
me.perf.push(new ExerciseDone(Number(new Date()), 1, 22, 0.95, { 'a': 11 }, 60000))
db.addExo("Alex is a boy in ING 3 EN at IUSJC. He likes programming", 60000)
db.addExo(`Max saw a box. It was red. He had a key. Does it fit? He tried. It worked!

Inside the box, Max found a note. It said, "Find the cave." The map showed a path. Max felt brave. He grabbed his bag and left.

The trail was rocky, but Max kept going. He climbed a tall hill and looked around. In the distance, he saw a dark cave. “That must be the place,” he thought. Max walked for hours until he reached the entrance.

The cave was cold, damp, and silent—except for the sound of dripping water. Max used a flashlight (battery-powered) to explore. Suddenly, he saw a shiny object: a golden compass! The compass had strange symbols: @, #, &, and %. It pointed east, so Max followed.

“Who enters my cave?” a voice boomed. Startled, Max replied, “I’m just an explorer!”

“Then solve this riddle,” the voice said. “What is greater than gold, cannot be bought, but is free to give?”

Max thought hard. “Is it... friendship?”

“Correct!” the voice said. A hidden door opened, revealing a treasure chest. Inside were priceless gems and a scroll that read: Adventure is the true treasure. Share it with the world!

`, 60000 * 5)

db.addExo(`Sam had a map. The map was old. It led to a hill. On the hill was a hut. Can Sam find it?

Sam set off on the path. The day was hot. He felt the wind blow. As he walked, he saw the hut. It was small but looked safe.

Sam went inside the hut. The room was dark and quiet. On the table was a locked box. He found a note next to it. The note said to find a key.

Sam searched the hut for the key. He moved the rug and saw a trapdoor. Inside was a chest with strange symbols. It had letters and numbers like a1b2 and c3d4. Sam tried many codes until one worked.

Inside the chest was another map. It showed a cave deep in the forest. Sam packed his bag and set out. The trail was marked with symbols @, #, and &. He kept walking until he saw a glowing light.`, 60000 * 5)

db.addExo(`Sam had a box. The box was red. It had a lid.

He saw a key. The key was small. Does it fit?

Sam tried the key. The lid opened. Inside was a map.

The map was old. It showed a trail. The trail led to a hut.

Sam walked fast. The path was flat. He saw the hut.

The hut had a door. Sam pushed the door. It was dark inside.

He lit a lamp. The room had a table. On the table was a note.

The note said, "Find the code." The code opens the chest.

Sam looked for the chest. He moved the rug. Under the rug was a trapdoor.

Sam opened the trapdoor. A chest was there. The chest had symbols on it.

The symbols were letters and numbers: a1, b2, c3. What could they mean?

Sam thought hard. He tried the code b2c3a1. The chest clicked open.

Inside the chest was another note. This note had strange shapes.

The shapes were like @, &, and %. Sam needed a clue.

He checked the map again. The map pointed to a cave in the woods.

Sam packed his bag. He walked through the woods. The path was narrow and rough.

The trees were tall, and the air was cool. Sam kept going.

Finally, he saw the cave. It was dark and quiet.

Sam used a flashlight. The cave walls had drawings.

One drawing showed a sun. Another showed a key.

Sam found a stone door in the cave. On the door were buttons.

The buttons had symbols: @, #, $, %, and &.

Sam pressed the buttons in the order on the note: @, %, &, and #.

The door opened slowly. Behind it was a glowing crystal.

The crystal was bright and warm. It filled the cave with light.

Sam smiled. He had solved the mystery. The journey was the real prize.`, 60000 * 5)
console.log(db);

let jsonDB = JSON.stringify(db)
localStorage.setItem("DB", jsonDB)
console.log("JSON String: ", jsonDB)

jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)
db = new DB(jsonDB.users, jsonDB.exos)

console.log(db);
