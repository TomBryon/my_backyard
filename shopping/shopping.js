//bind components with UI

let shoppingList = $('#shopping-list');
let deleteAllButton = $('#delete-all-button');
let addDividerForm = $('#add-divider-form');
let addItemForm = $('#add-item-form');

let addItemCategorySelect = $('#add-item-category');

let editItemForm = $('#edit-item-form');
let editItemId = $('#edit-item-id');
let editItemName = $('#edit-item-name');
let editItemBlock = $('#edit-item-block');

let editCategoryForm = $('#edit-divider-form');
let editCategoryId = $('#edit-divider-id');
let editCategoryName = $('#edit-divider-name');
let editCategoryBlock = $('#edit-divider-block');

let buttonAddDivider = $('#button-add-divider')
let buttonAddItem = $('#button-add-item')
let buttonEditDivider = $('#button-edit-divider')
let buttonEditItem = $('#button-edit-item')


//register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log(
            'ServiceWorker registration successful with scope: ',
            registration.scope
        );
    });
}


//initialize state from cache
let cachedShoppingList = localStorage.getItem('shopping-list');

let shoppingListState = [];

if (cachedShoppingList) {
    shoppingListState = JSON.parse(cachedShoppingList);
}

//this cache tracks id after page reload
//so issued id is next to last id provided before page reload
let cachedIdState = localStorage.getItem('id-state');

let idState = {
    lastItemId: 0,
    lastCategoryId: 0,

    incrementAndGetItemId: function () {
        return ++this.lastItemId
    },

    incrementAndGetCategoryId: function () {
        return ++this.lastCategoryId
    }
}

if (cachedIdState) {
    let parsedIdState = JSON.parse(cachedIdState)
    idState.lastCategoryId = parsedIdState.lastCategoryId
    idState.lastItemId = parsedIdState.lastItemId
}

//handler for delete all button
deleteAllButton.click(() => {
    shoppingListState = [];
    localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
    renderComponents();
});

//submit add divider form
buttonAddDivider.click(() => {
    addDividerForm.submit()
})

//submit add item form
buttonAddItem.click(() => {
    addItemForm.submit()
})

//submit edit divider form
buttonEditDivider.click(() => {
    editCategoryForm.submit()
})

//submit edit item form
buttonEditItem.click(() => {
    editItemForm.submit()
})

//what happens when you try to add divider
addDividerForm.submit((ev) => {
    ev.preventDefault();
    let form = ev.target;
    let dividerName = form['add-divider-name'].value;
    if (!dividerName.trim()) {                              //dont let to add empty category
        alert('Dont try to add empty category');
    } else {
        let matchedCategories = shoppingListState.filter(
            (category) => category.divider === dividerName
        );
        if (matchedCategories.length > 0) {                 //dont let to add duplicate category
            alert('Category already exists!');
        } else {
            let id = idState.incrementAndGetCategoryId()
            let newCategory = {
                id: id,
                divider: dividerName,
                checked: false,
                items: [],
            };
            shoppingListState.push(newCategory);
            localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));       //update state
            localStorage.setItem('id-state', JSON.stringify(idState));
            renderComponents();                                                             //draw new state
        }
    }
    form.reset();
});

//what happens when you try to add item
addItemForm.submit((ev) => {
    ev.preventDefault();
    let form = ev.target;
    let name = form['add-item-name'].value;
    let categorySelect = form['add-item-category'];
    let categoryValue = categorySelect[categorySelect.selectedIndex].value;
    if (categoryValue) {
        addItem(name, categoryValue);
        localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
        localStorage.setItem('id-state', JSON.stringify(idState));
        form.reset()
        renderComponents();
    } else {
        alert('Category not selected')   //if you still don't have category created -> alert
    }
});

//add item to state
const addItem = (name, categoryValue) => {
    for (let i = 0; i < shoppingListState.length; i++) {
        if (shoppingListState[i].divider === categoryValue) {
            let id = idState.incrementAndGetItemId()
            let item = {
                id: id,
                name: name,
                checked: false,
            };
            shoppingListState[i].items.push(item);
        }
    }
};

//what happens when you try to edit category
editCategoryForm.submit((ev) => {
    ev.preventDefault();
    let form = ev.target;
    let id = form['edit-divider-id'].value;
    let name = form['edit-divider-name'].value;
    let category = findCategoryById(+id);
    category.divider = name;
    form.reset();
    localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
    renderComponents();
});

//what happens when you try to edit item
editItemForm.submit((ev) => {
    ev.preventDefault();
    let form = ev.target;
    let id = form['edit-item-id'].value;
    let name = form['edit-item-name'].value;
    let item = findItemById(+id);
    item.name = name;
    form.reset();
    localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
    renderComponents();
});


