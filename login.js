import {DB} from "./model.js"

let jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)
let db = new DB(jsonDB.users, jsonDB.exos)

$("form").on("submit", function () {
    let username = $(".username")[0].value
    let password = $(".password")[0].value
    console.log(db.authenticateUser(username, password));
    let user = db.authenticateUser(username, password)
    if (user) {
        sessionStorage.setItem("user", JSON.stringify(user))
        $("body").css("transition", "all 1s ease")
            .css("transform", "translateX(100%)")
        
        setTimeout(function () {
            window.location.href = "dash.html"
        }, 1000)
        console.log(user);
        
    }
});