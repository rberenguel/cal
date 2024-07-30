import { set, get } from './idb-keyval.js';

const sketch = (s) => {

  let calendarStartDay;
  let canvasWidth = 400;
  let canvasHeight = 300;
  let monthLength;
  let events;
  const dayFontsize = 12;
  const eventFontsize = 10;

  s.setup = () => {
    s.pixelDensity(1)
    const canvas = s.createCanvas(400, 300);
    canvas.elt.addEventListener("click", e => {
      s.saveCanvas('calendar', 'jpg')
    })
    s.frameRate(1);
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
              s.text(event.text, x + cellWidth / 2, y + cellHeight * 1 / 4);
            }
          }
        } else {
          for (let event of events) {
            const outsideMonth = dayCounter <= 0 || dayCounter > monthLength
            if (event.day === dayCounter && outsideMonth) {
              s.noStroke()
              s.textFont(monoid, eventFontsize)
              s.text(event.text, x + cellWidth / 2, y + cellHeight * 1 / 4);
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

  const inputDiv = document.getElementById("input");
  const monthLengthDropdown = document.getElementById("month-length");
  const calendarStartDayDropdown = document.getElementById("calendar-start");
  const jsonString = () => inputDiv.innerText;
  
  get("list-of-events").then(evs => {
    if(evs !== undefined){
      inputDiv.innerText = evs
    }
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

  inputDiv.addEventListener("input", e => {
    set("list-of-events", jsonString())
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

  s.draw = () => {
    try {
      monthLength = monthLengthDropdown.value;
      calendarStartDay = calendarStartDayDropdown.value;
      events = eval(jsonString());
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
