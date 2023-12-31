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
const filterCategoryEl = document.querySelector('#categoryFilter')

// Store the date.
const d = new Date()
const dateObject = {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate()
}

filterCategoryEl.addEventListener('change', function() {
    const selectedCategory = filterCategoryEl.value
    const listItems = document.querySelectorAll('#notesListing li')
    
    listItems.forEach(listItem => {
        const categoryClasses = listItem.classList

        if (selectedCategory === 'All Categories' || selectedCategory === 'Filter for category' || categoryClasses.contains(selectedCategory)) {
            listItem.style.display = 'block'
        } else {
            listItem.style.display = 'none'
        }
    })
    
})

// Listens for when the submit button is clicked, updates server, and resets form values.
submitButtonEl.addEventListener('click', async function() {
    
    const titleValue = titleEl.value.trim()
    const contentValue = contentEl.value.trim()

    if (titleValue === '' || contentValue === '') {
        alert('Title and content must be populated.')
    } else {
        try {
            // Updates the Firebase server with all of the form items that were submitted.
            await updateServer(titleEl.value, categoryEl.value, contentEl.value)
            resetValues()
        }
        catch (error) {
            console.error('Error updating server: ', error)
        }
    }
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

// Event listener that listens for change in database. 
// When change occurs, update listing in <ul> tag with all database items.
onValue(notesListingInDB, function(snapshot) {
    if (snapshot.exists()) {
        let notesArray = Object.entries(snapshot.val())
    
        listingEl.innerHTML = ""

        for (let i = notesArray.length - 1; i >= 0; i --) {
            let id = notesArray[i][0]
            let note = notesArray[i][1]
            
            let category = note.category
            let title = note.title
            let content = note.content

            let month = note.date.month
            let year = note.date.year
            let day = note.date.day

            // Updates the <ul> with all of list items from the database.
            updateListItem(id, title, category, content, month, day, year)
        }
    } else {
        listingEl.innerHTML = "No items"
    }
    addButtonListeners()
})

// Clears form values.
function resetValues() {
    categoryEl.selectedIndex = 0
    filterCategoryEl.selectedIndex = 0
    titleEl.value = ""
    contentEl.value = ""
}

// Function that creates new <li> element (with formatting) and appends to <ul> element.
function updateListItem(id, titleValue, categoryValue, contentValue, month, day, year) {
    let newEl = document.createElement('li')
    newEl.classList.add('border', 'rounded', 'px-3', 'pt-3', 'pb-2', 'mb-2', categoryValue)

    // Create first div (this will hold title and category).
    const div1 = document.createElement('div')
    div1.classList.add('mb-1', 'd-flex', 'justify-content-between')

    // Update title to first div.
    const titleP = document.createElement('p')
    titleP.classList.add('text-left', 'fw-bold')
    titleP.textContent = titleValue
    div1.appendChild(titleP)

    // Update category to first div.
    const categoryP = document.createElement('p')
    categoryP.classList.add('text-right', 'fw-bold')
    categoryP.textContent = categoryValue
    div1.appendChild(categoryP)

    // Update date.
    const dateP = document.createElement('p')
    dateP.classList.add('small', 'mb-1')
    dateP.textContent =  month + "/" + day + "/" + year

    // Update content.
    const contentP = document.createElement('p')
    contentP.classList.add('small', 'mb-2')
    contentP.textContent = contentValue

    // Update second div (edit and delete buttons).
    const div2 = document.createElement('div')
    div2.classList.add('d-flex', 'justify-content-between')

    // Create a link for editing and append it to the second <div>
    // const editButton = document.createElement('button')
    // editButton.classList.add('small', 'text-left', 'edit-button', 'button')
    // editButton.textContent = 'Edit'
    // div2.appendChild(editButton)

    // Create a link for deleting and append it to the second <div>
    const deleteButton = document.createElement('button')
    deleteButton.classList.add('small', 'text-left', 'delete-button', 'button')
    deleteButton.textContent = 'Delete'
    // Create a data-attribute so when clicked, we will know which item to delete.
    deleteButton.setAttribute('data-id', id)
    div2.appendChild(deleteButton)

    // Append <li> tag.
    newEl.append(div1)
    newEl.append(dateP)
    newEl.append(contentP)
    newEl.append(div2)

    // Append <ul> tag.
    listingEl.append(newEl)    
}

// Function add event listeners to every delete button (called in onValue event listener).
function addButtonListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button')

    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener('click', function() {
            const itemKey = deleteButton.getAttribute('data-id')
            if (itemKey) {
                let locationInDB = ref(database, `notesListing/${itemKey}`)
                remove(locationInDB)
                console.log("Item was deleted")
                resetValues()
            }
        })
    })

}