//those are render of pure html component with dynamic data
const dividerComponent = (category) => {
    return `
    <div>
        
        <h3>${category.divider}</h3>
        
        <div class="ui-btn-right">
            <a href="#Edit" class="ui-btn ui-btn-inline ui-corner-all ui-icon-edit ui-btn-icon-notext"
            onclick="editCategoryRequested(${category.id})">
                Edit
            </a>
            <button class="ui-btn ui-btn-inline ui-corner-all ui-icon-delete ui-btn-icon-notext" 
                onclick="deleteCategory(${category.id})">
                Delete
            </button>
        </div>

    </div>
`;
};

//delete category logic
const deleteCategory = (categoryId) => {
    shoppingListState = shoppingListState.filter(category => category.id !== categoryId);
    localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
    renderComponents();
}

//delete item logic
const deleteItem = (itemId) => {
    shoppingListState.forEach(
        category => category.items = category.items.filter(item => item.id !== itemId)
    )
    localStorage.setItem('shopping-list', JSON.stringify(shoppingListState));
    renderComponents();
}

//those are render of pure html component with dynamic data
const itemComponent = (item) => {
    return `
        <div>
            <span onclick="editItemRequested(${item.id})">${item.name}</span>
            <div class="ui-btn-right">
                <a href="#Edit" class="ui-btn ui-btn-inline ui-corner-all ui-icon-edit ui-btn-icon-notext"
                onclick="editItemRequested(${item.id})">
                    Edit
                </a>
                <button class="ui-btn ui-btn-inline ui-corner-all ui-icon-delete ui-btn-icon-notext" 
                    onclick="deleteItem(${item.id})">
                    Delete
                </button>
            </div>
        </div>
`;
};

//prepare edit item form with data from selected item
const editItemRequested = (itemId) => {
    let editItem = findItemById(itemId);
    editItemId.val(editItem.id);
    editItemName.val(editItem.name);
    window.location.href = '#edit-item-screen'
    editItemBlock.removeClass('invisible');
};

//prepare edit category form with data from selected category
const editCategoryRequested = (categoryId) => {
    let editCategory = findCategoryById(categoryId);
    editCategoryId.val(editCategory.id);
    editCategoryName.val(editCategory.divider);
    window.location.href = '#edit-divider-screen'
    editCategoryBlock.removeClass('invisible');
};

//util method for finding item by id in state
const findItemById = (id) => {
    for (let i = 0; i < shoppingListState.length; i++) {
        let items = shoppingListState[i].items;
        for (let j = 0; j < items.length; j++) {
            if (items[j].id === id) {
                return items[j];
            }
        }
    }
    console.error('unexpected');
};

//util method for finding category by id in state
const findCategoryById = (id) => {
    for (let i = 0; i < shoppingListState.length; i++) {
        if (shoppingListState[i].id === id) {
            return shoppingListState[i];
        }
    }
};

//those are render of pure html component with dynamic data
const categoryComponent = (category) => {
    let items = category.items
        .map((item) => `<li>${itemComponent(item, category.id)}</li>`)
        .join('');
    return `
        <div>
            ${dividerComponent(category)}
            <div class="items">
                <ul data-role="listview" data-inset="true" data-input="#rich-autocomplete-input" class="list-items">${items}</ul>
            </div>
        </div>
    `;
};

//those are render of pure html component with dynamic data
const shoppingListComponent = (shoppingListState) => {
    let shoppingList = shoppingListState
        .map((category) => `<li>${categoryComponent(category)}</li>`)
        .join('');
    return `${shoppingList}`;
};

//those are render of pure html component with dynamic data
const selectComponent = (shoppingListState) => {
    return shoppingListState
        .map((category) => category.divider)
        .map((divider) => `<option>${divider}</option>`)
        .join('');
};

//append prepared html to root shopping list
const renderComponents = () => {
    let html = shoppingListComponent(shoppingListState);
    shoppingList.html(html);
    let selectHtml = selectComponent(shoppingListState);
    addItemCategorySelect.html(selectHtml);
    addItemCategorySelect.selectmenu().selectmenu("refresh", true);
    shoppingList.listview().listview('refresh');
    $('.list-items').listview().listview('refresh');
};

//util method for unactive ui-btn after click, without it it is still active after clicked, which is painful
$('.ui-btn').on('touchend click', function () {
    let self = this;
    setTimeout(function () {
            $(self).removeClass("ui-btn-active");
        },
        1);
});

renderComponents();
