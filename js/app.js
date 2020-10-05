const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealInfoEl = document.getElementById('meal-info');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');

/* FUNCTION CALLS */
getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');

    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
            <div class="meal-header">
            ${ random ? `
                <span class="random">
                    Featured Recipe
                </span>` : ""}
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            </div>
            <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;

        const btn = meal.querySelector(".meal-body .fav-btn");

        btn.addEventListener("click", () => {
            if(btn.classList.contains('active')) {
                removeMealLocalStorage(mealData.idMeal)
                btn.classList.remove('active');
            }
            else {
                addMealLocalStorage(mealData.idMeal) 
                btn.classList.add('active');
            }

            fetchFavMeals();
        });
        
        mealsEl.appendChild(meal);
}

function addMealLocalStorage(mealId) {
    const mealIds = getMealsLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify ([...mealIds, mealId]));
}

function removeMealLocalStorage(mealId) {
    const mealIds = getMealsLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

/* FETCH THE MEALS */
async function fetchFavMeals() {
    // clear the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLocalStorage();

    for(let i=0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}

/* TRANSFER FEATURED MEALS TO FAVORITE MEALS */
function addMealToFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
        `;

        const btn = favMeal.querySelector('.clear');

        btn.addEventListener('click', () => {
            removeMealLocalStorage(mealData.idMeal);

            fetchFavMeals();
        });

        favMeal.addEventListener('click', () => {
            showMealInfo(mealData);
        });

        favoriteContainer.appendChild(favMeal);
}

/* MEAL INFORMATION DETAILS FOR POPUP */
function showMealInfo(mealData) {
    // clear meal info
    mealInfoEl.innerHTML = '';

    // update meal info
    const mealEl = document.createElement('div');
    
    // create array for ingredients
    const ingredients = [];
    // get ingredient and measurements
    for (let i = 1; i < 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(
                `${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]
                }`
            );
        }
        else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <p>${mealData.strInstructions}</p>
            <h3>INGREDIENTS: </h3>
            <ul>
            ${ingredients.map(ing => `
            <li>${ing}</li>
            `).join('')}
            </ul>
        `;

    mealInfoEl.appendChild(mealEl);

    // show popup
    mealPopup.classList.remove('hidden');
}

/* SEARCH BUTTON FEATURE */
searchBtn.addEventListener("click", async () => {
    // refresh container
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

/* CLOSE INGREDIENT POPUP SECTION */
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add("hidden");
});