document.addEventListener('DOMContentLoaded', () => {
    
    const isHomePage = document.getElementById('recipeGrid');
    const isDetailPage = document.getElementById('recipeDetail');

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.site-nav__list');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    if (isHomePage) {
        initHomePage();
    }

    if (isDetailPage) {
        initDetailPage();
    }
});


function initHomePage() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    fetchRecipes('chicken');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            fetchRecipes(searchInput.value);
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                fetchRecipes(searchInput.value);
            }
        });
    }

    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
    });

    const coursesDropdown = document.querySelector('.dropdown-control');
    const categoryFilters = document.querySelector('.category-filters');

    if (coursesDropdown && categoryFilters) {
        const coursesIcon = coursesDropdown.querySelector('i');
        coursesDropdown.addEventListener('click', () => {
            categoryFilters.classList.toggle('active');

            if (categoryFilters.classList.contains('active')) {
                if (coursesIcon) {
                    coursesIcon.classList.remove('fa-chevron-up');
                    coursesIcon.classList.add('fa-chevron-down');
                }
            } else {
                if (coursesIcon) {
                    coursesIcon.classList.remove('fa-chevron-down');
                    coursesIcon.classList.add('fa-chevron-up');
                }
            }
        });
    }
}

async function fetchRecipes(query = "") {
    const recipeGrid = document.getElementById('recipeGrid');
    if (!recipeGrid) return;

    recipeGrid.innerHTML = '<div class="loading-msg">Loading recipes...</div>';

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        recipeGrid.innerHTML = '<p class="error-msg">Failed to fetch recipes. Please try again later.</p>';
    }
}

async function filterByCategory(category) {
    const recipeGrid = document.getElementById('recipeGrid');
    if (!recipeGrid) return;

    if (category === "All" || category === "") {
        fetchRecipes('');
        return;
    }

    recipeGrid.innerHTML = `<div class="loading-msg">Loading ${category} recipes...</div>`;

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error("Error fetching category:", error);
        recipeGrid.innerHTML = '<p class="error-msg">Failed to load category.</p>';
    }
}

function displayRecipes(meals) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = "";
    if (!meals) {
        recipeGrid.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    meals.forEach(meal => {
        const card = document.createElement('article');
        card.classList.add('recipe-card');

        card.innerHTML = `
            <div class="recipe-card__image-wrapper">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-card__image">
            </div>
            <div class="recipe-card__content">
                <div class="recipe-card__tags">
                    ${meal.strCategory || 'Recipe'}
                </div>
                <h3 class="recipe-card__title">${meal.strMeal}</h3>
                <div class="recipe-card__see-recipe">SEE RECIPE</div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `recipe-detail.html?id=${meal.idMeal}`;
        });

        recipeGrid.appendChild(card);
    });
}

async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.getElementById('recipeTitle').textContent = "Recipe not found";
        return;
    }

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];

        if (meal) {
            renderRecipeDetail(meal);
        } else {
            document.getElementById('recipeTitle').textContent = "Recipe not found";
        }
    } catch (error) {
        console.error("Error fetching details:", error);
    }
}

function renderRecipeDetail(meal) {
    const titleEl = document.getElementById('recipeTitle');
    const heroImgEl = document.getElementById('recipeHeroImage');
    const categoryTag = document.querySelector('.recipe-category-tag');

    if (titleEl) titleEl.textContent = meal.strMeal;
    if (heroImgEl) {
        heroImgEl.src = meal.strMealThumb;
        heroImgEl.alt = meal.strMeal;
    }
    if (categoryTag) categoryTag.textContent = meal.strCategory || 'Recipe';

    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) {
        let ingredientsHTML = '';
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
                const measure = meal[`strMeasure${i}`] || "";
                ingredientsHTML += `<li>${measure} ${meal[`strIngredient${i}`]}</li>`;
            }
        }
        ingredientsList.innerHTML = ingredientsHTML;
    }

    const instructionsList = document.getElementById('instructionsList');
    if (instructionsList) {
        const steps = meal.strInstructions.split(/\r\n|\n|\r/).filter(step => step.trim().length > 0);
        instructionsList.innerHTML = steps.map((step, index) => `
            <div class="instruction-step" style="margin-bottom: 20px;">
                <h3 style="font-weight: 700; color: #8ebd41; margin-bottom: 5px;">Step ${index + 1}</h3>
                <p>${step}</p>
            </div>
        `).join('');
    }
    const nutritionFacts = document.getElementById('nutritionFacts');
    if (nutritionFacts) nutritionFacts.style.display = 'none'; 
}
