var currentUser;

// Creates premade expense categories for the new user.
function addBudget(){
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            currentUser.collection("categories").limit(1).get().then(sub => {
                if (sub.docs.length == 0) {
                    currentUser.collection("categories").doc("Housing").set({
                        name: "Housing",
                        percentage: 0.35
                    }, {merge: true})    
                    currentUser.collection("categories").doc("Transportation").set({
                        name: "Transportation",
                        percentage: 0.15
                    }, {merge: true})
                    currentUser.collection("categories").doc("Food").set({
                        name: "Food",
                        percentage: 0.10
                    }, {merge: true})
                    currentUser.collection("categories").doc("Utilities").set({
                        name: "Utilities",
                        percentage: 0.10
                    }, {merge: true})
                    .then(() => {
                        console.log("Document succesfully written!");
                    })
                }
                getCategories();
            });
        } else {
            window.location.assign("index.html");
        }
    })
}
addBudget();

// Gets the categories from Firestore and displays them on the page
function getCategories() {
    let budgetTemplate = document.getElementById("budget-template");
    let budgetGroup = document.getElementById("budget-group");
    currentUser.collection("categories").get()
        .then(allCategories => {
            allCategories.forEach(doc => {
                var categoryName = doc.data().name; //gets the name field
                var categoryPercentage = doc.data().percentage * 100 + "%"; //gets the percentage field
                let budgetRow = budgetTemplate.content.cloneNode(true);
                budgetRow.querySelector('.category-name').innerHTML = categoryName;   //equiv getElementByClassName
                budgetRow.querySelector('.category-percent').innerHTML = categoryPercentage;  //equiv getElementByClassName
                budgetGroup.appendChild(budgetRow);
            });
        });
}

// Deletes the selected category from Firestore and from the page.
function deleteCategory(clicked) {
    var selected = clicked.parentNode;
    let documentName = selected.querySelector('.category-name').innerHTML;
    currentUser.collection("categories").doc(documentName).delete().then(() => {
        console.log("Document deleted!")
    })
    selected.remove();
}

// Adds a new, editable category to the page.
function addCategory() {
    let budgetTemplate = document.getElementById("edit-template");
    let budgetGroup = document.getElementById("budget-group");
    let budgetRow = budgetTemplate.content.cloneNode(true);
    budgetRow.querySelector('.category-name').innerHTML = "<input type=\"text\" pattern=\"[A-Za-z]{1,20}\" placeholder=\"Name\" required>";
    budgetRow.querySelector('.category-percent').innerHTML = "<input type=\"number\" pattern=\"[1-9]{1,3}\" placeholder=\"%\" required>";  
    budgetGroup.appendChild(budgetRow);
}

// Turns the static table row into an form to be edited.
function editCategory(clicked) {
    var selected = clicked.parentNode;
    let documentName = selected.querySelector('.category-name').innerHTML;
    let documentPercent = selected.querySelector('.category-percent').innerHTML;
    let budgetTemplate = document.getElementById("edit-template");
    currentUser.collection("categories").doc(documentName).get().then( () => {
        let budgetRow = budgetTemplate.content.cloneNode(true);
        budgetRow.querySelector('.category-name').innerHTML = "<input type=\"text\" pattern=\"[A-Za-z]{1,20}\" value=\"" + documentName + "\" required>";  
        budgetRow.querySelector('.category-percent').innerHTML = "<input type=\"number\" pattern=\"[1-9]{1,3}\" value=\"" + documentPercent + "\" required>";  
        selected.parentNode.replaceChild(budgetRow, selected);
    });
}

// Submits the selected category to Firestore and changes its display to static.
function submitCategory(clicked) {
    var selected = clicked.parentNode;
    let budgetTemplate = document.getElementById("budget-template");
    let documentName = selected.querySelector('.category-name').querySelector('input').value;
    let documentPercent = selected.querySelector('.category-percent').querySelector('input').value;
    currentUser.collection("categories").doc(documentName).set({
        name: documentName,
        percentage: documentPercent / 100
    }, {merge: true})
    let budgetRow = budgetTemplate.content.cloneNode(true);
    budgetRow.querySelector('.category-name').innerHTML = documentName;
    budgetRow.querySelector('.category-percent').innerHTML = documentPercent + "%";
    selected.parentNode.replaceChild(budgetRow, selected);
}