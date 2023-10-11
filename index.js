import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-d0536-default-rtdb.firebaseio.com/"
}

// Initialize Firebase server settings.
const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesListingInDB = ref(database, "notesListing")

// Elements to store.
const categoryEl = document.querySelector('#inputState')
const titleEl = document.querySelector('#formTitle')
const contentEl = document.querySelector('#formContent')
const submitButtonEl = document.querySelector('#submitButton')
const listingEl = document.querySelector('#notesListing')

// Store the date.
const d = new Date()
const dateObject = {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate()
}

onValue(notesListingInDB, function(snapshot) {
    if (snapshot.exists()) {
        let notesArray = Object.values(snapshot.val())

        // Don't forget to uncomment this ///////////////////////////////////////////////////////////////
        // listingEl.innerHTML = ""

        for (let i = notesArray.length - 1; i >= 0; i --) {
            let note = notesArray[i]
            
            let category = note.category
            let title = note.title
            let content = note.content

            let month = note.date.month
            let year = note.date.year
            let day = note.date.day

            // Updates the <ul> with all of list items from the database.
            updateListItem(title, category, content, month, day, year)
        }
    } else {
        listingEl.innerHTML = "No items"
    }
})

// Add an event listener to the submit button and run functions when submitted.
submitButtonEl.addEventListener('click', function() {
    
    // Updates the Firebase server with all of the form items that were submitted.
    updateServer(titleEl.value, categoryEl.value, contentEl.value)

    resetValues()
})

// Function that updates the server with a new listing object (from the form values).
function updateServer(titleValue, categoryValue, contentValue) {
    const listingObject = {
        title: titleValue,
        category: categoryValue,
        content: contentValue,
        date: dateObject
    }

    push(notesListingInDB, listingObject)
}

// Function that updates the listing with the newly added listing object (and clears form values).
function updateListItem(titleValue, categoryValue, contentValue, month, day, year) {

    let newEl = document.createElement('li')
    newEl.classList.add('border', 'rounded', 'p-3', 'mb-2')

    // Update title plus category.
    const titleP = document.createElement('p')
    titleP.classList.add('fw-bold')
    titleP.textContent = titleValue + ' - ' + categoryValue

    // Update date.
    const dateP = document.createElement('p')
    dateP.classList.add('small')
    dateP.textContent =  month + "/" + day + "/" + year

    // Update content.
    const contentP = document.createElement('p')
    contentP.classList.add('small')
    contentP.textContent = contentValue

    // Append <li> tag.
    newEl.append(titleP)
    newEl.append(dateP)
    newEl.append(contentP)

    // Append <ul> tag.
    listingEl.append(newEl)

    
}

// Clears form values.
function resetValues() {
    categoryEl.selectedIndex = 0
    titleEl.value = ""
    contentEl.value = ""
}

