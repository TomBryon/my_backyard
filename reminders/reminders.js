let reminderList = $('#reminder-list')
let addForm = $('#add-form')
let editForm = $('#edit-form')
let buttonAdd = $('#button-add')
let buttonEdit = $('#button-edit')
let editId = $('#edit-id')
let editDay = $('#edit-day')
let editHours = $('#edit-hours')
let editMinutes = $('#edit-minutes')

const DAY_OF_WEEKS = {
    "Sun": 0,
    "Mon": 1,
    "Tue": 2,
    "Wed": 3,
    "Thu": 4,
    "Fri": 5,
    "Sat": 6
}

let reminderState = [
]


const addItem = (activity, day, hours, minutes) => {
    let entity = {              
        id: getRandomId(),
        activity: activity,
        day: day,
        hours: +hours,
        minutes: +minutes
    }
    reminderState = reminderState.concat(entity)        
    localStorage.setItem('reminderState', JSON.stringify(reminderState))  
    schedule(entity)                                                        
    render()                                                
    reminderList.listview().listview('refresh');            
}

const schedule = (entity) => {
    entity.notification = setTimeout(() => {
        new Notification(
            `Do ${entity.activity}`,
            {
                icon: '/img/icon.png',

            }
        )
        reschedule(entity)
    }, findClosestSchedule(entity))
}




const findClosestSchedule = (reminder) => {
    let currentDate = new Date()
    let currentDay = currentDate.getDay()
    let reminderDay = DAY_OF_WEEKS[reminder.day]
    let diffDay = reminderDay - currentDay >= 0 ? reminderDay - currentDay : 7 + (reminderDay - currentDay)
    if (diffDay === 0) {
        let assumedAlertTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            reminder.hours,
            reminder.minutes
        )
        let diff = assumedAlertTime - currentDate
        if (diff > 0) {
            return diff
        } else {
            return diff + (7 * 24 * 60 * 60 * 1000)
        }
    } else {
        let dateCopy = new Date(currentDate)
        let assumedDate = new Date(dateCopy.setDate(currentDate.getDate() + diffDay))
        let assumedAlertTime = new Date(
            assumedDate.getFullYear(),
            assumedDate.getMonth(),
            assumedDate.getDate(),
            reminder.hours,
            reminder.minutes
        )
        return assumedAlertTime - currentDate
    }
}


const reschedule = (entity) => {
    let interval = 1000 * 60 * 60 * 24 * 7
    console.log(interval)
    entity.notification = setTimeout(() => {
        new Notification(`Do ${entity.activity}`)
        reschedule(entity)
    }, interval)
}



const editItem = (id, activity, day, hours, minutes) => {
    reminderState = reminderState.map(item => {
            if (item.id === id) {
                item.activity = activity
                item.day = day
                item.hours = +hours
                item.minutes = +minutes
                clearTimeout(item.notification)     
                item.notification = schedule(item)
            }
            return item
        }
    )
    localStorage.setItem('reminderState', JSON.stringify(reminderState))  
    render()                           
    reminderList.listview().listview('refresh');  
}


const deleteItem = (id) => {
    let itemToDelete = reminderState.find(item => item.id === id)
    clearTimeout(itemToDelete.notification)                         
    reminderState = reminderState.filter(item => item.id !== id)
    localStorage.setItem('reminderState', JSON.stringify(reminderState))       
    render()                                                                    
    reminderList.listview('refresh')                                            
}

addForm.submit(ev => {
    ev.preventDefault()
    let form = ev.target
    let activity = form['activity'].value
    let day = form['add-day'].value
    let hours = form['hours'].value
    let minutes = form['minutes'].value
    addItem(activity, day, hours, minutes)
})


editForm.submit(ev => {
    ev.preventDefault()
    let form = ev.target
    let id = form['id'].value
    let activity = form['edit-activity'].value
    let day = form['edit-day'].value
    let hours = form['edit-hours'].value
    let minutes = form['edit-minutes'].value
    editItem(+id, activity, day, hours, minutes)
})

buttonAdd.click(() => {
    addForm.submit()
})

buttonEdit.click(() => {
    editForm.submit()
})


handleEdit = (id) => {
    let reminder = reminderState.find(item => item.id === id)
    editId.val(reminder.id)                                         
    $('input:radio[name=edit-activity]').each(function () {
        $(this).prop('checked', false);
        $(this).checkboxradio().checkboxradio("refresh")
    });
    let element = $("input[name=edit-activity][value=" + reminder.activity + "]")
    element.prop('checked', true);
    element.checkboxradio().checkboxradio("refresh")
    editDay.val(reminder.day).attr('selected', true).siblings('option').removeAttr('selected');     //expose day
    editDay.selectmenu().selectmenu("refresh", true);
    editHours.val(formatTime(reminder.hours))           
    editMinutes.val(formatTime(reminder.minutes))
}


const reminderListComponent = (reminderState) => {
    let list = reminderState.map(item => `<li>${reminderListItem(item)}</li>`).join('')
    return `${list}`
}

const reminderListItem = (itemProps) => {
    return `
        <h1>${itemProps.activity}</h1>
        <p>${itemProps.day}</p>
        <p class='ui-listview-item-aside'>
            <strong>${formatTime(itemProps.hours)}:${formatTime(itemProps.minutes)}</strong>
        </p>
        <div class="ui-btn-right">
            <a href="#Edit" class="ui-btn ui-btn-inline ui-corner-all ui-icon-edit ui-btn-icon-notext"
            onclick="handleEdit(${itemProps.id})">
                Edit
            </a>
            <button class="ui-btn ui-btn-inline ui-corner-all ui-icon-delete ui-btn-icon-notext" 
                onclick="deleteItem(${itemProps.id})">
                Delete
            </button>
        </div>
        `
}

const formatTime = (timeUnit) => {
    let stringTimeUnit = timeUnit.toString()
    if(stringTimeUnit.length === 1) {
        return `0${timeUnit}`
    }
    return stringTimeUnit
}

const getRandomId = () => {
    return Math.floor(Math.random() * 100000000)
}

const render = () => {
    reminderList.html(reminderListComponent(reminderState))
}

let savedItems = localStorage.getItem('reminderState')

if (savedItems) {
    reminderState = JSON.parse(savedItems)
    reminderState.forEach(item => schedule(item))
} else {
    reminderState = []
}

render()
