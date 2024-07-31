import { set, get } from './idb-keyval.js';

const sketch = (s) => {

  let calendarStartDay;
  let canvasWidth = 400;
  let canvasHeight = 300;
  let monthLength;
  let events = [
    { day: -1, text: "Event" },
    { day: 0, text: "Another" },
    { day: 1, text: "More\nYet" },
    { day: 20, text: "Yet" },
  ]
  ;
  const dayFontsize = 12;
  const eventFontsize = 8;

  s.setup = () => {
    s.pixelDensity(1)
    const canvas = s.createCanvas(400, 300);
    canvas.elt.addEventListener("click", e => {
      s.saveCanvas('calendar', 'jpg')
    })
    s.frameRate(1);
    const main = document.querySelector("main")
    document.querySelector("#wrapper").appendChild(main)
  }

  s.drawCalendar = (events) => {
    s.background(255);
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    let dayHeadingHeight = 20;
    let cellWidth = canvasWidth / 7;
    let cellHeight = canvasHeight / 6;

    for (let i = 0; i < 7; i++) {
      s.fill(200);
      s.noStroke();
      s.fill(0);
      s.textFont(monoid, dayFontsize)
      s.textAlign(s.CENTER, s.CENTER);
      s.text(dayNames[i], i * cellWidth + cellWidth / 2, dayHeadingHeight / 2);
    }
    let x = 0;
    let y = dayHeadingHeight;
    let dayCounter = 1 - ((calendarStartDay - 1) % 7);

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (dayCounter >= 1 && dayCounter <= monthLength) { 
          s.fill(255);
          s.stroke(0);
          s.rect(x, y, cellWidth, cellHeight);
          s.fill(0);
          s.noStroke()
          s.textAlign(s.RIGHT, s.TOP);
          s.textFont(monoid, eventFontsize)
          s.text(dayCounter, x + cellWidth -2, y);
          s.textAlign(s.CENTER, s.TOP);
          s.stroke(0)
          for (let event of events) {
            if (event.day === dayCounter) {
              s.fill(0, 0, 0);
              s.noStroke()
              s.textFont(monoid, eventFontsize)
              // This 0.15 is a very magic number with the current font size
              s.text(event.text, x + cellWidth / 2, y + cellHeight * 0.15);
            }
          }
        } else {
          for (let event of events) {
            const outsideMonth = dayCounter <= 0 || dayCounter > monthLength
            if (event.day === dayCounter && outsideMonth) {
              s.noStroke()
              s.textFont(monoid, eventFontsize)
              s.text(event.text, x + cellWidth / 2, y + cellHeight * 0.25);
            }
          }
        }
        dayCounter++;
        x += cellWidth;
      }
      x = 0;
      y += cellHeight;
    }
  }

  const monthLengthDropdown = document.getElementById("month-length");
  const calendarStartDayDropdown = document.getElementById("calendar-start");

  get("list-of-events").then(evs => {
    console.log(evs)
    if(evs !== undefined){
      if (typeof evs === 'string') {
        events = eval(evs) // While migrating
      } else {
        events = evs;
      }
      s.eventsToInputs();
    } else {
      s.eventsToInputs();
    }
    addRow(events.length)
  })

  get("calendar-start").then(cs => {
    if(cs !== undefined){
      calendarStartDayDropdown.value = cs
    }
  })

  get("month-length").then(ml => {
    if(ml !== undefined){
      monthLengthDropdown.value = ml
    }
  })

  calendarStartDayDropdown.addEventListener("change", e => {
    set("calendar-start", calendarStartDayDropdown.value)
  })
  monthLengthDropdown.addEventListener("change", e => {
    set("month-length", monthLengthDropdown.value)
  })

  let monoid

  s.preload = () => {
    monoid = s.loadFont("src/Monoid-Retina.ttf")
  }

  function addIfLast(e) {
    console.log(e)
    const row = e.target.closest(".row")
    const id = row.id.replace("row-", "")
    const sibling = row.nextElementSibling
    console.log(sibling)
    if(!sibling){
      addRow(id+1)
    }
  }

  function addRow(id, day="", text=""){
    const holder = document.getElementById("inputs-holder")
    const rowDiv = document.createElement("div")
    rowDiv.id = `row-${id}` 
    rowDiv.classList.add("row")
    const dayInput = document.createElement("input")
    dayInput.classList.add("day")
    dayInput.type = "number"
    dayInput.value = day
    const eventInput = document.createElement("input")
    eventInput.classList.add("event")
    eventInput.value = text
    dayInput.addEventListener("input", e => s.inputsToEvents())
    eventInput.addEventListener("input", e => s.inputsToEvents())
    eventInput.addEventListener("input", e => addIfLast(e));
    const cross = document.createElement("div")
    cross.innerText = "❌"
    cross.classList.add("cross")
    cross.addEventListener("click", e => {
      const row = e.target.closest(".row");
      row.parentNode.removeChild(row); 
      s.inputsToEvents()
    })
    rowDiv.appendChild(dayInput)
    rowDiv.appendChild(eventInput)
    rowDiv.appendChild(cross)
    holder.appendChild(rowDiv)
  }

  s.eventsToInputs = () => {
    let count = 0
    for(let event of events){
      for(const text of event.text.split("\n")){
        addRow(count, +event.day, text)
        count++;
      }
    }
  }

  s.inputsToEvents = () => {
    const rows = Array.from(document.querySelectorAll(".row"))
    let eventsMap = {}
    for(let row of rows){
      const day = row.querySelector(".day").value
      const text = row.querySelector(".event").value
      if(day !== undefined && day !== "" && !Number.isNaN(+day)){
        if(eventsMap[+day] !== undefined){
          eventsMap[+day] += `\n${text}`
        } else {
          eventsMap[+day] = text
        }
      }
    }
    let events_ = []
    for(const day in eventsMap){
      let event_ = {}
      const text = eventsMap[day]
      event_.day = +day
      event_.text= text
      events_.push(event_)
    }
    events = events_
    set("list-of-events", events_)
  }

  s.draw = () => {
    try {
      monthLength = monthLengthDropdown.value;
      calendarStartDay = calendarStartDayDropdown.value;
    } catch(err) {
      monthLength = 30;
      events = []
    }
    s.drawCalendar(events);
  }

  s.keyPressed = () => {
    if (s.key === 's' || s.key === 'S') {
      s.saveCanvas('calendar', 'jpg');
    }
  }

}

p5.disableFriendlyErrors = true
let p5sketch = new p5(sketch)
