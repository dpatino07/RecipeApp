const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById('search');


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
        
        meals.appendChild(meal);
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
    const mealIds = getMealsLocalStorage();

    for(let i=0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}

function addMealToFav(mealData) {

    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <li>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
    </li>
    <button class="clear"><i class="fas fa-window-close"></i></button>
        `;

        const btn = favMeal.querySelector('.clear');

        btn.addEventListener('click', () => {
            removeMealLocalStorage(mealData.idMeal);

            fetchFavMeals();
        });

        favoriteContainer.appendChild(favMeal);
}

/* SEARCH BUTTON FEATURE */
searchBtn.addEventListener("click", async () => {
    // Refresh Container
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});