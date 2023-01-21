const btn = document.getElementById("btn")

let numPressed = 0

btn.addEventListener("mousedown", () => {
    numPressed += 1
    if (numPressed <= 5) {
        alert(`Button pressed ${numPressed} times`)
    } else {
        btn.removeEventListener("mousedown")
    }
})